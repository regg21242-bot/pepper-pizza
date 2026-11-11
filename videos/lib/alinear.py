"""Alinea las palabras del guion con los tiempos de Whisper.

Uso: python3 alinear.py guion.json voz.json salida.json
Usa el texto exacto del guion y los tiempos de Whisper. Donde Whisper juntó, separó o
cambió palabras, reparte el tiempo de ese tramo entre las palabras del guion.
"""
import json, re, sys, difflib

g = json.load(open(sys.argv[1], encoding="utf-8"))["escenas"]
sw = [w for t in g for w in re.sub(r"\{([^|}]*)\|[^}]*\}", r"\1", t).replace("*", "").split()]
ww = json.load(open(sys.argv[2], encoding="utf-8"))["palabras"]
n = lambda x: re.sub(r"[^\wáéíóúñü]", "", x.lower())
sm = difflib.SequenceMatcher(a=[n(x) for x in sw], b=[n(x["palabra"]) for x in ww], autojunk=False)
out = [None] * len(sw)
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op == "equal":
        for k in range(a1 - a0): out[a0 + k] = dict(ww[b0 + k], palabra=sw[a0 + k])
    elif a1 > a0:
        if b1 > b0: s, e = ww[b0]["inicio"], ww[b1 - 1]["fin"]
        else:   # Whisper no las oyó: entre la palabra anterior y la siguiente
            s = ww[b0 - 1]["fin"] if b0 > 0 else 0.0
            e = ww[b0]["inicio"] if b0 < len(ww) else s + .3 * (a1 - a0)
        L = sum(len(x) for x in sw[a0:a1]); t = s
        for k in range(a0, a1):
            d = (e - s) * len(sw[k]) / L
            out[k] = {"palabra": sw[k], "inicio": round(t, 3), "fin": round(t + d, 3), "prob": 0.0}; t += d
        print("ajustado:", " ".join(sw[a0:a1]), "<-", " ".join(x["palabra"] for x in ww[b0:b1]))
json.dump({"palabras": out}, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "palabras alineadas")
