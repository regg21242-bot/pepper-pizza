"""Audio del mito del mosquito: voz + música ambiental nocturna (-20 dB bajo la voz) + efectos.
Lee los tiempos de compositions/film.html (const T). Escribe assets/audio/mezcla_sin_master.wav."""
import re, json, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
b = re.search(r"const T = (\{.*?\});", src, re.S).group(1)
b = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', b); b = re.sub(r"(?<![\d])\.(\d)", r"0.\1", b); T = json.loads(b)
C, DUR = T["cuts"], T["end"]
N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(8)
def read(path):
    with wave.open(path) as w: x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768; ch = w.getnchannels()
    x = x.reshape(-1, ch); return np.repeat(x, 2, axis=1) if ch == 1 else x
def place(bf, sig, t0, db=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0: return
    sig = sig[: N - i] * 10 ** (db / 20); bf[i:i + len(sig)] += sig
def st(x): return np.stack([x, x], axis=1)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
def env(pts): xs, ys = zip(*pts); return np.interp(t, xs, ys)
S = lambda n: read(P("assets/sfx", n))
fx = np.zeros((N, 2))
# zumbido de mosquito: ~600 Hz con vibrato; se acerca/aleja y pasa de un oído al otro
f = 600 + 40 * np.sin(2 * np.pi * 7 * t) + 25 * np.sin(2 * np.pi * .37 * t)
ph = 2 * np.pi * np.cumsum(f) / SR
buzz = np.sin(ph) + .5 * np.sin(2 * ph) + .25 * np.sin(3 * ph)
vol = env([(0, .0), (.3, .5), (T["posa"], .9), (T["posa"] + .5, .1), (C[0], .4), (C[1], .8), (C[1] + .3, .2), (C[2], .2), (C[2] + .3, .5), (C[3], .4), (C[4], .6), (C[5] - .5, 1.0), (C[5], .7), (C[6], .6), (C[6] + .3, .1), (C[7], .1), (C[7] + .3, .5), (C[8], .3), (C[8] + .3, 0), (DUR, 0)])
vol *= .6 + .4 * np.sin(2 * np.pi * .23 * t) ** 2
pan = np.sin(2 * np.pi * .19 * t)   # izquierda ↔ derecha, "cerca del oído"
fx += np.stack([buzz * vol * (1 - .8 * np.maximum(pan, 0)), buzz * vol * (1 + .8 * np.minimum(pan, 0))], axis=1) * .06
# tono suave en las ondas cian y grave en las rojas
def tono(t0, fr, d, db):
    x = tt(d); place(fx, st(np.sin(2 * np.pi * fr * x) * np.exp(-x / (d * .4)) * .4), t0, db)
for t0 in (C[2] + 1.0, T["aliento"], T["calor"], T["olor"]): tono(t0, 880, 1.0, -10)
tono(T["rojo"], 220, 1.4, -6); tono(T["rojo"] + .3, 165, 1.4, -8); tono(T["tacha"], 196, 1.0, -8)
# pops en badges y tarjetas
for tp in (.35, T["azucar"], T["comp"], T["diez"], T["co2"], T["ticket"], C[7] + .1): place(fx, S("pop.wav"), tp, -7)
place(fx, S("whoosh_corto.wav"), T["tacha"] - .05, -6)
for cc in C: place(fx, S("whoosh_corto.wav"), cc - .1, -16)
# tap y whoosh de enviado
for tp in (T["compartir"], T["contacto"]): place(fx, S("tic.wav"), tp, -4)
place(fx, S("tic.wav"), T["enviar"], -2); place(fx, S("whoosh.wav"), T["enviar"] + .08, -6)
x = tt(.5); place(fx, st((np.sin(2 * np.pi * 1318 * x) + np.sin(2 * np.pi * 1760 * x)) * np.exp(-x * 7) * .2), T["enviar"] + .15, -8)
# música ambiental nocturna: pad grave y campanitas lentas
chords = [(110, 130.8, 164.8, 196), (98, 123.5, 146.8, 185), (87.3, 110, 130.8, 164.8), (98, 123.5, 146.8, 196)]
mus = np.zeros(N); seg = 4.0
for k in range(int(DUR / seg) + 1):
    i = int(k * seg * SR); x = tt(seg + 1.2)
    pad = sum(np.sin(2 * np.pi * fr * x + .4 * np.sin(2 * np.pi * .25 * x)) for fr in chords[k % 4]) * np.minimum(1, x / 1.2) * np.minimum(1, np.maximum(0, seg + 1.2 - x) / 1.2)
    s2 = pad[: max(0, N - i)]; mus[i:i + len(s2)] += s2
for k in range(int(DUR / 1.5)):
    i = int(k * 1.5 * SR); x = tt(1.2); bell = np.sin(2 * np.pi * [659.3, 587.3, 523.3, 493.9][k % 4] * x) * np.exp(-x / .35) * .3; s2 = bell[: max(0, N - i)]; mus[i:i + len(s2)] += s2
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20)
e2 = lp(np.abs(voz[:, 0]), int(.2 * SR)); duck = 1 - .35 * np.clip(e2 / (np.percentile(e2[act], 50) + 1e-9), 0, 1)
mus *= duck[:, None]; fx *= (.7 + .3 * duck)[:, None]
fx *= 10 ** ((vdb - 12 - rms_db(fx)) / 20)
ends = np.ones(N); ends[-int(.8 * SR):] = np.linspace(1, 0, int(.8 * SR))
mix = (voz + mus + fx) * ends[:, None]
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
