"""Subtítulos .srt: una frase por plano con los tiempos reales de la voz (y los ¡HUSS!)."""
import json, os
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); L = json.load(open(os.path.join(RAIZ, 'assets', 'linea.json')))
G = {str(p['plano']): p['texto'] for p in json.load(open(os.path.join(RAIZ, 'guion.json')))['planos']}
ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}"
items = []
for p in L['planos']:
    if p['palabras']: items.append((p['palabras'][0][0], p['palabras'][-1][1] + .25, G.get(p['id'], p['texto']).replace('…', '...')))
    for h in p['huss']: items.append((h, h + .45, '¡HUSS!'))
items.sort(); out = []
for i, (a, b, t) in enumerate(items):
    if i + 1 < len(items): b = min(b, items[i + 1][0] - .01)
    out.append(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{t}\n")
open(os.path.join(RAIZ, 'en-este-pueblo.srt'), 'w').write('\n'.join(out)); print(len(out), 'subtítulos')
