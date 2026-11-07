"""Audio común: música generada, efectos de sonido y mezcla con la narración.

Uso típico desde el audio.py de cada vídeo:
    import sys; sys.path.insert(0, '../lib'); from sonido import *
    A = Mezcla(estilo='medieval')
    A.fx(A.stamp(), A.cap(0, 1))
    A.guardar(carpeta_voz, 'audio.wav')
"""
import json, re, wave
import numpy as np

SR = 44100
n2f = lambda m: 440 * 2 ** ((m - 69) / 12)


class Mezcla:
    def __init__(self, estilo='juguetón', extra_end=2.6, bpm=None, seed=3):
        js = open('tiempos.js').read()
        self.CAPS = json.loads(re.search(r'const CAPS = (.*);', js).group(1))
        self.DURS = json.loads(re.search(r'const DURS = (.*);', js).group(1))
        self.PAD_IN = float(re.search(r'const PAD_IN = ([\d.]+);', js).group(1))
        self.ST = [0.0]
        for i, d in enumerate(self.DURS):
            self.ST.append(self.ST[-1] + d + (extra_end if i == len(self.DURS) - 1 else 0))
        self.DUR = self.ST[-1]
        self.N = int(SR * self.DUR)
        self.mus = np.zeros((self.N, 2))
        self.efx = np.zeros((self.N, 2))
        self.rs = np.random.default_rng(seed)
        self.musica(estilo, bpm)
        for s in self.ST[1:-1]:
            self.fx(self.whoosh(), s - .2, .5)

    # ---------- utilidades ----------
    def cap(self, si, k):
        c = self.CAPS[si]
        return self.ST[si] + c[min(k, len(c) - 1)][0]

    def add(self, buf, sig, t0, gain=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= self.N or i < 0 or len(sig) == 0:
            return
        sig = sig[: self.N - i] * gain
        buf[i:i + len(sig), 0] += sig * (1 - max(pan, 0))
        buf[i:i + len(sig), 1] += sig * (1 + min(pan, 0))

    def fx(self, sig, t0, gain=1.0, pan=0.0):
        self.add(self.efx, sig, t0, gain, pan)

    @staticmethod
    def env(n, a=.005, d=.3):
        t = np.arange(n) / SR
        return np.minimum(t / a, 1) * np.exp(-t / d)

    @staticmethod
    def mix(*xs):
        n = max(len(x) for x in xs)
        o = np.zeros(n)
        for x in xs:
            o[:len(x)] += x
        return o

    def noise(self, d):
        return self.rs.uniform(-1, 1, int(SR * d))

    @staticmethod
    def lp(x, k):
        return np.convolve(x, np.ones(k) / k, mode='same')

    def tone(self, f, d, dec=.3, harm=(1, .3, .1), a=.003):
        t = np.arange(int(SR * d)) / SR
        return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * self.env(len(t), a, dec)

    def pluck(self, freq, dur=.5, bright=.5):
        n = int(SR * dur); p = max(2, int(SR / freq))
        buf = self.rs.uniform(-1, 1, p); y = np.zeros(n)
        for i in range(n):
            y[i] = buf[i % p]
            buf[i % p] = bright * (buf[i % p] + buf[(i + 1) % p]) * .5 + (1 - bright) * buf[i % p] * .996
        return y * self.env(n, .002, dur * .35)

    # ---------- música ----------
    def musica(self, estilo, bpm):
        cache = {}
        def note_sig(key, fn):
            if key not in cache: cache[key] = fn()
            return cache[key]
        if estilo == 'medieval':      # laúd y tambor en modo dórico
            bpm = bpm or 96; root = 50; scale = [0, 2, 3, 5, 7, 9, 10]
            mel = [0, 2, 4, 3, 2, 1, 0, 4, 5, 4, 2, 3, 4, 2, 1, 0]
            inst = lambda m: note_sig(('l', m), lambda: self.pluck(n2f(m), .5, .45) * .9)
            mel_oct, bass_g, mel_g = 1, .4, .3
        elif estilo == 'japon':       # pentatónica "in"
            bpm = bpm or 112; root = 52; scale = [0, 1, 5, 7, 8]
            mel = [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 3, 4, 5, 4, 3, 2]
            inst = lambda m: note_sig(('k', m), lambda: self.mix(self.tone(n2f(m), .4, .18, (1, .45, .25, .12)), self.tone(n2f(m) * 2.01, .25, .06, (.3,))) * .9)
            mel_oct, bass_g, mel_g = 2, .45, .2
        elif estilo == 'paris':       # vals de acordeón (3/4)
            bpm = bpm or 150; root = 55; scale = [0, 2, 4, 5, 7, 9, 11]
            mel = [4, 3, 2, 4, 6, 5, 4, 2, 3, 4, 5, 7, 6, 5, 4, 3]
            def acc(m):
                f = n2f(m); t = np.arange(int(SR * .45)) / SR
                s = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2 * t) + .3 * np.sin(2 * np.pi * f * 1.004 * t)) * np.minimum(t / .02, 1) * np.exp(-t / .5)
                return s * .7
            inst = lambda m: note_sig(('a', m), lambda: acc(m))
            mel_oct, bass_g, mel_g = 1, .4, .25
        elif estilo == 'cine':        # pads oscuros + pulso suave (estilo documental)
            bpm = bpm or 92; beat = 60 / bpm
            chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59]]
            t0 = 0.0; i = 0
            while t0 < self.DUR:
                d = beat * 8; tt = np.arange(int(SR * d)) / SR
                env = np.minimum(tt / 1.2, 1) * np.minimum((d - tt) / 1.0, 1)
                pad = sum(np.sin(2 * np.pi * n2f(m) * tt) * (.6 if k else 1) + .3 * np.sin(2 * np.pi * n2f(m) * 1.003 * tt) for k, m in enumerate(chords[i % 4])) * env * .12
                self.add(self.mus, pad, t0, 1.0, (-.2, .2)[i % 2])
                for b in range(8):
                    self.add(self.mus, self.tone(n2f(chords[i % 4][0] - 12), .5, .25, (1, .3)), t0 + b * beat, .35)
                    if b % 2: self.add(self.mus, self.tone(n2f(chords[i % 4][(b // 2) % 5] + 24), .3, .12, (1,)), t0 + b * beat + beat / 2, .08, .3)
                t0 += d; i += 1
            fade = np.ones(self.N); fi, fo = int(SR * .5), int(SR * 2.5)
            fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
            self.mus *= fade[:, None] * .5
            return
        else:                         # juguetón: pizzicato
            bpm = bpm or 104; root = 50; scale = [0, 2, 3, 5, 7, 8, 10]
            mel = [0, 2, 4, 2, 0, 4, 5, 4, 2, 3, 4, 6, 5, 4, 2, 1]
            inst = lambda m: note_sig(('p', m), lambda: self.pluck(n2f(m), .35, .6))
            mel_oct, bass_g, mel_g = 1, .45, .22
        beat = 60 / bpm
        note = lambda deg, octv=0: root + 12 * (octv + deg // len(scale)) + scale[deg % len(scale)]
        waltz = estilo == 'paris'
        t, step = 0.0, 0
        kick = self.mix(self.tone(55, .25, .08, (1,)), self.lp(self.noise(.03), 4) * self.env(int(SR * .03), .001, .01))
        snare = self.lp(self.noise(.12), 2) * self.env(int(SR * .12), .001, .04)
        hat = (self.noise(.03) - self.lp(self.noise(.03), 3)) * self.env(int(SR * .03), .001, .008)
        while t < self.DUR:
            sec = (step // 32) % 2
            self.add(self.mus, inst(note(mel[(step + sec * 3) % 16], mel_oct)), t, mel_g, -.25 + .5 * (step % 2))
            if waltz:
                if step % 3 == 0: self.add(self.mus, self.tone(n2f(note([0, 3, 4, 0][(step // 3) % 4], 0) - 12), beat * 1.5, .3, (1, .5)), t, bass_g)
                else: self.add(self.mus, self.mix(*[self.tone(n2f(note(d + [0, 3, 4, 0][(step // 3) % 4], 0)), .2, .08, (1, .3)) for d in (2, 4)]), t, .15)
                t += beat; step += 1
                continue
            if step % 2 == 0:
                self.add(self.mus, self.tone(n2f(note([0, 0, 3, 0, 4, 3, 0, 4][(step // 2) % 8], 0) - 12), beat * .95, .25, (1, .5, .2)), t, bass_g)
            if step % 4 == 0: self.add(self.mus, kick, t, .8 if estilo != 'medieval' else .6)
            if step % 4 == 2: self.add(self.mus, snare, t, .22, .1)
            if estilo != 'medieval': self.add(self.mus, hat, t, .1, .3)
            t += beat / 2; step += 1
        fade = np.ones(self.N); fi, fo = int(SR * .3), int(SR * 2.5)
        fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
        self.mus *= fade[:, None] * .5

    # ---------- efectos ----------
    def whoosh(self, d=.35):
        n = int(SR * d); return self.lp(self.noise(d), 12) * np.sin(np.linspace(0, np.pi, n)) ** 2 * .9
    def pop(self, f=600):
        t = np.arange(int(SR * .12)) / SR; return np.sin(2 * np.pi * (f + 900 * np.exp(-t * 40)) * t) * self.env(len(t), .001, .04)
    def stamp(self):
        return self.mix(self.tone(80, .4, .1, (1, .5)) * 1.4, self.lp(self.noise(.12), 10) * self.env(int(SR * .12), .001, .03) * 1.2)
    def bell(self, f=1320):
        return self.mix(self.tone(f, 1.0, .4, (1, .2)) * .45, self.tone(f * 1.5, .8, .3) * .2)
    def church_bell(self):
        return self.mix(self.tone(196, 3.0, 1.2, (1, .6, .4, .3, .2)) * .5, self.tone(196 * 2.4, 2.0, .6) * .2)
    def knock(self):
        return self.mix(self.lp(self.noise(.1), 6) * self.env(int(SR * .1), .0005, .02) * 1.4, self.tone(200, .1, .03, (1, .4)))
    def step(self):
        return self.lp(self.noise(.08), 25) * self.env(int(SR * .08), .001, .02) * 1.1
    def register(self):
        return self.mix(self.tone(2400, .8, .3, (1, 0, .3)) * .5, self.tone(3600, .6, .15) * .3, self.lp(self.noise(.05), 3) * self.env(int(SR * .05), .001, .01))
    def paper(self):
        x = self.noise(.2); return (x - self.lp(x, 2)) * self.env(int(SR * .2), .01, .05) * .5
    def wink(self):
        t = np.arange(int(SR * .25)) / SR; return np.sin(2 * np.pi * (900 + 2200 * t) * t) * self.env(len(t), .005, .08) * .6
    def boing(self):
        t = np.arange(int(SR * .5)) / SR; return np.sin(2 * np.pi * (300 + 120 * np.sin(t * 40)) * t) * self.env(len(t), .005, .2) * .7
    def flute(self, notes, dur=.22):
        out = []
        for m in notes:
            t = np.arange(int(SR * dur)) / SR; f = n2f(m)
            vib = np.sin(2 * np.pi * 5.5 * t) * .004
            s = np.sin(2 * np.pi * f * t * (1 + vib)) + .25 * np.sin(4 * np.pi * f * t) + .05 * self.rs.uniform(-1, 1, len(t))
            out.append(s * np.minimum(t / .03, 1) * np.minimum((dur - t) / .05, 1))
        return np.concatenate(out) * .5
    def drum(self):
        return self.mix(self.tone(90, .35, .12, (1, .5)), self.lp(self.noise(.08), 6) * self.env(int(SR * .08), .001, .02))
    def crowd(self, d):
        x = self.lp(self.noise(d), 30); t = np.arange(len(x)) / SR
        return x * (.6 + .4 * np.sin(2 * np.pi * .7 * t)) * 1.5
    def thud(self):
        return self.mix(self.tone(70, .4, .12, (1, .4)) * 1.4, self.lp(self.noise(.1), 20) * self.env(int(SR * .1), .001, .03))
    def train(self, d):
        x = self.lp(self.noise(d), 40); t = np.arange(len(x)) / SR
        return x * (.5 + .5 * (np.sin(2 * np.pi * 3 * t) > .6)) * 1.2
    def shh(self):
        x = self.noise(1.2); return self.lp(x - self.lp(x, 2), 2) * np.sin(np.linspace(0, np.pi, len(x))) * .35
    def ding(self):
        return self.bell(1760)
    def fanfare(self):
        o = np.zeros(int(SR * 1.6))
        for i, m in enumerate([72, 76, 79, 84, 79, 84]):
            s = self.tone(n2f(m), .5, .25, (1, .5, .3, .2), .01) * .5; j = int(SR * i * .12); o[j:j + len(s)] += s[:len(o) - j]
        return o
    def sad(self):
        o = np.zeros(int(SR * 1.6))
        for i, m in enumerate([67, 66, 65, 64]):
            s = self.tone(n2f(m), .5 if i < 3 else 1.0, .3 if i < 3 else .6, (1, .5, .3)) * .45; j = int(SR * i * .3); o[j:j + len(s)] += s[:len(o) - j]
        return o

    # ---------- mezcla final ----------
    def guardar(self, voz_dir, salida):
        voz = np.zeros(self.N)
        for i in range(len(self.DURS)):
            w = wave.open(f'{voz_dir}/escena_{i + 1}.wav')
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
            j = int((self.ST[i] + self.PAD_IN - .05) * SR); voz[j:j + len(a)] += a[:self.N - j]
        voz /= np.max(np.abs(voz)) * 1.05
        k = int(SR * .25)
        envv = np.convolve(np.abs(voz), np.ones(k) / k, mode='same')
        duck = 1 - .6 * np.clip(envv / .08, 0, 1)
        k2 = int(SR * .1); duck = np.convolve(duck, np.ones(k2) / k2, mode='same')
        out = self.mus * duck[:, None] + self.efx * .8 + voz[:, None]
        out = np.tanh(out * 1.05); out /= np.max(np.abs(out)) * 1.06
        with wave.open(salida, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((out * 32767).astype(np.int16).tobytes())
        print('audio ok', round(self.DUR, 2))
