"""Audio de "Alerta · parte 1": voz + ambiente de noche + música grave de suspenso (-22 dB bajo la voz) + efectos.
Lee los tiempos de compositions/film.html (const T). Escribe assets/audio/mezcla_sin_master.wav."""
import re, json, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
b = re.search(r"const T = (\{.*?\});", src, re.S).group(1)
b = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', b); b = re.sub(r"(?<![\d])\.(\d)", r"0.\1", b); T = json.loads(b)
DUR = T["end"]; N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(3)
def read(path):
    with wave.open(path) as w: x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768; ch = w.getnchannels()
    x = x.reshape(-1, ch); return np.repeat(x, 2, axis=1) if ch == 1 else x
def place(bf, sig, t0, db=0.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0: return
    sig = sig[: N - i] * 10 ** (db / 20) * np.array([1 - max(pan, 0), 1 + min(pan, 0)]); bf[i:i + len(sig)] += sig
st = lambda x: np.stack([x, x], axis=1); tt = lambda d: np.arange(int(d * SR)) / SR
def lp(x, n): return np.convolve(x, np.ones(n) / n, mode="same")
def env(pts): xs, ys = zip(*pts); return np.interp(t, xs, ys)
S = lambda n: read(P("assets/sfx", n))
fx = np.zeros((N, 2))
# alarma de emergencia (dos tonos, pulsos) — al inicio y en el loop final
def alarma(t0, t1, db):
    x = tt(t1 - t0); on = (np.floor(x / .5) % 2 == 0).astype(float); on = lp(on, 200)
    s = (np.sign(np.sin(2 * np.pi * 853 * x)) + np.sign(np.sin(2 * np.pi * 960 * x))) * .18 * on; s = lp(s, 6)
    place(fx, st(s), t0, db)
alarma(0, T["manotazo"] + .15, -2); alarma(T["loop"], DUR, -2)
# notificación de batería y manotazo
place(fx, S("whoosh_corto.wav"), T["manotazo"] - .1, -4); place(fx, S("tac.wav"), T["manotazo"] + .08, -8)
# cortina y salida por la ventana
nz = rs.standard_normal(int(.9 * SR)); place(fx, st(lp(nz, 30) * np.hanning(len(nz)) * .5), T["cortina"], -14)
place(fx, S("whoosh.wav"), T["sale"], -10)
# clic de interruptor del vecino y anillos de luz
x = tt(.08); clic = rs.standard_normal(len(x)) * np.exp(-x * 120) * .6 + np.sin(2 * np.pi * 2600 * x) * np.exp(-x * 80) * .4
place(fx, st(clic), T["luzVecino"], -4); place(fx, st(clic * .7), T["luzVecino"] + .09, -8)
x = tt(1.2); place(fx, st(np.sin(2 * np.pi * 440 * x) * np.exp(-x * 2.5) * .12), T["luzVecino"] + .05, -12)
# puerta del balcón que se abre y luego se mece con el viento
def rechinido(t0, d, db, f0=520):
    x = tt(d); f = f0 + 140 * np.sin(2 * np.pi * .7 * x) + 60 * np.sin(2 * np.pi * 7.3 * x)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 23 * x))) * np.hanning(len(x)) * .15; place(fx, st(s), t0, db, pan=-.3)
rechinido(T["balcon"] - .3, .8, -12)
for t0 in np.arange(T["silencio1"] + .3, 48.2, 2.3): rechinido(t0, 1.1, -14, 470)
# "pop" grave de cada farola que se apaga (cada vez más cerca y más fuerte)
def pop(t0, db):
    x = tt(1.4); f = 70 * np.exp(-x * 2) + 32; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 3.2) * .9
    s += lp(rs.standard_normal(len(x)), 40) * np.exp(-x * 12) * .5; place(fx, st(s), t0, db); place(fx, S("whoosh_corto.wav"), t0 + .02, db - 10)
for k, t0 in enumerate(T["apagones"]): pop(t0, -12 + k * 3)
pop(T["apagaVecino"] - .02, -3)
pop(T["farolaCuadra"], -2); pop(T["farolaPuerta"], 0)
# parpadeo de la luz del vecino
for k in range(5): x = tt(.05); place(fx, st(rs.standard_normal(len(x)) * np.exp(-x * 90) * .3), T["parpadeo"] + k * .12, -14)
# vibración del celular
for k in range(3):
    x = tt(.38); s = np.sin(2 * np.pi * 155 * x) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 31 * x))) * .35; place(fx, st(lp(s, 8)), T["vibra"] + k * .55, -6)
# zumbido del refri (más fuerte en el pasillo)
x = t; hum = (np.sin(2 * np.pi * 120 * x) + .4 * np.sin(2 * np.pi * 240 * x) + .2 * np.sin(2 * np.pi * 360 * x)) * .05
hk = env([(0, 0), (57.0, 0), (58.0, .5), (65.2, .5), (65.3, .25), (69.8, .3), (70.0, 1.0), (75, 1.0), (86.4, .8), (86.5, 0), (DUR, 0)])
fx += st(hum * hk)
# crujido de madera
x = tt(.9); f = 180 + 90 * np.sin(2 * np.pi * 1.3 * x); cru = np.sin(2 * np.pi * np.cumsum(f) / SR) * (np.abs(np.sin(2 * np.pi * 37 * x)) ** 3) * np.hanning(len(x)) * .5
place(fx, st(cru), T["cruje"], -2)
# latido grave al final (tensión)
for t0 in np.arange(70.0, 86.3, .85): x = tt(.35); place(fx, st(np.sin(2 * np.pi * 48 * x) * np.exp(-x * 9) * .7), t0, -10 + min(6, (t0 - 70) * .5))
for t0 in (T["cartaA"], T["cartaB"]): place(fx, S("pop.wav"), t0, -9)
# ambiente: viento suave + zumbido lejano de la ciudad
wind = lp(rs.standard_normal(N), 400) * (.6 + .4 * np.sin(2 * np.pi * .07 * t) ** 2); wind /= np.abs(wind).max() + 1e-9
amb = st(wind * .5 + np.sin(2 * np.pi * 60 * t) * .04)
amb *= env([(0, .3), (14.6, .4), (16.2, 1.0), (40.6, 1.0), (48.4, .6), (57.2, .4), (DUR, .4)])[:, None]
# música de suspenso: dron grave con batimiento + notas lejanas
mus = (np.sin(2 * np.pi * 55 * t) + .7 * np.sin(2 * np.pi * 55.6 * t) + .45 * np.sin(2 * np.pi * 82.4 * t) + .25 * np.sin(2 * np.pi * 110.3 * t)) * (.7 + .3 * np.sin(2 * np.pi * .11 * t))
for k, t0 in enumerate(np.arange(2, DUR, 5.5)):
    x = tt(4); n = np.sin(2 * np.pi * [220, 207.7, 233.1, 196][k % 4] * x) * np.exp(-x * .9) * .25; i = int(t0 * SR); n = n[: max(0, N - i)]; mus[i:i + len(n)] += n
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 22 - rms_db(mus)) / 20); amb *= 10 ** ((vdb - 26 - rms_db(amb)) / 20)
# silencio total de 1 s
sil = np.ones(N); a0, a1 = int(T["silencio0"] * SR), int(T["silencio1"] * SR); sil[a0:a1] = 0; sil = np.convolve(sil, np.ones(480) / 480, mode="same")
mix = (voz + (mus + amb) * sil[:, None] + fx * sil[:, None])
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
