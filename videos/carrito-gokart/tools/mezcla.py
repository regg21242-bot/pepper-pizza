"""Audio del carrito go-kart: voz + música urbana juguetona (-20 dB bajo la voz) + efectos.
Lee los tiempos de compositions/film.html (const T y TXT). Escribe assets/audio/mezcla_sin_master.wav."""
import re, json, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
def js_obj(name):
    b = re.search(r"const " + name + r" = (\{.*?\});", src, re.S).group(1)
    b = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', b); b = re.sub(r"(?<![\d])\.(\d)", r"0.\1", b); return json.loads(b)
T = js_obj("T"); C, DUR = T["cuts"], T["end"]
txt_t = [float(x) for x in re.findall(r"\[(\d+\.?\d*), '", src.split("const TXT = ")[1].split("];")[0])]
N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(9)
def read(path):
    with wave.open(path) as w: x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768; ch = w.getnchannels()
    x = x.reshape(-1, ch); return np.repeat(x, 2, axis=1) if ch == 1 else x
def place(b, sig, t0, db=0.0, pan=0.0):
    i = int(round(t0 * SR));
    if i >= N: return
    sig = sig[: N - i] * 10 ** (db / 20); b[i:i + len(sig), 0] += sig[:, 0] * (1 - max(pan, 0)); b[i:i + len(sig), 1] += sig[:, 1] * (1 + min(pan, 0))
def st(x): return np.stack([x, x], axis=1)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
def fade(x, a, r): q = np.arange(len(x)) / SR; d = len(x) / SR; return x * np.minimum(q / max(a, 1e-3), 1) * np.minimum(np.maximum(d - q, 0) / max(r, 1e-3), 1)
S = lambda n: read(P("assets/sfx", n))
fx = np.zeros((N, 2))

# --- motor de podadora: pulsos de explosión con revoluciones que suben y bajan ---
pts = [(0, 0), (2.1, 0), (2.25, .55), (2.6, .35), (5.2, .4), (5.4, .75), (6.6, .55), (7, .45), (11.6, .45), (11.95, 1.0), (13.5, 1.0), (13.6, .3), (17.5, .4), (18.6, .35), (19.0, 0),
       (20.6, 0), (20.7, .3), (25.0, .3), (25.4, 1.0), (28.3, 1.0), (28.8, .4), (30.2, .45), (31.5, .75), (33.0, .75), (34.4, .95), (36.2, .9), (36.3, .5), (43.6, .5), (43.8, .9), (48, .9),
       (50.3, .9), (50.4, .3), (51, .35), (57.6, .45), (58, .7), (62, .7), (62.1, 1.0), (65.6, .9), (65.7, .45), (72.6, .45), (75, .3), (76, .3), (77.1, .3), (77.2, 1.0), (84.4, 1.0)]
rpm = np.interp(t, *zip(*pts)); rpm = lp(rpm, int(.05 * SR))
on = rpm > .02; f = 22 + 70 * rpm
ph = np.cumsum(f) / SR; frac = ph % 1
pulse = np.exp(-frac * 9) * (1 + .5 * rs.standard_normal(N) * np.exp(-frac * 20))
eng = lp(pulse, 6) * 1.4 + lp(rs.standard_normal(N), 30) * .15 * rpm
eng = (eng - lp(eng, 400)) * on * (.5 + .7 * rpm)
fx += st(eng) * .35
# arranque con la cuerda y el último tosido al apagarse
x = tt(.35); place(fx, st(fade(lp(rs.standard_normal(len(x)), 3) * np.sin(2 * np.pi * 3 * x) * .25, .02, .1)), T["jala"] - .2, -10)
for k in range(3): x = tt(.08); place(fx, st(np.sin(2 * np.pi * 60 * x) * np.exp(-x / .02) * .6), T["apaga"] - .5 + k * .18, -6)

# --- latas cayendo ---
place(fx, S("golpe.wav"), T["latas"], -3)
for k in range(12):
    tk = T["latas"] + .05 + rs.random() * .9; x = tt(.12); f0 = 1800 + rs.random() * 1500
    place(fx, st(np.sin(2 * np.pi * f0 * x) * np.exp(-x / .03) * .3 + np.sin(2 * np.pi * f0 * 1.5 * x) * np.exp(-x / .02) * .2), tk, -8, rs.random() - .5)
# --- golpe cómico en cada choque (golpe + "boing") ---
def boing(t0):
    place(fx, S("golpe.wav"), t0, -2); x = tt(.6); fb = 180 + 90 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 4)
    place(fx, st(np.sin(2 * np.pi * np.cumsum(fb) / SR) * np.exp(-x * 5) * .5), t0 + .03, -6)
boing(T["latas"]); boing(T["choqueElote"])
# --- chispas de los tenis y del disco ---
for a0, a1, db in [(T["tenis"], C[13], -12), (C[13] + 1.6, C[13] + 6.0, -14)]:
    x = tt(a1 - a0); sp = (rs.random(len(x)) < .004) * rs.standard_normal(len(x)); sp = sp - lp(sp, 6); place(fx, st(fade(sp * 2 + lp(rs.standard_normal(len(x)), 2) * .15, .05, .3)), a0, db)
x = tt(2.5); sq = np.sin(2 * np.pi * (2400 + 300 * np.sin(2 * np.pi * 7 * x)) * x) * .05; place(fx, st(fade(sq, .1, .5)), C[13] + 1.7, -14)   # rechinido del freno
# --- clics metálicos en los despieces y rayos X, whoosh en los cortes ---
for c in (C[1], C[4], C[7], C[10], C[13]):
    for k in range(3): place(fx, S("tic.wav"), c + .3 + k * .3, -6); place(fx, S("metal.wav"), c + .32 + k * .3, -16)
for c in C: place(fx, S("whoosh_corto.wav"), c - .13, -12)
# --- "pop" en cada texto ---
for tp in txt_t: place(fx, S("pop.wav"), tp, -12)
# --- destellos de la transformación ---
for f0 in T["flash"]: x = tt(.5); place(fx, st(sum(np.sin(2 * np.pi * fr * x) for fr in (1318, 1760, 2637)) * np.exp(-x * 6) * .12), f0, -6)

# --- música urbana juguetona: bombo, tarola con palmas, bajo y acordes ---
bpm = 96; beat = 60 / bpm; mus = np.zeros(N)
chords = [(146.8, 174.6, 220), (130.8, 164.8, 196), (116.5, 146.8, 174.6), (130.8, 164.8, 196)]
for b in range(int(DUR / beat) + 1):
    tb = b * beat; i = int(tb * SR)
    if i >= N: break
    x = tt(.3); kick = np.sin(2 * np.pi * (100 * np.exp(-x * 25) + 45) * x) * np.exp(-x / .1)
    if b % 2 == 0: seg = kick[: N - i]; mus[i:i + len(seg)] += seg
    if b % 4 == 1 or b % 4 == 3:   # tarola/palmas
        x = tt(.15); sn = rs.standard_normal(len(x)) * np.exp(-x / .04) * .5; seg = sn[: N - i]; mus[i:i + len(seg)] += seg
    for hh in (0, .5):
        j = int((tb + hh * beat) * SR); x = tt(.04); h = rs.standard_normal(len(x)) * np.exp(-x / .008) * .18; seg = h[: max(0, N - j)]; mus[j:j + len(seg)] += seg - np.mean(seg)
    ch = chords[(b // 4) % 4]
    x = tt(beat * .45); bass = np.sin(2 * np.pi * ch[0] / 2 * x) * np.exp(-x / .15) * .6; seg = bass[: N - i]; mus[i:i + len(seg)] += seg
    if b % 2 == 1:
        x = tt(beat * .4); stab = sum(np.sign(np.sin(2 * np.pi * fr * x)) * .25 + np.sin(2 * np.pi * fr * 2 * x) * .2 for fr in ch) * np.exp(-x / .07) * .25; j = int((tb + beat * .5) * SR); seg = stab[: max(0, N - j)]; mus[j:j + len(seg)] += seg
mus = mus - lp(mus, 200) * 0; mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 17 - rms_db(mus)) / 20)
env = lp(np.abs(voz[:, 0]), int(.2 * SR)); duck = 1 - .45 * np.clip(env / (np.percentile(env[act], 50) + 1e-9), 0, 1)
mus *= duck[:, None]; fx *= (.65 + .35 * duck)[:, None]
fx *= 10 ** ((vdb - 9 - rms_db(fx)) / 20)
ends = np.ones(N); ends[-int(1.0 * SR):] = np.linspace(1, 0, int(1.0 * SR))
mix = (voz + mus + fx) * ends[:, None]
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR, len(txt_t), "textos")
