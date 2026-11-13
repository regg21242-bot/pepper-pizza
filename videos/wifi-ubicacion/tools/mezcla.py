"""Audio de "¿Tu celular sabe dónde estás sin GPS?": voz + música electrónica ambiental (-20 dB bajo la voz) + efectos.
Lee los tiempos de compositions/film.html (const T). Escribe assets/audio/mezcla_sin_master.wav."""
import re, json, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
b = re.search(r"const T = (\{.*?\});", src, re.S).group(1)
b = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', b); b = re.sub(r"(?<![\d])\.(\d)", r"0.\1", b); T = json.loads(b)
DUR = T["end"]
N = int(DUR * SR); t = np.arange(N) / SR
def read(path):
    with wave.open(path) as w: x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768; ch = w.getnchannels(); sr = w.getframerate()
    x = x.reshape(-1, ch); x = np.repeat(x, 2, axis=1) if ch == 1 else x
    if sr != SR: idx = np.arange(int(len(x) * SR / sr)) * sr / SR; x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], axis=1)
    return x
def place(bf, sig, t0, db=0.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0: return
    sig = sig[: N - i] * 10 ** (db / 20) * np.array([1 - max(pan, 0), 1 + min(pan, 0)]); bf[i:i + len(sig)] += sig
def st(x): return np.stack([x, x], axis=1)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
S = lambda n: read(P("assets/sfx", n))
fx = np.zeros((N, 2))
# escena 1 (clics metálicos, zumbido del chip, tono grave) ya hecha a mano
place(fx, read(P("assets/audio/escena1.wav")), 0, 0)
C = []
def tono(t0, fr, d, db, pan=0):
    x = tt(d); place(fx, st(np.sin(2 * np.pi * fr * x) * np.exp(-x / (d * .35)) * .4), t0, db, pan)
def ping(t0, db=-10, pan=0):
    x = tt(.6); s = (np.sin(2 * np.pi * 1568 * x) + .5 * np.sin(2 * np.pi * 2349 * x)) * np.exp(-x * 9) * .3; place(fx, st(s), t0, db, pan)
def error(t0, db=-6):
    x = tt(.45); s = np.sign(np.sin(2 * np.pi * 155 * x)) * .25 * np.exp(-x * 3); s = lp(s, 12); place(fx, st(s), t0, db); place(fx, st(s), t0 + .22, db - 2)
def click(t0, db=-4):
    x = tt(.12); s = np.random.default_rng(int(t0 * 100)).standard_normal(len(x)) * np.exp(-x * 90) * .5 + np.sin(2 * np.pi * 2200 * x) * np.exp(-x * 60) * .4; place(fx, st(s), t0, db)
# whoosh en cada movimiento grande de cámara
for t0, db in ((5.0, -14), (12.0, -9), (13.7, -8), (16.05, -6), (18.9, -8), (21.8, -12), (27.0, -11), (31.4, -14), (35.0, -14), (42.0, -6), (45.2, -6), (54.5, -10), (56.5, -9)):
    place(fx, S("whoosh.wav"), t0, db)
place(fx, S("golpe.wav"), T["muro1"] - .05, -14)   # atraviesa el muro
# celular: GPS bloqueado, mapa y pin
error(T["gpsBloq"]); ping(T["mapaOn"] + .2, -12); place(fx, S("pop.wav"), T["mapa"], -6)
# ciudad que crece: tics rápidos
for i in range(14): place(fx, S("tic.wav"), T["crece"] + i * .09, -16 - (i % 3))
# pings de las ondas WiFi
for k, t0 in enumerate(np.arange(T["rafaga1"], 21.4, .55)): ping(t0, -9 if t0 < 18.6 else -13, pan=.4 * np.sin(k * 1.7))
for k, t0 in enumerate(np.arange(T["rafaga2"], 52.6, .7)): ping(t0, -10 if t0 < 49 else -15, pan=.3 * np.sin(k))
for i in range(10): ping(T["escucha"] + i * .12, -17, pan=.5 * np.sin(i * 2.1))
error(T["sinPass"], -12)
# lista de redes, círculos y pin
for i in range(4): place(fx, S("tic.wav"), T["filas"] + i * .22, -8)
for i in range(3): ping(T["circulos"] + i * .35, -10); tono(T["circulos"] + i * .35, 523 * (1 + i * .25), .8, -16)
place(fx, S("pop.wav"), T["pin"] + .35, -4); tono(T["pin"] + .4, 880, .6, -12)
# millones de celulares: datos que suben
x = tt(1.6); place(fx, st(np.sin(2 * np.pi * (600 + 500 * x) * x) * np.exp(-x * 2) * .15), T["millones"], -10)
for t0 in np.arange(T["suben"], 34.4, .8): tono(t0, 1046, .3, -18)
tono(T["heroeCel"], 1318, .5, -10)
# candado: clic, llave rechazada, palomita y taches, letrero
click(T["cierra"], -2); place(fx, S("metal.wav"), T["llave"] + .05, -8); error(T["llave"] + .08, -10)
tono(T["f1"], 1046, .4, -10); tono(T["f2"], 220, .4, -9); tono(T["f3"], 220, .4, -9)
place(fx, S("golpe.wav"), T["letrero"] + .1, -8)
# toda la ciudad: brillo ascendente + contador
x = tt(2.6); fr = 300 * 2 ** (x * 1.4); sh = sum(np.sin(2 * np.pi * fr * h * x) / h for h in (1, 2, 3)) * np.minimum(1, x / 1.6) * np.exp(-np.maximum(0, x - 1.8) * 4) * .12
place(fx, st(sh), T["sube"] - .1, -6)
for t0 in np.arange(T["cuenta"], T["cuenta"] + 1.8, .09): place(fx, S("tic.wav"), t0, -20)
# el desconocido y la pregunta
ping(T["desconocido"], -6); tono(T["desconocido"] + .15, 659, .8, -12)
place(fx, S("pop.wav"), T["pregunta"], -5); place(fx, S("tic.wav"), T["util"], -8); place(fx, S("tic.wav"), T["miedo"], -8)
# música electrónica ambiental: pad + arpegio suave + pulso grave
chords = [(110, 164.8, 220, 261.6), (87.3, 130.8, 174.6, 220), (98, 146.8, 196, 246.9), (82.4, 123.5, 164.8, 207.7)]
mus = np.zeros(N); seg = 3.6
for kk in range(int(DUR / seg) + 1):
    i = int(kk * seg * SR); x = tt(seg + 1.0); ch = chords[kk % 4]
    pad = sum(np.sin(2 * np.pi * f0 * x + .3 * np.sin(2 * np.pi * .3 * x)) + .3 * np.sin(2 * np.pi * f0 * 1.003 * x) for f0 in ch) * np.minimum(1, x / .9) * np.minimum(1, np.maximum(0, seg + 1 - x) / .9) * .5
    arp = np.zeros(len(x))
    for n in range(8): j = int(n * seg / 8 * SR); y = tt(.4); a = np.sin(2 * np.pi * ch[n % 4] * 4 * y) * np.exp(-y * 8) * .25; arp[j:j + len(a)] += a[: len(arp) - j]
    bass = np.sin(2 * np.pi * ch[0] / 2 * x) * (np.exp(-(x % (seg / 4)) * 5)) * .6
    s2 = (pad + arp + bass)[: max(0, N - i)]; mus[i:i + len(s2)] += s2
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20)
e2 = lp(np.abs(voz[:, 0]), int(.2 * SR)); duck = 1 - .3 * np.clip(e2 / (np.percentile(e2[act], 50) + 1e-9), 0, 1)
mus *= duck[:, None]
fx *= 10 ** ((vdb - 11 - rms_db(fx)) / 20)
ends = np.ones(N); ends[:int(.15 * SR)] = np.linspace(0, 1, int(.15 * SR)); ends[-int(.3 * SR):] = np.linspace(1, 0, int(.3 * SR))
mix = (voz + mus * ends[:, None] + fx)
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
