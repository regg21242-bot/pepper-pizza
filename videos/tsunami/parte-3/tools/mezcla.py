"""Mezcla de audio de la parte 2: voz + música de suspenso grave (-20 dB bajo la voz) + efectos.

Uso (desde la carpeta del proyecto):  python3 tools/mezcla.py
Lee los cortes y eventos de compositions/film.html (const T2 = {...}).
Escribe assets/audio/mezcla_sin_master.wav, musica.wav y efectos.wav.
"""
import json, re, wave, os
import numpy as np

SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
blk = re.search(r"const T3 = (\{.*?\});", src, re.S).group(1)
blk = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', blk); blk = re.sub(r"(?<![\d])\.(\d)", r"0.\1", blk)
T = json.loads(blk)
C, DUR = T["cuts"], T["end"]

N = int(DUR * SR); rs = np.random.default_rng(7)
t = np.arange(N) / SR
def buf(): return np.zeros((N, 2))
def st(x): return np.stack([x, x], axis=1)
def read(path):
    with wave.open(path) as w:
        n, ch = w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768
    x = x.reshape(-1, ch); return np.repeat(x, 2, axis=1) if ch == 1 else x
def place(b, sig, t0, db=0.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i] * 10 ** (db / 20)
    b[i:i + len(sig), 0] += sig[:, 0] * (1 - max(pan, 0)); b[i:i + len(sig), 1] += sig[:, 1] * (1 + min(pan, 0))
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
def hp(x, n): return x - lp(x, n)
def fade(x, a, r):
    q = np.arange(len(x)) / SR; d = len(x) / SR
    return x * np.minimum(q / max(a, 1e-3), 1) * np.minimum(np.maximum(d - q, 0) / max(r, 1e-3), 1)
def env(points):   # curva de volumen por tramos [(t, nivel), ...]
    xs, ys = zip(*points); return np.interp(t, xs, ys)
S = lambda name: read(P("assets/sfx", name))

voz = read(P("assets/voz/voz.wav"))[:N]; voz = np.pad(voz, ((0, N - len(voz)), (0, 0)))
fx = buf()
noise = rs.standard_normal(N)
outdoor = [(0, C[2]), (C[2], C[3]), (C[11], DUR)]   # escenas afuera (lluvia fuerte)
CS = [0] + C
def seg(i): return CS[i], (CS[i + 1] if i + 1 < len(CS) else DUR)

# --- lluvia constante, más fuerte afuera ---
rainL = hp(lp(rs.standard_normal(N), 3), 40); rainR = hp(lp(rs.standard_normal(N), 3), 40)
drops = (rs.random(N) < .0009) * rs.standard_normal(N) * 3; drops = hp(lp(drops, 4), 30)
rlev = np.full(N, .4)
for a, b in outdoor: rlev[(t >= a) & (t < b)] = 1.0
rlev = lp(rlev, int(.4 * SR))
fx += np.stack([rainL + drops, rainR + np.roll(drops, 400)], axis=1) * rlev[:, None] * .035

# --- toque suave del dedo en el botón ---
x = tt(.12); place(fx, st(fade(np.sin(2 * np.pi * 900 * x) * np.exp(-x / .02) * .4, .002, .05)), T["tap"], -8)
place(fx, S("pop.wav"), T["tap"] + .02, -10)

# --- portón: candado y rechinido al abrir y cerrar ---
def creak(t0, d, db):
    x = tt(d); sq = np.sin(2 * np.pi * (260 + 90 * np.sin(2 * np.pi * .9 * x)) * x) * (.6 + .4 * np.sin(2 * np.pi * 23 * x)) * .08
    place(fx, st(fade(sq, .1, .2)), t0, db)
def clank(t0, db=-8): place(fx, S("metal.wav"), t0, db); place(fx, S("tic.wav"), t0 + .02, db + 2)
a0 = C[0]
clank(a0 + .1); creak(a0 + .2, .55, -14); creak(a0 + 2.2, .6, -14); place(fx, S("golpe.wav"), a0 + 2.85, -10); clank(a0 + 2.9)
a0 = C[11]
clank(a0 + 2.6); creak(a0 + 2.8, 1.2, -12)
# --- chorro de agua en la cubeta ---
a0, a1 = C[4] + .2, C[5] - .2; x = tt(a1 - a0)
pour = (lp(rs.standard_normal(len(x)), 4) * .5 + lp(rs.standard_normal(len(x)), 25) * 1.5) * (1 + .2 * np.sin(2 * np.pi * 7 * x))
place(fx, st(fade(pour, .2, .4)), a0, -16)
# --- calle: corriente ---
a0, a1 = C[5] - .2, C[6] + .2; x = tt(a1 - a0)
flow = lp(rs.standard_normal(len(x)), 20) * 2.2 * (1 + .3 * np.sin(2 * np.pi * .9 * x)) + lp(rs.standard_normal(len(x)), 120) * 5
place(fx, st(fade(flow, .4, .5)), a0, -20)
# --- tic-tac acelerado ---
tk, step, k = C[6] + .1, .4, 0
while tk < C[7] - .05: place(fx, S("tic.wav" if k % 2 == 0 else "tac.wav"), tk, -6); k += 1; step = max(.07, step * .82); tk += step
# --- clics de linterna: tus tres señales (y el vecino al prenderla) ---
for d in T["mine"]: place(fx, S("tic.wav"), C[7] + d - .02, -4)
for d in T["theirs"]: x = tt(.25); place(fx, st(fade(np.sin(2 * np.pi * 1320 * x) * np.exp(-x / .08) * .15, .005, .1)), C[7] + d, -18)
place(fx, S("tic.wav"), C[11] + 1.9, -4)
# --- radio: estática y luego se aclara ---
a0 = C[8]; x = tt(1.4); stat = hp(rs.standard_normal(len(x)), 6) * np.linspace(1, .15, len(x))
place(fx, st(fade(stat * .2, .02, .3)), a0, -16); place(fx, st(fade(hp(rs.standard_normal(int(.2 * SR)), 4) * .5, .01, .08)), a0 + .1, -16)
# --- transiciones ---
for c in C: place(fx, S("whoosh_corto.wav"), c - .13, -16)
for tb in (53.45, 54.6, 56.1): place(fx, S("pop.wav"), tb + .05, -7)

# --- música de suspenso: dron grave y pulso lento ---
def tension():
    zones = [(0, C[0], .5), (C[0], C[2], .7), (C[2], C[5], .55), (C[5], C[6], .75), (C[6], C[7], .85), (C[7], C[8], .8), (C[8], C[9], .4), (C[9], C[10], 0), (C[10], C[12], .6), (C[12], DUR, .7)]
    v = np.full(N, .5)
    for a, b, k in zones: v[(t >= a) & (t < b)] = k
    return lp(v, int(.8 * SR))
ten = tension()
drone = np.sin(2 * np.pi * 41.2 * t) + .7 * np.sin(2 * np.pi * 55 * t + .2 * np.sin(2 * np.pi * .07 * t)) + .4 * np.sin(2 * np.pi * 61.7 * t) + .25 * np.sin(2 * np.pi * 82.4 * t)
low_str = sum(np.sin(2 * np.pi * f * t + 3 * np.sin(2 * np.pi * .15 * t + f)) for f in (110, 116.5, 164.8)) * (.6 + .4 * np.sin(2 * np.pi * .5 * t))
mus = drone * (.6 + .3 * ten) + low_str * .1 * ten ** 2
beat = 60 / 60
for k in range(int(DUR / beat)):
    tk = k * beat; kk = ten[min(N - 1, int(tk * SR))]
    if kk < .55: continue
    x = tt(.4); th = np.sin(2 * np.pi * (52 - 22 * x) * x) * np.exp(-x / .11)
    i = int(tk * SR); seg = th[: N - i] * kk; mus[i:i + len(seg)] += seg * 1.3
# abrazo: acordes cálidos (do mayor suave) que entran y se van despacio
wk = np.clip(np.interp(t, [C[8] + 2.5, C[9] - .2, C[10] + .5, C[11] - 1.0], [0, 1, 1, 0]), 0, 1)
warm = sum(np.sin(2 * np.pi * f * t) * (.6 + .4 * np.sin(2 * np.pi * .25 * t + f)) for f in (130.8, 164.8, 196, 261.6, 329.6)) * .25
mus = mus * (1 - .85 * wk) + warm * wk * 1.6
mus = st(mus)

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
active = np.abs(voz[:, 0]) > 10 ** (-40 / 20)
vdb = rms_db(voz[active])
mus *= 10 ** ((vdb - 18 - rms_db(mus)) / 20)                     # ~-20 dB bajo la voz (sonoridad)
v_env = np.convolve(np.abs(voz[:, 0]), np.ones(int(.25 * SR)) / int(.25 * SR), mode="same")
duck = (1 - .3 * np.clip(v_env / (np.percentile(v_env[active], 50) + 1e-9), 0, 1))[:, None]
mus *= duck; fx *= (.6 + .4 * duck)                               # los efectos también bajan un poco bajo la voz
ends = np.ones(N); ends[: int(.4 * SR)] = np.linspace(0, 1, int(.4 * SR)); ends[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
mus *= ends[:, None]; fx *= ends[:, None]
fx *= 10 ** (-4 / 20)
mix = voz + mus + fx

os.makedirs(P("assets/audio"), exist_ok=True)
for name, x in (("mezcla_sin_master.wav", mix), ("musica.wav", mus), ("efectos.wav", fx)):
    y = np.clip(x, -1, 1)
    with wave.open(P("assets/audio", name), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR, "s,", len(C), "cortes; voz", round(vdb, 1), "dB, música", round(rms_db(mus), 1), "dB")
