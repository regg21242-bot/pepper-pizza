"""Audio del video "Gracias por los 100": tics que suben de tono con cada número, música alegre que crece,
explosión de confeti al llegar a 100 y la voz de Álvaro. Escribe assets/audio/mezcla_sin_master.wav."""
import re, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
g = lambda k: float(re.search(k + r": ([\d.]+)", src).group(1))
C0, C1, VOZ, DUR = g("c0"), g("c1"), g("voz"), g("end")
N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(3)
def read(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768; ch = w.getnchannels()
    x = x.reshape(-1, ch); return np.repeat(x, 2, axis=1) if ch == 1 else x
def place(b, sig, t0, db=0.0):
    i = int(round(t0 * SR)); sig = sig[: max(0, N - i)] * 10 ** (db / 20); b[i:i + len(sig)] += sig
def st(x): return np.stack([x, x], axis=1)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
S = lambda n: read(P("assets/sfx", n))
fx = np.zeros((N, 2))
# --- un "blip" por cada número, cada vez más agudo ---
prev = 1
for k in range(1, int((C1 - C0) * SR) + 2, 48):
    tk = C0 + k / SR; n = 1 + int(99 * min(1, (tk - C0) / (C1 - C0)) ** 1.8 + 1e-6)
    if n != prev:
        prev = n; x = tt(.05); f = 420 * 2 ** (n / 40)
        place(fx, st(np.sin(2 * np.pi * f * x) * np.exp(-x / .015) * .5), tk, -12)
# --- subida (riser) durante la cuenta ---
x = tt(C1 - C0); f = 200 + 1600 * (x / x[-1]) ** 2
riser = (lp(rs.standard_normal(len(x)), 3) * .3 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .15) * (x / x[-1]) ** 2
place(fx, st(riser), C0, -14)
# --- ¡100!: golpe, explosión de confeti, chispas ---
place(fx, S("golpe.wav"), C1, -2); place(fx, S("whoosh.wav"), C1 - .35, -6)
x = tt(1.2); burst = lp(rs.standard_normal(len(x)), 2) * np.exp(-x / .25)
place(fx, np.stack([burst, np.roll(burst, 300)], axis=1) * .5, C1, -6)
for k in range(14): place(fx, S("pop.wav"), C1 + .05 + k * .07 + rs.random() * .05, -14 + rs.random() * 4)
for k, f in enumerate([1046.5, 1318.5, 1568, 2093]):   # campanita de logro
    x = tt(.8); place(fx, st(np.sin(2 * np.pi * f * x) * np.exp(-x / .25) * .25), C1 + .05 + k * .08, -8)
# --- música: pulso alegre que se acelera, y fiesta después del 100 ---
mus = np.zeros(N); bpm = 128; beat = 60 / bpm
chords = [(261.6, 329.6, 392), (220, 261.6, 329.6), (174.6, 220, 261.6), (196, 246.9, 392)]
for b in range(int(DUR / beat) + 1):
    tb = b * beat; i = int(tb * SR)
    if i >= N: break
    party = tb >= C1; build = min(1, max(0, (tb - C0) / (C1 - C0)))
    x = tt(.3); kick = np.sin(2 * np.pi * (110 * np.exp(-x * 20) + 45) * x) * np.exp(-x / .12)
    seg = kick[: N - i]; mus[i:i + len(seg)] += seg * (1.0 if party else .35 + .5 * build)
    if party or build > .5:
        x = tt(.06); hat = rs.standard_normal(len(x)) * np.exp(-x / .01) * .25
        j = int((tb + beat / 2) * SR); seg = hat[: max(0, N - j)]; mus[j:j + len(seg)] += seg
    ch = chords[(b // 4) % 4]; x = tt(beat * .95)
    pad = sum(np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x) for f in ch) * np.exp(-x / .5) * .12
    seg = pad[: N - i]; mus[i:i + len(seg)] += seg * (1.0 if party else .5 + .5 * build)
    if party:   # bajo
        x = tt(beat * .9); bass = np.sin(2 * np.pi * ch[0] / 2 * x) * np.exp(-x / .3) * .4; seg = bass[: N - i]; mus[i:i + len(seg)] += seg
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/audio/voz.wav")); place(voz, v, VOZ)
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 9 - rms_db(mus)) / 20)          # música presente (es un video de festejo)
duck = np.ones(N); env = lp(np.abs(voz[:, 0]), int(.2 * SR)); duck -= .55 * np.clip(env / (np.percentile(env[act], 50) + 1e-9), 0, 1)
mus *= duck[:, None]
ends = np.ones(N); ends[-int(.8 * SR):] = np.linspace(1, 0, int(.8 * SR)); ends[: int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
mix = (voz + mus + fx) * ends[:, None]
os.makedirs(P("assets/audio"), exist_ok=True)
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
