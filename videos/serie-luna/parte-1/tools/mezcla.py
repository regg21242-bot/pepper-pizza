"""Audio de "Luna · parte 1": voz + ambiente de ciudad lejana + música electrónica de suspenso (-20 dB bajo la voz) + efectos.
Lee los tiempos de compositions/film.html (const T) y de assets/voz/tiempos.json. Escribe assets/audio/mezcla_sin_master.wav."""
import re, json, wave, os
import numpy as np
SR = 48000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P = lambda *a: os.path.join(root, *a)
src = open(P("compositions/film.html"), encoding="utf-8").read()
b = re.search(r"const T = (\{.*?\});", src, re.S).group(1)
b = re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:", r'\1"\2":', b); b = re.sub(r"(?<![\d])\.(\d)", r"0.\1", b); T = json.loads(b)
V = json.load(open(P("assets/voz/tiempos.json"))); G = json.load(open(P("guion.json")))
DUR = T["end"]; N = int(DUR * SR); t = np.arange(N) / SR; rs = np.random.default_rng(5); C = T["cortes"]
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
# zumbido suave del altavoz cuando habla Luna
for i, (v, _) in enumerate(G["lineas"]):
    if v in ("L", "B"):
        x = tt(V["fin"][i] - V["ini"][i] + .6); e = np.minimum(1, x / .25) * np.minimum(1, (len(x) / SR - x) / .3)
        hum = (np.sin(2 * np.pi * 110 * x) + .5 * np.sin(2 * np.pi * 220.7 * x) + .2 * np.sin(2 * np.pi * 330 * x)) * .05 * e; place(fx, st(hum), V["ini"][i] - .3, -6 if v == "L" else -9)
# clic de cámara (domo) y cuando se apagan
for t0 in (C[1] + .3, T["camOff"], T["camOff"] + .25, T["camOff"] + .5): place(fx, S("tic.wav"), t0, -8); place(fx, S("tac.wav"), t0 + .02, -14)
# cafetera: bombeo y vapor
x = tt(3.0); bomba = np.sin(2 * np.pi * 95 * x) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 14 * x))) * .12; vap = lp(rs.standard_normal(len(x)), 3) * np.interp(x, [0, 1.2, 2.2, 3], [0, .1, .25, 0])
place(fx, st(lp(bomba, 10) * np.minimum(1, x / .2) * np.interp(x, [0, 2.4, 3], [1, 1, 0]) + vap), T["cafe"], -8)
# tic en cada segundo del círculo (4 s)
for k in range(4): place(fx, S("tic.wav"), T["seg0"] + k, -4); place(fx, S("toc.wav"), T["seg0"] + k, -12)
# ondas del altavoz en la visión nocturna
x = tt(2.0); place(fx, st(np.sin(2 * np.pi * 180 * x) * np.exp(-((x % .55) * 6)) * .1), T["ondas"], -10)
# bajón eléctrico cuando se va la luz
x = tt(1.6); f = 120 * np.exp(-x * 1.8) + 25; baj = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 1.4) * .9 + lp(rs.standard_normal(len(x)), 30) * np.exp(-x * 6) * .4
place(fx, st(baj), T["apagon"], -2); place(fx, S("golpe.wav"), T["apagon"], -8)
# anillo a blanco: barrido agudo suave
x = tt(1.4); f = 600 + 900 * x / 1.4; place(fx, st(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(x)) * .08), T["blanco"], -10)
# tic de cada segundo de la cuenta regresiva (90 s) mientras está desconectada
for t0 in np.arange(T["t90"], C[24], 1.0): place(fx, S("tic.wav"), t0, -15 if C[19] <= t0 else -9)
# pip de error en la cerradura
for k in range(3):
    x = tt(.12); place(fx, st(np.sin(2 * np.pi * 1850 * x) * np.hanning(len(x)) * .4), T["pip"] + k * .18, -10)
# vuelve la luz: zumbido que sube
x = tt(1.2); f = 40 + 80 * x / 1.2; place(fx, st(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(x)) * .5), T["vuelve"] - .1, -6)
# vibración del móvil, "ding" de mensaje y burbujas
for k in range(2):
    x = tt(.4); s = np.sin(2 * np.pi * 155 * x) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 31 * x))) * .35; place(fx, st(lp(s, 8)), T["notifMarcos"] + k * .55, -6)
x = tt(.9); ding = (np.sin(2 * np.pi * 1318.5 * x) + .5 * np.sin(2 * np.pi * 1975.5 * x)) * np.exp(-x * 5) * .3; place(fx, st(ding), T["notifMarcos"], -6)
for k in range(3): place(fx, S("pop.wav"), T["abreChat"] + .5 + k * 1.0, -12)
for t0 in (T["cartaA"], T["cartaB"]): place(fx, S("pop.wav"), t0, -8)
# ambiente: ciudad lejana muy baja
amb = lp(rs.standard_normal(N), 300); amb /= np.abs(amb).max() + 1e-9; amb = st(amb * .5 + np.sin(2 * np.pi * 50 * t) * .02)
amb *= env([(0, 1), (C[13], 1), (C[13] + .1, .3), (C[14], .3), (C[14] + .1, 1), (T["apagon"], 1), (T["apagon"] + .5, .35), (T["vuelve"], .35), (T["vuelve"] + .8, 1), (DUR, 1)])[:, None]
# música electrónica de suspenso: bajo pulsante + pad + notas sueltas
pulso = (np.sin(2 * np.pi * 41.2 * t) + .6 * np.sin(2 * np.pi * 82.4 * t)) * (.55 + .45 * np.exp(-((t * 1.75) % 1) * 5))
pad = (np.sin(2 * np.pi * 110 * t) + .7 * np.sin(2 * np.pi * 130.8 * t) + .5 * np.sin(2 * np.pi * 164.8 * t)) * (.5 + .5 * np.sin(2 * np.pi * .05 * t)) * .25
mus = pulso + pad
for k, t0 in enumerate(np.arange(2, DUR, 4.0)):
    x = tt(2.5); n = np.sin(2 * np.pi * [659.3, 587.3, 523.3, 493.9][k % 4] * x) * np.exp(-x * 1.6) * .12; i = int(t0 * SR); n = n[: max(0, N - i)]; mus[i:i + len(n)] += n
mus *= env([(0, 1), (T["apagon"], 1), (T["apagon"] + .3, .5), (T["vuelve"], .5), (T["vuelve"] + 1, 1), (DUR, 1)])
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20); amb *= 10 ** ((vdb - 30 - rms_db(amb)) / 20)
mix = voz + mus + amb + fx
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
