"""Línea de tiempo: duración real de cada plano según la voz, inicio de cada frase, palabras (subtítulos) y golpes ¡HUSS!
Salida: assets/linea.json y assets/linea.js (window.LINEA)"""
import json, os
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(RAIZ, 'guion.json'))); V = json.load(open(os.path.join(RAIZ, 'assets', 'voz', 'palabras.json')))
SEP = .97                         # separación entre ¡HUSS! seguidos (como en la grabación)
PAUSA_LARGA = {13, 22, 31, 42}    # 0.7 s antes de "Pero yo no", "Cincuenta puntos", "Nada", "La verdad..."
SUB = {'14': [('14a', 2.2), ('14c', 1.6), ('14b', 1.6)]}
HUSS = {'1': 1, '3': 2, '14a': 2, '14c': 1, '14b': 1, '21': 3, '32': 2, '44': 1}
planos, t = [], 0.0
for p in G['planos']:
    n = str(p['plano']); plan = p['fin'] - p['ini']
    if n in SUB:
        for k, (sid, d) in enumerate(SUB[n]):
            e = {'id': sid, 'plan': d, 'texto': p['texto'] if k == 0 else ''}; planos.append(e)
        continue
    planos.append({'id': n, 'plan': plan, 'texto': p['texto']})
for e in planos:
    n = e['id']; base = n if n in V['dur'] and e['texto'] else None
    pre = .6 if n.isdigit() and int(n) in PAUSA_LARGA else (.06 if n in ('2', '3', '16') else .12)
    voz = V['dur'][base] if base else 0
    nh = HUSS.get(n, 0)
    if voz: h0 = pre + voz + .08
    else: h0 = .25
    if n == '44': h0 = .15
    golpes = [round(h0 + i * SEP, 3) for i in range(nh)]
    d = (pre + voz + .2) if voz else 0
    if golpes: d = max(d, golpes[-1] + .55)
    if n == '28': d = .6
    if n == '22': d = max(d, 2.4)       # desliz al VISITA 0
    if n == '24': d = max(d, (pre + voz) + .05)
    d = round(max(d if voz else e['plan'], 0.6), 2)
    e.update({'ini': round(t, 3), 'dur': d, 'voz_ini': round(t + pre, 3) if voz else None, 'voz_dur': voz,
              'palabras': [[round(t + pre + a, 3), round(t + pre + b, 3), w] for a, b, w in V['palabras'][base]] if base else [],
              'huss': [round(t + g, 3) for g in golpes]})
    t += d
FIN = round(t + 1.0, 2)   # cola: fundido a negro
paro = next(w[0] for e in planos if e['id'] == '24' for w in e['palabras'] if w[2].startswith('par'))
out = {'planos': planos, 'fin': FIN, 'paro': paro}
json.dump(out, open(os.path.join(RAIZ, 'assets', 'linea.json'), 'w'), ensure_ascii=False, indent=0)
open(os.path.join(RAIZ, 'assets', 'linea.js'), 'w').write('window.LINEA = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print('total', FIN, 'paró en', paro)
for e in planos: print(f"{e['id']:>4} plan {e['plan']:.2f}  real {e['dur']:.2f}  ini {e['ini']:.2f}  huss {e['huss']}")
