"""Música y efectos para 'El despertador humano'. Uso: python3 audio.py salida.wav"""
import sys, wave
import numpy as np
SR = 44100
DUR = 55.5
N = int(SR * DUR)
out = np.zeros((N, 2))
rs = np.random.default_rng(1)

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    out[i:i + len(sig), 0] += sig * (1 - max(pan, 0))
    out[i:i + len(sig), 1] += sig * (1 + min(pan, 0))

def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)

def lowpass(x, k):
    # media móvil simple
    return np.convolve(x, np.ones(k) / k, mode='same')

def pluck(freq, dur=0.6, bright=0.5):
    n = int(SR * dur); p = max(2, int(SR / freq))
    buf = rs.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]
        buf[i % p] = bright * (buf[i % p] + buf[(i + 1) % p]) * 0.5 + (1 - bright) * buf[i % p] * 0.996
    return y * env(n, .002, dur * .35)

def tone(freq, dur, d=0.3, harm=(1, .3, .1)):
    t = np.arange(int(SR * dur)) / SR
    s = sum(h * np.sin(2 * np.pi * freq * (k + 1) * t) for k, h in enumerate(harm))
    return s * env(len(t), .003, d)

def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

def noise(dur): return rs.uniform(-1, 1, int(SR * dur))

# ---------- música: pizzicato juguetón de época, 100 BPM ----------
bpm = 100; beat = 60 / bpm
n2f = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [(50, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72]), (45, [61, 64, 69])]  # Dm Bb C A
cache = {}
def cp(m, d=.5, b=.5):
    k = (m, d, b)
    if k not in cache: cache[k] = pluck(n2f(m), d, b)
    return cache[k]
bar = 0; t = 0.0
mel = [0, 2, 1, 2, 0, 1, 2, 1]
while t < DUR - 0.5:
    root, ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * beat
        add(cp(root - 12 if b % 2 == 0 else root - 5, .7, .35), tb, .55)        # bajo
        for e in range(2):
            idx = mel[(b * 2 + e + bar) % 8]
            add(cp(ch[idx] + (12 if (bar % 8) >= 4 and e == 1 else 0), .35, .6), tb + e * beat / 2, .22, -.3 + .6 * e)
        if b % 2 == 1:
            sn = noise(.06) * env(int(SR * .06), .001, .015)
            add(np.diff(sn, prepend=0), tb, .12, .2)                                    # chasquido
    bar += 1; t += 4 * beat
# fade de entrada y salida de la música
fade = np.ones(N); fi = int(SR * .4); fo = int(SR * 2)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= (fade[:, None] * 0.55)

# ---------- efectos ----------
def knock():
    n = int(SR * .12)
    s = lowpass(noise(.12), 6) * env(n, .0005, .02) * 1.6
    return s + tone(180, .12, .03, (1, .5)) * .9
def whoosh(d=.35):
    n = int(SR * d); x = noise(d)
    x = lowpass(x, 12) * np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * .9
def pop(f=600):
    t = np.arange(int(SR * .12)) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-t * 40)) * t) * env(len(t), .001, .04)
def clink():
    return mix(tone(2600, .5, .18, (1, 0, .4, 0, .2)) * .5, tone(3900, .4, .1) * .25)
def tic():
    return tone(3200, .06, .012, (1,)) * .7
def puff():
    return lowpass(noise(.15), 30) * env(int(SR * .15), .01, .04) * 1.4
def thud():
    return mix(tone(70, .4, .12, (1, .4)) * 1.4, lowpass(noise(.1), 20) * env(int(SR * .1), .001, .03))
def ding():
    return mix(tone(1320, 1.2, .5, (1, .2, .1)) * .45, tone(1980, 1.0, .35) * .2)
def step():
    return lowpass(noise(.08), 25) * env(int(SR * .08), .001, .02) * 1.1
def bell(d):
    t = np.arange(int(SR * d)) / SR
    trem = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    s = (np.sin(2 * np.pi * 2100 * t) + .5 * np.sin(2 * np.pi * 3150 * t)) * trem
    a = np.minimum(t / .05, 1) * np.minimum((d - t) / .2, 1)
    return s * a * .16
def chalk(d):
    x = noise(d); x = x - lowpass(x, 3)
    t = np.arange(len(x)) / SR
    return x * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) ** 2 * .35
def snore(d):
    t = np.arange(int(SR * d)) / SR
    a = np.clip(np.sin(2 * np.pi * t / 2.6), 0, 1) ** 2
    return lowpass(noise(d), 40) * a * (1 + np.sin(2 * np.pi * 45 * t)) * .5

S = [0, 4.2, 9.6, 18.6, 28.0, 34.4, 40.6, 47.2]
for s in S[1:]: add(whoosh(), s - .2, .5)
for c in [0.6, 0.85, 1.1, 1.9, 2.15, 2.4]: add(knock(), c, .9, .3)
add(snore(2.4), 0, .5)
add(pop(500), 2.55, .7)
for c in [0.4, 0.7, 1.0, 2.0, 2.3, 2.6]: add(knock(), 4.2 + c, .8, .2)
add(thud(), 9.6 + 4.6, .9); add(pop(700), 9.6 + 4.6, .4)
add(ding(), 9.6 + 6.6, .9)
for k in np.arange(0, 4.8, 0.39): add(step(), 18.6 + k, .6, -.2)
for c in [5.5, 5.8, 6.1, 6.8, 7.1]: add(knock(), 18.6 + c, .8, .3)
add(pop(450), 18.6 + 7.6, .6)
for i in range(3): add(clink(), 28 + 1.6 + i * .2, .8, .2)
add(pop(800), 28 + 3.0, .5)
add(chalk(1.1), 28 + 3.5, .9)
for i in range(6):
    add(puff(), 34.4 + 2.7 + i * .45, .8, -.3)
    add(tic(), 34.4 + 3.05 + i * .45, .9, .3)
add(pop(400), 40.6 + 0.1, .6)
add(whoosh(.3), 40.6 + 3.0, .5)
add(snore(3.4), 40.6 + 3.1, .55)
for i in range(9): add(pop(300 + i * 60), 47.2 + .45 + i * .18, .35, (i % 3 - 1) * .4)
add(bell(3.4), 47.2 + .8, 1.0)
for k in np.arange(2.0, 6.5, 0.52): add(step(), 47.2 + k, .5, .3)
add(pop(900), 47.2 + 3.6, .7); add(ding(), 47.2 + 3.62, .5)

# ---------- master ----------
out = np.tanh(out * 1.1)
out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
