"""Mezcla de audio del video del tsunami: voz + música de suspenso + efectos.

Uso (desde la carpeta del proyecto):  python3 tools/mezcla.py
Lee los tiempos de eventos de compositions/film.html (const T = {...}) y los cortes de escena (const SC).
Escribe assets/audio/mezcla_sin_master.wav, musica.wav y efectos.wav.
"""
import json, re, wave, os
import numpy as np

SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
DUR = float(re.search(r'data-duration="([\d.]+)"', src).group(1))
blk = re.search(r"const T = (\{.*?\n    \});", src, re.S).group(1)
blk = re.sub(r"//[^\n]*", "", blk); blk = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', blk); blk = re.sub(r",\s*}", "}", blk); blk = re.sub(r"(?<![\d])\.(\d)", r"0.\1", blk)
T = json.loads(blk)
CUTS = [float(x) for x in re.findall(r"\{ a: ([\d.]+), b:", src)][1:]

N = int(DUR * SR); rs = np.random.default_rng(5)
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
def fade(x, a, r):
    t = np.arange(len(x)) / SR; d = len(x) / SR
    return x * np.minimum(t / max(a, 1e-3), 1) * np.minimum(np.maximum(d - t, 0) / max(r, 1e-3), 1)
S = lambda name: read(P("assets/sfx", name))

voz = read(P("assets/voz/voz.wav"))[:N]; voz = np.pad(voz, ((0, N - len(voz)), (0, 0)))
fx = buf()

# --- temblor: retumbe grave + traqueteo de muebles ---
d = T["shake"][1] - T["shake"][0]; x = tt(d)
rumble = lp(lp(rs.standard_normal(len(x)), 300), 200) * 18 * (1 + .4 * np.sin(2 * np.pi * 3 * x))
place(fx, st(fade(rumble, .4, .8)), T["shake"][0], -17)
place(fx, S("retumbe.wav"), T["shake"][0], -13)
for k in range(28):
    tk = T["shake"][0] + .3 + k * .15 + rs.random() * .08
    if tk < T["shake"][1] - .5: place(fx, S("tac.wav"), tk, -16 + rs.random() * 4, rs.random() - .5)

# --- alerta del celular: doble tono alternado ---
for k in range(6):
    x = tt(.32); f = 853 if k % 2 == 0 else 960
    tone = (np.sin(2 * np.pi * f * x) + .5 * np.sin(2 * np.pi * f * 2 * x)) * .25
    place(fx, st(fade(tone, .005, .03)), T["alert"] + k * .36, -10, .15)

# --- vibración del celular ---
def vib(d=.38):
    x = tt(d); return st(fade(np.sign(np.sin(2 * np.pi * 150 * x)) * (.5 + .5 * np.sin(2 * np.pi * 25 * x)) * .12, .01, .04))
for v in [T["msg1"] - .25] + T["vib"]:
    place(fx, vib(), v, -10); place(fx, vib(), v + .5, -12)

# --- toquido en la puerta y la puerta que se abre ---
for i, k in enumerate(T["knock"]): place(fx, S("toc.wav" if i % 2 == 0 else "toc2.wav"), k, -1)
creak = tt(1.0); cr = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 1.3 * creak)) * creak) * (rs.random(len(creak)) < .5) * .12
place(fx, st(fade(lp(cr, 8), .1, .4)), T["doorOpen"][0], -14)

# --- motor de la camioneta (costa y subida) ---
a0, a1 = 29.3, 41.9; x = tt(a1 - a0)
eng = (np.sin(2 * np.pi * 48 * x) + .6 * np.sin(2 * np.pi * 96 * x + np.sin(2 * np.pi * 7 * x)) + .3 * lp(rs.standard_normal(len(x)), 40)) * (.8 + .2 * np.sin(2 * np.pi * 9 * x))
place(fx, st(fade(eng * .2, 1.0, 1.0)), a0, -10)

# --- el mar que se retira: oleaje que se aleja y se apaga ---
a0, a1 = T["seaOut"][0] - .6, T["seaOut"][1] + 1.5; x = tt(a1 - a0)
surf = lp(rs.standard_normal(len(x)), 12) * (1 + .6 * np.sin(2 * np.pi * .7 * x)) * np.linspace(1, .05, len(x)) ** 1.5
place(fx, st(fade(surf * .8, .3, .6)), a0, -8, -.2)
place(fx, S("whoosh.wav"), T["seaOut"][0] - .2, -10)

# --- oleaje lejano y la línea blanca ---
a0, a1 = T["line"][0] - .5, T["line"][1] + .3; x = tt(a1 - a0)
roar = lp(rs.standard_normal(len(x)), 60) * np.linspace(.3, 1, len(x)) * 2.5
place(fx, st(fade(roar, .5, .4)), a0, -12)

# --- reloj: tic-tac en cada segundo que se ve el reloj ---
for k in range(7):   # 44.2 … 50.2, al ritmo del segundero
    place(fx, S("tic.wav" if k % 2 == 0 else "tac.wav"), 44.2 + k, -6)
for k in range(2): place(fx, S("tic.wav" if k % 2 == 0 else "tac.wav"), 60.5 + k, -5)
for k in range(3): place(fx, S("tac.wav"), 61.3 + k * .5, -12)   # pasos de tensión

# --- candado ---
place(fx, S("metal.wav"), T["lock"], -15); place(fx, S("golpe.wav"), T["lock"], -11)
place(fx, S("tic.wav"), T["lock"] + .02, -2)
# portón metálico rechinando al cerrar
x = tt(T["gateClose"][1] - T["gateClose"][0]); sq = np.sin(2 * np.pi * (300 + 120 * np.sin(2 * np.pi * .8 * x)) * x) * .08
place(fx, st(fade(sq, .2, .3)), T["gateClose"][0], -14)

# --- whoosh en los movimientos de cámara entre escenas ---
for c in CUTS: place(fx, S("whoosh_corto.wav"), c - .13, -13)
for c in (T["cityRed"][0] - .2, 39.2, 50.9, 64.6): place(fx, S("whoosh.wav"), c - .44, -11)
# botones de elección
for tb in (64.7, 65.6, 67.2): place(fx, S("pop.wav"), tb + .05, -6)

# --- música de suspenso: dron grave + pulso + cuerdas que suben con la tensión ---
def tension(t):
    zones = [(5.3, 12.0, .7), (12.0, 16.2, .4), (16.2, 25.2, .55), (25.2, 29.5, .1), (29.5, 39.2, .95), (39.2, 50.9, .45), (50.9, 54.3, .9), (54.3, 64.6, 1.0), (64.6, DUR, .8)]
    v = np.full_like(t, .3)
    for a, b, k in zones:
        m = (t >= a) & (t < b); v[m] = k
    return lp(v, int(.8 * SR))
t = np.arange(N) / SR; ten = tension(t)
drone = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .35 * np.sin(2 * np.pi * 110 * t + .3 * np.sin(2 * np.pi * .1 * t)))
strings = sum(np.sin(2 * np.pi * f * t + 4 * np.sin(2 * np.pi * .2 * t + f)) for f in (220, 233.1, 329.6, 349.2)) * (.5 + .5 * np.sin(2 * np.pi * 6 * t))
mus = drone * (.5 + .3 * ten) + strings * .12 * ten ** 2
beat = 60 / 72
for k in range(int(DUR / beat)):
    tk = k * beat
    kk = ten[min(N - 1, int(tk * SR))]
    if kk < .5: continue
    x = tt(.35); th = np.sin(2 * np.pi * (60 - 30 * x) * x) * np.exp(-x / .09)
    i = int(tk * SR); seg = th[: N - i] * kk; mus[i:i + len(seg)] += seg * 1.4
    if kk > .8:
        i2 = int((tk + .28) * SR); seg2 = th[: max(0, N - i2)] * kk * .7; mus[i2:i2 + len(seg2)] += seg2 * 1.2
# el flashback (recuerdo cálido): música más suave
warm = (t >= 25.0) & (t < 29.7)
mus[warm] *= .45
mus = st(mus)

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
active = np.abs(voz[:, 0]) > 10 ** (-40 / 20)
vdb = rms_db(voz[active])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20)
mus *= (1 + .5 * (ten - .3))[:, None]           # sube en escenas rojas (hasta ~+3 dB)
v_env = np.convolve(np.abs(voz[:, 0]), np.ones(int(.25 * SR)) / int(.25 * SR), mode="same")
mus *= (1 - .3 * np.clip(v_env / (np.percentile(v_env[active], 50) + 1e-9), 0, 1))[:, None]
ends = np.ones(N); ends[: int(.6 * SR)] = np.linspace(0, 1, int(.6 * SR)); ends[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mus *= ends[:, None]
mix = voz + mus + fx

os.makedirs(P("assets/audio"), exist_ok=True)
for name, x in (("mezcla_sin_master.wav", mix), ("musica.wav", mus), ("efectos.wav", fx)):
    y = np.clip(x, -1, 1)
    with wave.open(P("assets/audio", name), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR, "s,", len(CUTS), "cortes; voz", round(vdb, 1), "dB")
