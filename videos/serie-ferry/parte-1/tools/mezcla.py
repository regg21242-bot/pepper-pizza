"""Audio de "Ferry · parte 1": voz + ambiente (motor del barco) + música grave de suspenso (-20 dB bajo la voz) + efectos.
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
C = T["cortes"]
# bocina del ferry (grave, larga) y agua — al inicio y en el loop
def bocina(t0, d, db):
    x = tt(d); e = np.minimum(1, x / .25) * np.minimum(1, (d - x) / .6)
    s = sum(a * np.sign(np.sin(2 * np.pi * f * x)) for f, a in ((92.5, .5), (138.6, .35), (185, .15))); s = lp(lp(s, 30), 20) * e * .35; place(fx, st(s), t0, db)
bocina(T["bocina"], 2.0, -6)
def agua(t0, t1, db):
    x = tt(t1 - t0); n = lp(rs.standard_normal(len(x)), 60) * (.6 + .4 * np.sin(2 * np.pi * .4 * x) ** 2); n /= np.abs(n).max() + 1e-9
    e = np.minimum(1, x / .4) * np.minimum(1, (t1 - t0 - x) / .4); place(fx, st(n * e * .4), t0, db)
agua(0, C[1] + .3, -10); agua(C[18] - .2, DUR, -10); agua(C[9], C[11], -16)
# año que rueda y "+7 AÑOS"
for k in range(7): place(fx, S("tic.wav"), T["anioRueda"] + k * .1, -14)
place(fx, S("pop.wav"), T["mas7"], -6)
# toque en la cobertura
place(fx, S("tac.wav"), T["toqueRed"], -8)
# vibraciones cada vez más rápidas mientras llegan los mensajes
tv = T["mensajes0"]
while tv < C[6] - .3:
    k = (tv - T["mensajes0"]) / (C[6] - T["mensajes0"]); per = 1.1 - .85 * k; d = per * .45
    x = tt(d); s = np.sin(2 * np.pi * 155 * x) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 31 * x))) * .35; place(fx, st(lp(s, 8)), tv, -9 + 3 * k); place(fx, S("tic.wav"), tv, -18); tv += per
for t0 in T["saltos"]: place(fx, S("whoosh_corto.wav"), t0 - .05, -12)
# ding-dong de megafonía y zumbido del altavoz
for f, t0 in ((659.3, 0), (523.3, .55)):
    x = tt(1.6); s = (np.sin(2 * np.pi * f * x) + .3 * np.sin(2 * np.pi * 2 * f * x)) * np.exp(-x * 2.2) * .35; place(fx, st(s), T["dingdong"] + t0, -6)
x = tt(C[8] - T["dingdong"] - 1.5); place(fx, st(lp(rs.standard_normal(len(x)), 8) * .03 + np.sin(2 * np.pi * 120 * x) * .02), T["dingdong"] + 1.4, -8)
# cortina que se corre
nz = rs.standard_normal(int(.6 * SR)); place(fx, st(lp(nz, 20) * np.hanning(len(nz)) * .6), T["cortina"], -10)
# sirenas lejanas (muelle y pasarela)
x = tt(C[11] - T["sirenas"]); f = 760 + 180 * np.sin(2 * np.pi * .45 * x); sir = np.sin(2 * np.pi * np.cumsum(f) / SR) * .18; sir = lp(sir, 12)
sir *= np.minimum(1, x / 1.5) * np.minimum(1, (len(x) / SR - x) / 1.0); place(fx, np.stack([sir, sir * .7], axis=1), T["sirenas"], -16)
# pasarela metálica que baja
x = tt(2.2); s = lp(rs.standard_normal(len(x)), 6) * .15 * (np.abs(np.sin(2 * np.pi * 9 * x)) ** 4) + np.sin(2 * np.pi * 70 * x) * .1; place(fx, st(s * np.hanning(len(x))), T["pasarela"], -8); place(fx, S("metal.wav"), T["pasarela"] + 2.1, -6)
# pulsera que se cierra
place(fx, S("tac.wav"), T["pulsera"] + .9, -6); place(fx, S("tic.wav"), T["pulsera"] + 1.0, -8)
# murmullo que se corta en la terminal
x = tt(C[13] - C[12]); mur = lp(rs.standard_normal(len(x)), 25) * np.interp(x, [0, .5, 1.2, 2.0, 10], [.4, .4, .1, .0, 0]); place(fx, st(mur * .3), C[12], -14)
# pasos en el pasillo y puerta metálica que se cierra con eco
for t0 in np.arange(C[15] + .3, T["puertaCierra"] - .2, .52): place(fx, S("toc.wav"), t0, -15, pan=.25)
golpe = S("golpe.wav") * .9; eco = np.zeros((int(2.0 * SR) + len(golpe), 2))
for k, d in enumerate([0, .22, .47, .75, 1.05]): i = int(d * SR); eco[i:i + len(golpe)] += golpe * (.55 ** k)
place(fx, eco, T["puertaCierra"], -2); place(fx, S("metal.wav"), T["puertaCierra"], -6)
# vibración del mensaje final
for k in range(2):
    x = tt(.45); s = np.sin(2 * np.pi * 155 * x) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 31 * x))) * .35; place(fx, st(lp(s, 8)), T["vibraFinal"] + k * .8, -4)
for t0 in (T["cartaA"], T["cartaB"]): place(fx, S("pop.wav"), t0, -8)
# ambiente: motor del barco (grave) dentro, viento fuera
eng = (np.sin(2 * np.pi * 43 * t) + .5 * np.sin(2 * np.pi * 86.3 * t)) * .05 + lp(rs.standard_normal(N), 200) * .1
amb = st(eng) * env([(0, .2), (C[2], .2), (C[2] + .2, 1), (C[9], 1), (C[9] + .2, .3), (C[12], .3), (C[12] + .2, .6), (DUR, .6)])[:, None]
# música de suspenso: dron grave con batimiento + notas lejanas
mus = (np.sin(2 * np.pi * 49 * t) + .7 * np.sin(2 * np.pi * 49.5 * t) + .45 * np.sin(2 * np.pi * 73.4 * t) + .25 * np.sin(2 * np.pi * 98.2 * t)) * (.7 + .3 * np.sin(2 * np.pi * .09 * t))
for k, t0 in enumerate(np.arange(1.5, DUR, 6)):
    x = tt(4.5); n = np.sin(2 * np.pi * [196, 185, 207.7, 174.6][k % 4] * x) * np.exp(-x * .8) * .25; i = int(t0 * SR); n = n[: max(0, N - i)]; mus[i:i + len(n)] += n
mus = st(mus)
voz = np.zeros((N, 2)); v = read(P("assets/voz/voz.wav")); voz[: min(N, len(v))] = v[:N]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
act = np.abs(voz[:, 0]) > .01; vdb = rms_db(voz[act])
mus *= 10 ** ((vdb - 20 - rms_db(mus)) / 20); amb *= 10 ** ((vdb - 26 - rms_db(amb)) / 20)
# silencio total de 1 s
sil = np.ones(N); a0, a1 = int(T["silencio0"] * SR), int(T["silencio1"] * SR); sil[a0:a1] = 0; sil = np.convolve(sil, np.ones(480) / 480, mode="same")
mix = (voz + (mus + amb) * sil[:, None] + fx * sil[:, None])
y = np.clip(mix / max(1, np.abs(mix).max()), -1, 1)
with wave.open(P("assets/audio/mezcla_sin_master.wav"), "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print("ok", DUR)
