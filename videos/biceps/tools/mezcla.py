"""Mezcla de audio del video del bíceps: voz + música ambiental + efectos.

Uso (desde la carpeta del proyecto):  python3 tools/mezcla.py
Lee los tiempos de eventos de compositions/film.html (const T = {...}) para que
los efectos caigan justo con la animación. Escribe assets/audio/mezcla.wav.
"""
import json, re, wave, os
import numpy as np

SR = 48000
DUR = 56.25
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)

# ---------- tiempos desde la animación ----------
src = open(P("compositions/film.html"), encoding="utf-8").read()
blk = re.search(r"const T = (\{.*?\n    \});", src, re.S).group(1)
blk = re.sub(r"//[^\n]*", "", blk)
blk = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', blk)
blk = re.sub(r",\s*}", "}", blk)
T = json.loads(blk)
PULSE = 0.5


def read(path):
    with wave.open(path) as w:
        n, ch, sr, sw = w.getnframes(), w.getnchannels(), w.getframerate(), w.getsampwidth()
        x = np.frombuffer(w.readframes(n), dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float64)
        x /= {2: 32768.0, 4: 2147483648.0}[sw]
    x = x.reshape(-1, ch)
    if ch == 1: x = np.repeat(x, 2, axis=1)
    if sr != SR:   # remuestreo lineal sencillo
        t_old = np.arange(len(x)) / sr; t_new = np.arange(int(len(x) * SR / sr)) / SR
        x = np.stack([np.interp(t_new, t_old, x[:, c]) for c in range(2)], axis=1)
    return x


N = int(DUR * SR)
def buf(): return np.zeros((N, 2))
def place(b, sig, t0, gain_db=0.0, pan=0.0):
    i = int(round(t0 * SR));
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i] * (10 ** (gain_db / 20))
    b[i:i + len(sig), 0] += sig[:, 0] * (1 - max(pan, 0))
    b[i:i + len(sig), 1] += sig[:, 1] * (1 + min(pan, 0))
def mono2st(x): return np.stack([x, x], axis=1)
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
rs = np.random.default_rng(7)

# ---------- voz ----------
voz = read(P("assets/voz/voz.wav"))[:N]
voz = np.pad(voz, ((0, N - len(voz)), (0, 0)))

# ---------- música: ambiental y curiosa (la menor, pad + pizzicato) ----------
mus = buf(); t = np.arange(N) / SR
BPM = 92; beat = 60 / BPM
chords = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]   # Am F C G
f = lambda m: 440 * 2 ** ((m - 69) / 12)
bar = beat * 4 * 2   # 2 compases por acorde
for k in range(int(DUR / bar) + 1):
    t0 = k * bar; ch = chords[k % 4]; n = int(bar * SR) + SR
    tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f(m) * tt + .3 * np.sin(2 * np.pi * .2 * tt)) + .35 * np.sin(2 * np.pi * f(m + 12) * tt) for m in ch)
    pad *= np.minimum(tt / 1.2, 1) * np.minimum(np.maximum((bar + .9 - tt) / 1.0, 0), 1) * .05
    place(mus, mono2st(pad), t0, 0, 0)
    # pizzicato: arpegio curioso en corcheas, con silencios
    for j in range(16):
        if j % 4 == 3 or (j in (6, 13)): continue
        m = ch[(j * 2) % 3] + 12 + (12 if j % 8 == 5 else 0)
        nn = int(.5 * SR); ts = np.arange(nn) / SR
        pl = (np.sin(2 * np.pi * f(m) * ts) + .3 * np.sin(4 * np.pi * f(m) * ts)) * env(nn, .003, .12) * .09
        place(mus, mono2st(pl), t0 + j * beat / 2, 0, (j % 3 - 1) * .4)
# bajo suave
for k in range(int(DUR / (beat * 2)) + 1):
    ch = chords[int(k * beat * 2 / bar) % 4]; nn = int(beat * 2 * SR); ts = np.arange(nn) / SR
    place(mus, mono2st(np.sin(2 * np.pi * f(ch[0] - 24) * ts) * env(nn, .02, .5) * .09), k * beat * 2)

# ---------- efectos ----------
fx = buf()
WH = read(P("assets/sfx/whoosh.wav")); WH_APEX = .436
WC = read(P("assets/sfx/whoosh_corto.wav")); WC_APEX = .131
TIC = read(P("assets/sfx/tic.wav")); TIC2 = read(P("assets/sfx/tic2.wav"))
for tz in (T["toInside"], T["toNight"], T["toSpark"], T["toStreet"], T["toArm"]):
    place(fx, WH, tz - WH_APEX, -5)
for tz in (T["xray"][0] + .3, T["zoomOut"][0] + .4, T["loop"][0] + .5, T["sort"][0] + .5):
    place(fx, WC, tz - WC_APEX, -11)
# tic seco en cada brinco
for s in T["twitch1"]: place(fx, TIC, s, -2, -.15)
for s in T["fireOne"]: place(fx, TIC, s + PULSE, -2, -.2)
for s in T["spark"]: place(fx, TIC2, s + PULSE * .5, -4)
for s in T["threadFire"]: place(fx, TIC2, s, -8)
for s in T["fireAll"]: place(fx, TIC, s + PULSE, 0); place(fx, TIC2, s + PULSE + .03, -3, .3)


def buzz(d, g=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    saw = 2 * ((tt * 120) % 1) - 1
    hum = saw * .5 + np.sin(2 * np.pi * 240 * tt) * .4
    crack = rs.standard_normal(n) * (rs.random(n) < .02) * 1.5
    x = (hum * (.6 + .4 * np.sin(2 * np.pi * 31 * tt)) + crack)
    x = np.convolve(x, np.ones(6) / 6, mode="same")
    e = np.minimum(tt / .04, 1) * np.minimum((d - tt) / .12, 1)
    return mono2st(x * e * .09 * g)
for s in T["fireAll"]: place(fx, buzz(PULSE + .1, 1.2), s, -3)
for s in T["fireOne"]: place(fx, buzz(PULSE * .6, .9), s + PULSE * .45, -4)
for s in T["spark"]: place(fx, buzz(.35, 1.0), s, -4)
place(fx, buzz(1.6, .5), T["toSpark"], -8)


def beep(d=.13):
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * 1850 * tt)) * .5 + np.sin(2 * np.pi * 2300 * tt) * .5
    x = np.convolve(x, np.ones(4) / 4, mode="same")
    return mono2st(x * np.minimum(tt / .005, 1) * np.minimum((d - tt) / .01, 1) * .18)
for k in range(2): place(fx, beep(), T["alarm"] + k * .44, -3, .2)

# ---------- mezcla: música 20 dB por debajo de la voz, con ducking ----------
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
active = np.abs(voz[:, 0]) > 10 ** (-40 / 20)
voice_db = rms_db(voz[active]) if active.any() else -20
mus *= 10 ** ((voice_db - 20 - rms_db(mus)) / 20)
# ducking suave: -4 dB extra mientras hay voz
v_env = np.convolve(np.abs(voz[:, 0]), np.ones(int(.25 * SR)) / int(.25 * SR), mode="same")
duck = 1 - .37 * np.clip(v_env / (np.percentile(v_env[active], 50) + 1e-9), 0, 1)
mus *= duck[:, None]
# entrada/salida que empatan para el loop
fade = np.ones(N); nf = int(.5 * SR); fade[:nf] = np.linspace(.6, 1, nf); fade[-nf:] = np.linspace(1, .6, nf)
mix = voz + mus * fade[:, None] + fx

os.makedirs(P("assets/audio"), exist_ok=True)
for name, x in (("mezcla_sin_master.wav", mix), ("musica.wav", mus), ("efectos.wav", fx)):
    y = np.clip(x, -1, 1)
    with wave.open(P("assets/audio", name), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", {k: v for k, v in T.items() if k in ("toInside", "toNight", "alarm")}, "voz rms", round(voice_db, 1), "dB")
