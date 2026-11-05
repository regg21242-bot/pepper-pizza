"""Música, efectos y narración para 'El secreto del pachinko'.
Uso: python3 audio.py carpeta_voz salida.wav   (carpeta_voz = la de voz.py)"""
import sys, os, re, json, wave, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
VOZ, OUTF = sys.argv[1], sys.argv[2]
js = open(os.path.join(HERE, 'tiempos.js')).read()
CAPS = json.loads(re.search(r'const CAPS = (.*);', js).group(1))
DURS = json.loads(re.search(r'const DURS = (.*);', js).group(1))
PAD_IN = float(re.search(r'const PAD_IN = ([\d.]+);', js).group(1))
EXTRA_END = 2.6
ST = [0.0]
for i, d in enumerate(DURS): ST.append(ST[-1] + d + (EXTRA_END if i == len(DURS) - 1 else 0))
DUR = ST[-1]
cap = lambda si, k: ST[si] + CAPS[si][min(k, len(CAPS[si]) - 1)][0]
SR = 44100; N = int(SR * DUR)
mus = np.zeros((N, 2)); fx = np.zeros((N, 2))
rs = np.random.default_rng(3)

def add(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    buf[i:i + len(sig), 0] += sig * (1 - max(pan, 0)); buf[i:i + len(sig), 1] += sig * (1 + min(pan, 0))
def env(n, a=.005, d=.3):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def noise(d): return rs.uniform(-1, 1, int(SR * d))
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
def tone(f, d, dec=.3, harm=(1, .3, .1), a=.003):
    t = np.arange(int(SR * d)) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(len(t), a, dec)
n2f = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- música: ritmo de noche en Tokio (escala pentatónica japonesa "in") ----------
bpm = 112; beat = 60 / bpm
scale = [0, 1, 5, 7, 8]                     # in: E F A B C
root = 52                                   # E3
mel_pat = [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 3, 4, 5, 4, 3, 2]
bass_pat = [0, 0, 3, 0, 0, 0, 4, 3]
note = lambda deg, oct=0: root + 12 * (oct + deg // 5) + scale[deg % 5]
cache = {}
def koto(m, d=.5):
    if (m, d) not in cache:
        f = n2f(m); cache[(m, d)] = mix(tone(f, d, .18, (1, .45, .25, .12)), tone(f * 2.01, d * .6, .06, (.3,))) * .9
    return cache[(m, d)]
t = 0.0; step = 0
while t < DUR:
    b = step % 16
    add(mus, koto(note(mel_pat[(step + (step // 32) * 2) % 16], 2), .4), t, .2, -.25 + .5 * (step % 2))
    if step % 2 == 0:
        add(mus, tone(n2f(note(bass_pat[(step // 2) % 8], 0) - 12), beat * .95, .25, (1, .5, .2)), t, .45)
    if step % 4 == 0: add(mus, mix(tone(55, .25, .08, (1,)), lp(noise(.03), 4) * env(int(SR * .03), .001, .01)), t, .9)       # bombo
    if step % 4 == 2: add(mus, lp(noise(.12), 2) * env(int(SR * .12), .001, .04), t, .25, .1)                               # caja
    add(mus, (noise(.03) - lp(noise(.03), 3)) * env(int(SR * .03), .001, .008), t, .12, .3)                                  # hi-hat
    t += beat / 2; step += 1
fade = np.ones(N); fi, fo = int(SR * .3), int(SR * 2.5)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mus *= fade[:, None] * .5

# ---------- efectos ----------
def whoosh(d=.35):
    n = int(SR * d); return lp(noise(d), 12) * np.sin(np.linspace(0, np.pi, n)) ** 2 * .9
def pop(f=600):
    t = np.arange(int(SR * .12)) / SR; return np.sin(2 * np.pi * (f + 900 * np.exp(-t * 40)) * t) * env(len(t), .001, .04)
def tick():
    return tone(4200, .05, .008, (1, .3)) * .6
def rattle(d, dens=60):
    o = np.zeros(int(SR * d))
    for _ in range(int(d * dens)):
        i = int(rs.uniform(0, len(o) - 3000)); s = tick() * rs.uniform(.3, 1); o[i:i + len(s)] += s[:len(o) - i]
    return o
def stamp():
    return mix(tone(80, .4, .1, (1, .5)) * 1.4, lp(noise(.12), 10) * env(int(SR * .12), .001, .03) * 1.2)
def fanfare():
    o = np.zeros(int(SR * 1.6))
    for i, m in enumerate([72, 76, 79, 84, 79, 84]):
        s = tone(n2f(m), .5, .25, (1, .5, .3, .2), .01) * .5; j = int(SR * i * .12); o[j:j + len(s)] += s[:len(o) - j]
    return o
def register():
    return mix(tone(2400, .8, .3, (1, 0, .3)) * .5, tone(3600, .6, .15) * .3, lp(noise(.05), 3) * env(int(SR * .05), .001, .01))
def paper():
    return (noise(.2) - lp(noise(.2), 2)) * env(int(SR * .2), .01, .05) * .5
def bell():
    return mix(tone(1320, 1.0, .4, (1, .2)) * .45, tone(1980, .8, .3) * .2)
def knock():
    return mix(lp(noise(.1), 6) * env(int(SR * .1), .0005, .02) * 1.4, tone(200, .1, .03, (1, .4)))
def wink():
    t = np.arange(int(SR * .25)) / SR; return np.sin(2 * np.pi * (900 + 2200 * t) * t) * env(len(t), .005, .08) * .6
def shh():
    return lp(noise(1.2) - lp(noise(1.2), 2), 2) * np.sin(np.linspace(0, np.pi, int(SR * 1.2))) * .35
def street(d):
    return lp(noise(d), 60) * .25

for s in ST[1:-1]: add(fx, whoosh(), s - .2, .5)
add(fx, street(ST[1]), 0, .6)
add(fx, stamp(), cap(0, 1), .9); add(fx, stamp(), cap(0, 1) + .9, .8)
add(fx, register(), cap(0, 4), .8); [add(fx, paper(), cap(0, 4) + .1 + i * .07, .6, (i % 3 - 1) * .5) for i in range(8)]
add(fx, rattle(ST[2] - ST[1], 90), ST[1], .35, .2)                                   # salón lleno de bolitas
add(fx, pop(700), cap(1, 1), .5); [add(fx, pop(500 + i * 30), cap(1, 3) + i * .05, .25, (i % 3 - 1) * .4) for i in range(12)]
add(fx, rattle(cap(2, 1) - ST[2] + .6, 50), ST[2], .4)
for k in range(3): add(fx, knock(), cap(2, 1) + .6 + k * .25, .7)
add(fx, fanfare(), cap(2, 1) + .7, .9); add(fx, rattle(2.2, 260), cap(2, 1) + .8, .55)
add(fx, stamp(), cap(2, 3), .8); add(fx, pop(300), cap(2, 4), .6)
add(fx, rattle(1.5, 120), ST[3] + .4, .4)
add(fx, pop(900), cap(3, 2), .5); add(fx, bell(), cap(3, 4), .8)
for k in np.arange(0, CAPS[4][3][0], .4): add(fx, knock() * .4, ST[4] + k, .5, -.2)    # pasos
add(fx, paper(), cap(4, 4), .7); add(fx, register(), cap(4, 5), .9)
for i in range(6): add(fx, paper(), cap(4, 5) + .05 + i * .06, .5)
add(fx, pop(500), ST[5] + .1, .4); add(fx, stamp(), cap(5, 1), .7)
add(fx, whoosh(.4), cap(5, 2) + .3, .5); add(fx, whoosh(.4), cap(5, 5) - .3, .5)
for k in range(5): add(fx, whoosh(.25), cap(5, 6) + k * .45, .35, (k % 2) * .6 - .3)
add(fx, wink(), cap(6, 1) + .1, .8); add(fx, stamp(), cap(6, 2) + .4, .8)
for i in range(3): add(fx, pop(400 + i * 150), cap(6, 3) + .3 + i * .25, .6)
add(fx, shh(), cap(7, 1), .8); add(fx, pop(900), cap(7, 2), .7); add(fx, bell(), cap(7, 2) + .05, .5)

# ---------- narración ----------
voz = np.zeros(N)
for i in range(len(DURS)):
    w = wave.open(os.path.join(VOZ, f'escena_{i + 1}.wav'))
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    j = int((ST[i] + PAD_IN - .05) * SR); voz[j:j + len(a)] += a[:N - j]
voz /= np.max(np.abs(voz)) * 1.05
# atenuar música cuando habla la voz
envv = np.convolve(np.abs(voz), np.ones(int(SR * .25)) / int(SR * .25), mode='same')
duck = 1 - .6 * np.clip(envv / .08, 0, 1)
duck = np.convolve(duck, np.ones(int(SR * .1)) / int(SR * .1), mode='same')
out = mus * duck[:, None] + fx * .8 + voz[:, None] * 1.0
out = np.tanh(out * 1.05); out /= np.max(np.abs(out)) * 1.06
with wave.open(OUTF, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok', round(DUR, 2))
