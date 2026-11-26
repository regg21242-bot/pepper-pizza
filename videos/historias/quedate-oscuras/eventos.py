"""Eventos sincronizados (los usan las escenas y la mezcla de audio). Genera eventos.js y subs/eventos.json.
Uso: python3 eventos.py  (después de voz.py)"""
import json, re
T = json.loads(re.sub(r'^window\.T = |;\s*$', '', open('tiempos.js').read().strip()))
P = T['palabras']; E = T['escenas']
def pal(esc, w):
    for a, b, x, hl, e in P:
        if e == esc - 1 and re.sub(r'[^\wáéíóúñ]', '', x.lower()) == w: return a
    raise SystemExit(f'no encontré {w} en escena {esc}')
ev = {}
# Escena 12: 14 ventanas se apagan una por una; intervalos que se aceleran (0.7 → 0.25 s, escalados a la escena real);
# la última se apaga justo al empezar "oscuras".
n = 14; ult = pal(12, 'oscuras'); ini = E[11]['corte'] + .2
r = (.25 / .7) ** (1 / (n - 2)); gaps = [.7 * r ** k for k in range(n - 1)]; esc = (ult - ini) / sum(gaps)
t = ult; ts = [t]
for g in reversed(gaps): t -= g * esc; ts.append(t)
ev['apagados12'] = [round(x, 3) for x in sorted(ts)]
ev['escala12'] = round(esc, 3)
open('eventos.js', 'w').write('window.EV = ' + json.dumps(ev) + ';\n'); json.dump(ev, open('subs/eventos.json', 'w'), indent=1)
print(json.dumps(ev))
