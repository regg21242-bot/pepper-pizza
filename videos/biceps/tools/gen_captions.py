"""Genera compositions/captions.html (subtítulos karaoke arriba) a partir de las palabras de Whisper.

Uso: python3 tools/gen_captions.py palabras.json [--srt salida.srt]
palabras.json: [{"palabra": "¿Por", "inicio": 0.08, "fin": 0.58}, ...]  (formato de videos/lib/transcribir.py)
También acepta el JSON completo de transcribir.py (usa la clave "palabras").
"""
import json, sys, re, html, argparse

CLAVE = {"bíceps", "hilos", "cable", "solo", "sensible", "sensibles", "alarma"}
MAX_PAL = 6          # palabras por grupo (2 líneas máximo con letra de 66 px)
PAUSA = 0.15

ap = argparse.ArgumentParser(); ap.add_argument("palabras"); ap.add_argument("--srt"); ap.add_argument("--fin", type=float, default=60)
a = ap.parse_args()
data = json.load(open(a.palabras, encoding="utf-8"))
words = data["palabras"] if isinstance(data, dict) else data
words = [w for w in words if re.search(r"\w", w["palabra"])]

def limpia(p): return re.sub(r"[¿?¡!.,:;…\"']", "", p).lower()

# grupos: corta en punto, coma, pausa o límite de palabras
grupos, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    sig = words[i + 1] if i + 1 < len(words) else None
    fin_frase = re.search(r"[.?!:;,…]$", w["palabra"])
    largo = len(" ".join(x["palabra"] for x in cur)) + (len(sig["palabra"]) + 1 if sig else 0)
    if sig is None or len(cur) >= MAX_PAL or largo > 36 or fin_frase or sig["inicio"] - w["fin"] >= PAUSA and len(cur) >= 3:
        grupos.append(cur); cur = []

out = []
js = []
for gi, g in enumerate(grupos):
    g0 = max(0.0, g[0]["inicio"] - 0.08)
    nxt = grupos[gi + 1][0]["inicio"] - 0.08 if gi + 1 < len(grupos) else min(a.fin, g[-1]["fin"] + 0.8)
    g1 = max(g[-1]["fin"] + 0.05, nxt)
    gid = f"cg{gi}"
    spans = []
    for wi, w in enumerate(g):
        cls = "w key" if limpia(w["palabra"]) in CLAVE else "w"
        spans.append(f'<span id="{gid}w{wi}" class="{cls}">{html.escape(w["palabra"])}</span>')
        js.append((f"#{gid}w{wi}", w["inicio"] - g0, (g[wi + 1]["inicio"] - g0) if wi + 1 < len(g) else None, gid, cls.endswith("key")))
    out.append(f'    <div id="{gid}" class="clip cgroup" data-start="{g0:.3f}" data-duration="{g1 - g0:.3f}" data-track-index="0">{" ".join(spans)}</div>')

# cada grupo es un clip; los tiempos de las palabras son locales al grupo, pero la línea de tiempo es la de la composición:
tw = []
for sel, ws, wnext, gid, key in js:
    g0 = next(float(re.search(r'data-start="([\d.]+)"', l).group(1)) for l in out if f'id="{gid}"' in l)
    t = g0 + ws
    tw.append(f'tl.fromTo("{sel}", {{opacity:0, scale:1.12, color:"#FFFFFF"}}, {{opacity:1, scale:1, duration:0.12, ease:"power2.out"}}, {t:.3f});')
    if key:
        tw.append(f'tl.fromTo("{sel}", {{"--box":0}}, {{"--box":1, duration:0.2, ease:"power2.out"}}, {t:.3f});')
    if wnext is not None:
        tw.append(f'tl.to("{sel}", {{color:"rgba(255,255,255,0.5)", duration:0.12}}, {g0 + wnext:.3f});')

page = f'''<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cgroup {{ position: absolute; left: 0; top: 200px; width: 1080px; padding: 0 130px;
      text-align: center; font-family: Nunito, sans-serif; font-weight: 900; font-size: 66px; line-height: 1.22;
      color: #fff; overflow: visible; text-shadow: 0 4px 18px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.6); }}
    .w {{ display: inline-block; opacity: 0; position: relative; }}
    .w.key {{ --box: 0; }}
    .w.key::after {{ content: ""; position: absolute; left: -12px; right: -12px; top: 2px; bottom: 0;
      border: 3px solid rgba(255,255,255,0.95); border-radius: 14px; opacity: var(--box);
      box-shadow: 0 0 18px rgba(255,210,120,0.45); }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
{chr(10).join(out)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10) + "    ".join(tw)}
    window.__timelines["captions"] = tl;
  </script>
</template>
'''
open("compositions/captions.html", "w", encoding="utf-8").write(page)
print(f"{len(grupos)} grupos, {len(words)} palabras")

if a.srt:
    def ts(s):
        ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); se, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{se:02d},{ms:03d}"
    with open(a.srt, "w", encoding="utf-8") as f:
        for n, g in enumerate(grupos, 1):
            f.write(f"{n}\n{ts(g[0]['inicio'])} --> {ts(g[-1]['fin'])}\n{' '.join(w['palabra'] for w in g)}\n\n")
