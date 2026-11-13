"""Audio de "cables con helicóptero": voz + música ambiental de documental (-20 dB bajo la voz) + efectos.
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
N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(4)
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
# zumbido eléctrico (más fuerte en las tomas de cerca del cable)
hum = (np.sin(2 * np.pi * 120 * t) + .5 * np.sin(2 * np.pi * 240 * t) + .25 * np.sign(np.sin(2 * np.pi * 120 * t)) * .3) * (1 + .1 * np.sin(2 * np.pi * .7 * t))
crackle = (rs.random(N) < .0006) * rs.standard_normal(N); crackle = crackle - lp(crackle, 8)
hl = env([(0, 1), (C[0], 1), (C[0] + .3, .25), (C[1], .25), (C[1] + .3, 1), (C[6], 1), (C[6] + .3, .2), (C[7], .2), (C[7] + .3, 1), (DUR, 1)])
fx += st((hum * .05 + crackle * .4) * hl)
# viento
wind = lp(rs.standard_normal(N), 60) * 2.5 * (1 + .4 * np.sin(2 * np.pi * .13 * t)); fx += np.stack([wind, np.roll(wind, 2000)], axis=1) * .08
# aspas del helicóptero: golpes graves a ~18 Hz, más fuertes al acercarse
hk = env([(0, 0), (1.3, 0), (3.9, 1), (C[0], .6), (C[0] + .3, 0), (C[3], 0), (C[3] + .3, .35), (C[4], .35), (C[4] + .3, .7), (C[4] + 2.0, 1), (C[5], 1), (C[6], .8), (C[6] + .5, .35), (C[7] - .3, 0), (DUR, 0)])
ph = (t * 18) % 1; chop = np.exp(-ph * 10) * lp(rs.standard_normal(N), 25) * 3 + np.sin(2 * np.pi * 18 * t) * .3
fx += st(chop * hk * .25)
# chispa del gancho, arco fuerte, chispa del hilo
def zap(t0, d, db):
    x = tt(d); z = rs.standard_normal(len(x)) * (rs.random(len(x)) < .35) * np.exp(-x / (d * .5)) + np.sin(2 * np.pi * 90 * x) * np.exp(-x / d) * .6
    place(fx, st(z), t0, db)
zap(T["rompe"], .5, -6)
zap(T["arco"], 1.2, 0); place(fx, S("golpe.wav"), T["arco"], -6)
x = tt(1.2); place(fx, st(np.sin(2 * np.pi * (300 + 900 * x) * x) * np.exp(-x * 2) * .15), T["arco"] - .4, -10)   # zumbido que sube antes del arco
# manguito: clic metálico al apretar
place(fx, S("metal.wav"), T["manguito"][1], -6); place(fx, S("tic.wav"), T["manguito"][1] + .05, -4)
# "pop" suave cuando aparecen las etiquetas y el contador
for tp in (6.5, T["patas"], T["patas"] + .25, T["cero"], T["cero"] + .2, T["cuenta1"][0], T["cuenta2"][0], T["manguito"][0] + .3): place(fx, S("pop.wav"), tp, -12)
for c in C: place(fx, S("whoosh_corto.wav"), c - .1, -16)
# música ambiental de documental: pad suave y pulso lento
chords = [(110, 164.8, 220, 277.2), (98, 146.8, 196, 246.9), (87.3, 130.8, 174.6, 220), (98, 146.8, 196, 246.9)]
mus = np.zeros(N); seg = 4.0
for k in range(int(DUR / seg) + 1):
    a = k * seg; i = int(a * SR); x = tt(seg + 1.0)
    pad = sum(np.sin(2 * np.pi * f * x + np.sin(2 * np.pi * .3 * x) * .5) for f in chords[k % 4]) * np.minimum(1, x / 1.0) * np.minimum(1, np.maximum(0, (seg + 1.0 - x)) / 1.0)
    s2 = pad[: max(0, N - i)]; mus[i:i + len(s2)] += s2
for k in range(int(DUR / .75)):
    i = int(k * .75 * SR); x = tt(.5); pl = np.sin(2 * np.pi * (440 if k % 4 else 660) * x) * np.exp(-x / .12) * .25; s2 = pl[: max(0, N - i)]; mus[i:i + len(s2)] += s2
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20)
e2 = lp(np.abs(voz[:, 0]), int(.2 * SR)); duck = 1 - .35 * np.clip(e2 / (np.percentile(e2[act], 50) + 1e-9), 0, 1)
mus *= duck[:, None]; fx *= (.7 + .3 * duck)[:, None]
fx *= 10 ** ((vdb - 11 - rms_db(fx)) / 20)
# el final empata con el inicio (loop): fundido corto en los extremos
ends = np.ones(N); n0 = int(.15 * SR); ends[:n0] = np.linspace(0, 1, n0); ends[-n0:] = np.linspace(1, 0, n0)
mix = (voz + mus + fx) * ends[:, None]
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
