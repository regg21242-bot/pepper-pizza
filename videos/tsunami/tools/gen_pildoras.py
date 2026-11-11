"""Genera compositions/pildoras.html: cápsulas de acción "▶ texto" a media pantalla.
Uso: python3 tools/gen_pildoras.py pildoras.json   ([{"texto": "Te despiertas", "inicio": 3.2, "fin": 6.0}, ...])"""
import json, sys, html
P = json.load(open(sys.argv[1], encoding="utf-8"))
items, tw = [], []
for i, p in enumerate(P):
    d = p["fin"] - p["inicio"]
    items.append(f'    <div id="pl{i}" class="clip pwrap" data-start="{p["inicio"]:.2f}" data-duration="{d:.2f}" data-track-index="0"><div id="pl{i}c" class="pill"><span class="tri">▶</span><span>{html.escape(p["texto"])}</span></div></div>')
    tw.append(f'tl.fromTo("#pl{i}c", {{opacity:0, scale:.6, y:30}}, {{opacity:1, scale:1, y:0, duration:.45, ease:"back.out(2.2)"}}, {p["inicio"]:.2f});')
    tw.append(f'tl.to("#pl{i}c", {{opacity:0, y:-12, duration:.3, ease:"power2.in"}}, {p["fin"] - .32:.2f});')
page = f'''<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .pwrap {{ position: absolute; left: 0; top: 1020px; width: 900px; display: flex; justify-content: center; }}
    .pill {{ display: inline-flex; align-items: center; gap: 22px; padding: 22px 40px 22px 32px; border-radius: 999px;
      background: rgba(12,12,20,0.82); border: 4px solid #FFC93C; color: #fff; font-family: Nunito, sans-serif; font-weight: 900;
      font-size: 50px; line-height: 1; box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 24px rgba(255,201,60,0.25); }}
    .tri {{ color: #FFC93C; font-size: 40px; }}
  </style>
  <div id="root" data-composition-id="pildoras" data-width="1080" data-height="1920">
{chr(10).join(items)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {(chr(10) + "    ").join(tw)}
    window.__timelines["pildoras"] = tl;
  </script>
</template>
'''
open("compositions/pildoras.html", "w", encoding="utf-8").write(page)
print(len(P), "píldoras")
