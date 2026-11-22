"""Línea de tiempo v2 (≈75 s): pausas de 0.25 s entre frases (0.5 s antes de "Pero yo no", "Cincuenta puntos", "Nada"
y "La verdad, baila muy bien"), cortes a la mitad de cada pausa, ¡HUSS! en las pausas, planos de ≤ 3 s
(salvo el montaje 14 y la vista aérea 15). Los tiempos de palabra vienen de Whisper (assets/voz/palabras.json).
Cada ¡HUSS! es un grupo de 3 "hus" (0, 0.20, 0.39 s) = 3 botes cruzados del balón.
Salida: assets/linea.json y assets/linea.js (window.LINEA)"""
import json, os
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(RAIZ, 'guion.json'))); V = json.load(open(os.path.join(RAIZ, 'assets', 'voz', 'palabras.json')))
PAUSA, PAUSA_LARGA, LARGAS = .25, .5, {'13', '22', '31', '42'}
SEP = .6                        # entre grupos de ¡HUSS! seguidos
GOLPES = [0, .20, .39]          # los 3 "hus" de cada grupo (como en huss.py)
COLA_HUSS = .32                 # lo que dura el último "hus" de un grupo
HUSS = {'1': 1, '3': 2, '14a': 2, '14c': 1, '14b': 1, '21': 3, '32': 2, '44': 1}
# planos sin voz: lo que dura su contenido (s). Con ¡HUSS!, el contenido empieza después del último grupo.
SIN_VOZ = {'5': .7, '14c': .5, '14b': .25, '21': .7, '28': .3, '43': .75, '44': .8}
SUB = {'14': ['14a', '14c', '14b']}
# frases largas que se parten en dos tomas (corte en la pausa entre palabras)
PARTIR = {'27': ('27b', 'mientras'), '29': ('29b', 'y')}
planos = []
for p in G['planos']:
    n = str(p['plano'])
    if n in SUB:
        for k, sid in enumerate(SUB[n]): planos.append({'id': sid, 'plan': {'14a': 2.2, '14c': 1.6, '14b': 1.6}[sid], 'texto': p['texto'] if k == 0 else '', 'voz': n if k == 0 else None})
    else: planos.append({'id': n, 'plan': round(p['fin'] - p['ini'], 2), 'texto': p['texto'], 'voz': n if p['texto'] and n in V['dur'] else None})

t_fin = 0.0     # último sonido de la toma anterior (fin de palabra o del último "hus")
cortes, salida = [], []
for e in planos:
    n = e['id']; gap = PAUSA_LARGA if n in LARGAS else PAUSA
    corte = 0.0 if not salida else t_fin + gap / 2
    e['palabras'], e['huss'], e['voz_ini'], e['voz_dur'] = [], [], None, 0
    if e['voz']:
        w = V['palabras'][e['voz']]; w0 = (t_fin + gap) if salida else .15
        e['voz_ini'] = round(w0 - w[0][0], 3); e['voz_dur'] = V['dur'][e['voz']]
        e['palabras'] = [[round(e['voz_ini'] + a, 3), round(e['voz_ini'] + b, 3), x] for a, b, x in w]
        t_fin = e['voz_ini'] + w[-1][1]
    h0 = (t_fin + .14) if e['voz'] else (corte + .2)
    for g in range(HUSS.get(n, 0)): e['huss'].append(round(h0 + g * SEP, 3))
    if e['huss']: t_fin = e['huss'][-1] + GOLPES[-1] + COLA_HUSS - gap / 2
    if not e['voz']:
        base = t_fin if e['huss'] else corte
        t_fin = base + SIN_VOZ.get(n, .8)
    e['ini'] = round(corte, 3); salida.append(e)
# partir frases largas en dos tomas
final = []
for e in salida:
    final.append(e)
    if e['id'] in PARTIR:
        nid, palabra = PARTIR[e['id']]; ws = e['palabras']; k = next(i for i, w in enumerate(ws) if i > 0 and w[2].lstrip('…').lower().startswith(palabra))
        c = round((ws[k - 1][1] + ws[k][0]) / 2, 3)
        final.append({'id': nid, 'plan': 0, 'texto': '', 'voz': None, 'palabras': ws[k:], 'huss': [], 'voz_ini': None, 'voz_dur': 0, 'ini': c, 'parte_de': e['id']})
        e['palabras'] = ws[:k]
for i, e in enumerate(final):
    sig = final[i + 1]['ini'] if i + 1 < len(final) else round(t_fin + .35, 3)
    e['dur'] = round(sig - e['ini'], 3)
FIN = round(final[-1]['ini'] + final[-1]['dur'], 2)
paro = next(w[0] for e in final if e['id'] == '24' for w in e['palabras'] if w[2].startswith('par'))
for e in final: e['voz_id'] = e.pop('voz', None)
out = {'planos': final, 'fin': FIN, 'paro': paro, 'golpes': GOLPES}
json.dump(out, open(os.path.join(RAIZ, 'assets', 'linea.json'), 'w'), ensure_ascii=False, indent=0)
open(os.path.join(RAIZ, 'assets', 'linea.js'), 'w').write('window.LINEA = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print('total', FIN, 'paró en', paro)
for e in final: print(f"{e['id']:>4} plan {e['plan']:.2f}  real {e['dur']:.2f}  ini {e['ini']:6.2f}  huss {e['huss']}  {'>3!' if e['dur'] > 3 and e['id'] not in ('15', '14a', '14c', '14b') else ''}")
