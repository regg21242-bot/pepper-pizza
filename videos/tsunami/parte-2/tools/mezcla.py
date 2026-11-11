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
blk = re.search(r"const T2 = (\{.*?\});", src, re.S).group(1)
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
outdoor = [(0, C[1]), (C[4], C[5]), (C[6], C[8]), (C[9], DUR)]   # escenas afuera (lluvia fuerte)

# --- lluvia: ruido brillante continuo, más fuerte afuera ---
rainL = hp(lp(rs.standard_normal(N), 3), 40); rainR = hp(lp(rs.standard_normal(N), 3), 40)
drops = (rs.random(N) < .0009) * rs.standard_normal(N) * 3; drops = hp(lp(drops, 4), 30)
rlev = np.full(N, .35)
for a, b in outdoor: rlev[(t >= a) & (t < b)] = 1.0
rlev = lp(rlev, int(.4 * SR))
rain = np.stack([rainL + drops, rainR + np.roll(drops, 400)], axis=1) * rlev[:, None] * .035
fx += rain

# --- alarma lejana: sirena que sube y baja, filtrada y suave ---
ph = 2 * np.pi * np.cumsum(620 + 230 * np.sin(2 * np.pi * t / 3.2)) / SR
siren = lp(np.sin(ph) + .3 * np.sin(2 * ph), 6) * env([(0, .8), (C[1], .8), (C[1] + .3, .2), (C[4], .25), (C[4] + .3, .9), (C[5], .9), (C[5] + .3, .15), (C[7], .2), (C[7] + .3, .5), (C[8], .5), (C[8] + .3, .1), (DUR, .2)])
fx += np.stack([siren, np.roll(siren, 900)], axis=1) * .035

# --- el agua que entra: rugido grave que crece con el frente ---
a0, a1 = C[0] - .3, C[1] + .4; x = tt(a1 - a0)
roar = lp(rs.standard_normal(len(x)), 45) * 3 + lp(rs.standard_normal(len(x)), 180) * 9
roar *= np.interp(x, [0, 1.6, 3.5, 6.0, a1 - a0], [.15, .5, 1.0, 1.1, .7])
place(fx, st(fade(roar, .3, .5)), a0, -15)
place(fx, S("retumbe.wav"), C[0] + 1.0, -12)
place(fx, S("whoosh.wav"), C[0] + .2, -9)
# coches arrastrados: golpes metálicos y raspones
for k, tk in enumerate([C[0] + 2.4, C[0] + 3.1, C[0] + 3.7, C[0] + 4.6, C[0] + 5.3]):
    place(fx, S("metal.wav"), tk, -14 + rs.random() * 3, rs.random() - .5)
    place(fx, S("golpe.wav"), tk + .05, -16, rs.random() - .5)
    x = tt(.7); scr = hp(lp(rs.standard_normal(len(x)), 2), 8) * np.sin(2 * np.pi * (900 + 300 * x) * x) * .2
    place(fx, st(fade(scr, .05, .3)), tk + .1, -16)

# --- calle inundada: corriente que corre y escombros que chocan ---
a0, a1 = C[4] - .3, C[5] + .3; x = tt(a1 - a0)
flow = lp(rs.standard_normal(len(x)), 20) * 2.2 * (1 + .3 * np.sin(2 * np.pi * .9 * x)) + lp(rs.standard_normal(len(x)), 120) * 5
place(fx, st(fade(flow, .4, .5)), a0, -19)
for tk in (C[4] + 1.1, C[4] + 2.7, C[4] + 4.2): place(fx, S("toc2.wav"), tk, -14, rs.random() - .5)

# --- celular: tecleo y el aviso de "no enviado" ---
k0, k1 = T["typing"]
for k in range(16): place(fx, S("tic.wav"), k0 + k * (k1 - k0) / 16, -16)
x = tt(.12); place(fx, st(fade(np.sin(2 * np.pi * 1200 * x) * .3, .005, .05)), T["sent"], -10)
for k in range(2):
    x = tt(.18); place(fx, st(fade(np.sin(2 * np.pi * 330 * x) * .35, .005, .05)), T["noSignal"] + k * .22, -8)

# --- radio: estática con voz lejana ininteligible ---
a0, a1 = C[2] - .1, C[3] + .2; x = tt(a1 - a0)
stat = hp(rs.standard_normal(len(x)), 6) * (.6 + .4 * (rs.random(len(x)) < .002).astype(float).cumsum() % 2)
mumble = lp(rs.standard_normal(len(x)), 30) * 6 * (np.sin(2 * np.pi * 3.5 * x) > 0) * np.sin(2 * np.pi * 180 * x)
place(fx, st(fade(stat * .15 + mumble * .08, .05, .2)), a0, -20)
place(fx, st(fade(hp(rs.standard_normal(int(.25 * SR)), 4) * .5, .01, .1)), C[2] - .05, -18)   # chasquido al prender

# --- reloj: tic-tac que acelera ---
a0, a1 = C[5], C[6]; tk, step = a0 + .15, .5; k = 0
while tk < a1 - .1:
    place(fx, S("tic.wav" if k % 2 == 0 else "tac.wav"), tk, -5); k += 1
    step = max(.09, step * .9); tk += step
# las olas segunda y tercera (lejos, a través de las paredes)
place(fx, S("retumbe.wav"), 32.5, -10); place(fx, S("retumbe.wav"), 34.0, -6)

# --- golpes metálicos en el portón ---
for i, k in enumerate(T["knocks"]):
    place(fx, S("metal.wav"), k, -6, .2); place(fx, S("golpe.wav"), k + .01, -8, .2)
    place(fx, S("toc.wav" if i % 2 == 0 else "toc2.wav"), k, -10, .2)

# --- candado: la mano del vecino ---
place(fx, S("metal.wav"), C[9] + 1.4, -12); place(fx, S("tic.wav"), C[9] + 1.45, -6)

# --- transiciones y botones ---
for c in C: place(fx, S("whoosh_corto.wav"), c - .13, -14)
for tb in (50.7, 52.1, 53.4): place(fx, S("pop.wav"), tb + .05, -6)

# --- música de suspenso: dron grave y pulso lento ---
def tension():
    zones = [(0, C[0], .4), (C[0], C[1], .9), (C[1], C[3], .6), (C[3], C[4], .5), (C[4], C[5], .8), (C[5], C[6], .9), (C[6], C[8], 1.0), (C[8], C[10], .85), (C[10], DUR, .7)]
    v = np.full(N, .4)
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
