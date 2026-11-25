"""Mezcla de una historia: música oscura generada (baja cuando habla el narrador), golpe suave + whoosh en cada corte,
efectos extra del video (efectos.py opcional, función efectos(A)) y cierre de marca. Normaliza a −14 LUFS y −1.5 dBTP.
Uso (desde la carpeta del video): python3 ../lib/audio.py   → build/audio.wav"""
import json, os, re, subprocess, sys, wave
import numpy as np
SR = 48000
G = json.load(open('guion.json')); T = json.loads(re.search(r'window\.T = (.*);', open('tiempos.js').read()).group(1))
DUR = T['fin']; N = int(SR * DUR); rs = np.random.default_rng(7)
n2f = lambda m: 440 * 2 ** ((m - 69) / 12)

class Mezcla:
    def __init__(s):
        s.mus = np.zeros((N, 2)); s.fx = np.zeros((N, 2)); s.T = T; s.SR = SR; s.rs = rs
        s.cortes = [l['corte'] for l in T['lineas']][1:]; s.marca = min(DUR - 1.6, T['voz_fin'] + .55)
    def add(s, buf, sig, t0, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i < 0 or i >= N or len(sig) == 0: return
        sig = sig[:N - i] * g; buf[i:i + len(sig), 0] += sig * (1 - max(pan, 0)); buf[i:i + len(sig), 1] += sig * (1 + min(pan, 0))
    def efecto(s, sig, t0, g=1.0, pan=0.0): s.add(s.fx, sig, t0, g, pan)
    # ---- utilidades ----
    @staticmethod
    def env(n, a=.005, d=.3): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
    def ruido(s, d): return rs.uniform(-1, 1, int(SR * d))
    @staticmethod
    def lp(x, k): k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, mode='same')
    def tono(s, f, d, dec=.3, harm=(1, .3, .1), a=.003):
        t = np.arange(int(SR * d)) / SR; return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * s.env(len(t), a, dec)
    # ---- efectos ----
    def golpe(s, f=48, d=1.4):   # golpe grave suave (cambio de escena)
        t = np.arange(int(SR * d)) / SR; fr = f * (1 + 1.5 * np.exp(-t * 18)); ph = 2 * np.pi * np.cumsum(fr) / SR
        return (np.sin(ph) * np.exp(-t / .35) + s.lp(s.ruido(d), 30) * np.exp(-t / .06) * .6) * np.minimum(t / .004, 1)
    def whoosh(s, d=.45):
        x = s.ruido(d); y = x - s.lp(x, 6); t = np.arange(len(y)) / SR; return s.lp(y, 3) * np.sin(np.pi * t / d) ** 2 * .7
    def subida(s, d=1.2):   # riser
        x = s.ruido(d); t = np.arange(len(x)) / SR; k = (t / d) ** 2; return (x - s.lp(x, 8)) * k * .6
    def campana(s, f=880, d=2.5): return s.tono(f, d, .8, (1, .5, .25, .12)) * .6 + s.tono(f * 2.76, d, .3, (1,)) * .15
    def latido(s): a = s.tono(55, .45, .07, (1, .4)); b = np.concatenate([np.zeros(int(SR * .18)), s.tono(50, .27, .07, (1, .4)) * .7]); return a + b[:len(a)]
    def tic(s): return s.tono(2400, .04, .008, (1, .3)) * .5
    def crujido(s, d=.6): x = s.ruido(d); t = np.arange(len(x)) / SR; return (x * (rs.random(len(x)) > .985)) * np.exp(-t / .25) * 3 + s.lp(x, 40) * np.exp(-t / .2)
    def estruendo(s, d=3.0): x = s.lp(s.ruido(d), 60); t = np.arange(len(x)) / SR; return x * 6 * np.minimum(t / .05, 1) * np.exp(-t / (d / 2.5)) + s.golpe(32, d) * .8
    def viento(s, d): x = s.ruido(d); y = s.lp(x, 25) - s.lp(x, 200); t = np.arange(len(y)) / SR; return y * (1 + .5 * np.sin(2 * np.pi * .17 * t)) * 2.5
    def agua(s, d): x = s.ruido(d); y = s.lp(x, 12) - s.lp(x, 80); t = np.arange(len(y)) / SR; return y * (1 + .6 * np.sin(2 * np.pi * .4 * t) * np.sin(2 * np.pi * .13 * t)) * 1.6
    def grillos(s, d):
        t = np.arange(int(SR * d)) / SR; ch = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > .2) * (np.sin(2 * np.pi * 1.3 * t) > -.3); return ch * .05
    def pop(s, f=700): t = np.arange(int(SR * .12)) / SR; return np.sin(2 * np.pi * (f + 900 * np.exp(-t * 40)) * t) * np.exp(-t / .03)
    def ladrido(s):
        t = np.arange(int(SR * .18)) / SR; f = 420 + 300 * np.exp(-t * 25); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + s.ruido(.18)[:len(t)] * .3; return s.lp(x, 6) * np.minimum(t / .01, 1) * np.exp(-t / .06)
    def motor(s, d, f=38): t = np.arange(int(SR * d)) / SR; x = np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * 7 * t)) * .5 + s.lp(s.ruido(d), 50) * 1.5; return x * np.minimum(t / .5, 1) * np.minimum((d - t) / .5, 1)
    def pajaros(s, d):
        out = np.zeros(int(SR * d))
        for k in range(int(d * 2)):
            i = int(rs.uniform(0, d - .3) * SR); n = int(SR * .09); tt = np.arange(n) / SR; ch = np.sin(2 * np.pi * (2600 + 900 * np.sin(2 * np.pi * 18 * tt)) * tt) * np.sin(np.pi * tt / .09); out[i:i + n] += ch * .25
        return out
    def geiger(s, d, tasa=6):
        out = np.zeros(int(SR * d)); n = int(d * tasa)
        for k in range(n): i = int(rs.uniform(0, d) * SR); c = s.ruido(.004) * np.exp(-np.arange(int(SR * .004)) / SR / .001); out[i:i + len(c)] += c[:len(out) - i] * .9
        return out
    def crepitar(s, d): x = s.ruido(d); return x * (rs.random(len(x)) > .992) * 1.2 + s.lp(x, 30) * .4
    def melodia(s, notas, dur=.42, f=1.0):
        out = np.zeros(int(SR * (len(notas) * dur + 1.5)))
        for k, m in enumerate(notas):
            if m is None: continue
            x = s.tono(n2f(m), dur * 2.2, dur * .9, (1, .45, .2, .1), .02); i = int(k * dur * SR); out[i:i + len(x)] += x[:len(out) - i]
        return out * f
    # ---- música ----
    def musica(s, estilo):
        t = np.arange(N) / SR; out = np.zeros(N)
        prog = {'oscuro': [[38, 45, 50, 53], [36, 43, 48, 51], [41, 48, 53, 56], [40, 47, 52, 55]], 'misterio': [[40, 47, 52, 55], [41, 48, 53, 57], [38, 45, 50, 54], [40, 46, 52, 55]],
                'epico': [[38, 45, 50, 53], [34, 41, 46, 50], [36, 43, 48, 52], [33, 40, 45, 49]]}[estilo if estilo in ('oscuro', 'misterio', 'epico') else 'oscuro']
        barra = 4.0
        for i in range(int(DUR / barra) + 1):
            ac = prog[i % len(prog)]; t0 = i * barra; n = int(SR * (barra + 1.5)); tt = np.arange(n) / SR
            env = np.minimum(tt / 1.2, 1) * np.minimum(np.maximum(barra + 1.5 - tt, 0) / 1.5, 1)
            pad = sum(np.sin(2 * np.pi * n2f(m) * tt + .6 * np.sin(2 * np.pi * .3 * tt + k)) * (.5 if k == 0 else .28) for k, m in enumerate(ac))
            pad += .12 * np.sin(2 * np.pi * n2f(ac[0] - 12) * tt)
            a = int(t0 * SR); b = min(N, a + n); out[a:b] += (pad * env)[:b - a] * .16
        # pulso grave lento (latido) y, en misterio, notas de caja de música
        bpm = 70 if estilo != 'misterio' else 60
        for k in range(int(DUR * bpm / 60)):
            tb = k * 60 / bpm
            if tb > 1.0: s.add(s.mus, s.tono(46, .5, .18, (1, .3)) * .35, tb)
        if estilo == 'misterio':
            esc = [64, 67, 71, 72, 71, 67, 64, 62]
            for k in range(int(DUR / .75)):
                if k % 8 in (5, 7) or k * .75 < 1.0: continue
                s.add(s.mus, s.tono(n2f(esc[k % 8] + 12), 1.2, .5, (1, .2, .08)) * .07, k * .75, pan=.3 * np.sin(k))
        out += s.lp(rs.uniform(-1, 1, N), 400) * .25   # rumor de fondo
        s.mus[:, 0] += out; s.mus[:, 1] += out * .97
    def guardar(s, salida='build/audio.wav'):
        with wave.open('build/voz.wav') as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; vs = w.getframerate()
        if vs != SR: raise SystemExit('voz no está a 48 kHz')
        voz = np.zeros(N); voz[:min(N, len(v))] = v[:N]
        envv = s.lp(np.abs(voz), int(SR * .05)) * 2.2; duck = 1 - .72 * np.clip(envv / .06, 0, 1); duck = s.lp(duck, int(SR * .12))
        # la música termina en el cierre con una caída suave
        fade = np.ones(N); i0 = int(s.marca * SR); fade[i0:] = np.linspace(1, .55, N - i0)
        mezcla = s.mus * (duck * fade)[:, None] * .9 + s.fx * .8 + voz[:, None] * 1.0
        pk = np.max(np.abs(mezcla)); mezcla = mezcla / max(pk, 1e-9) * .89
        tmp = 'build/premezcla.wav'
        with wave.open(tmp, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mezcla, -1, 1) * 32767).astype(np.int16).tobytes())
        r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
        m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000", '-ar', '48000', salida], check=True)
        print('audio listo', salida, round(DUR, 2), 's')

A = Mezcla(); A.musica(G.get('musica', 'oscuro'))
for c in A.cortes: A.efecto(A.golpe(), c - .02, .55); A.efecto(A.whoosh(), c - .3, .35)
A.efecto(A.subida(1.0), A.marca - 1.0, .4); A.efecto(A.campana(660), A.marca + .05, .35); A.efecto(A.campana(990), A.marca + .25, .2)
if os.path.exists('efectos.py'):
    sys.path.insert(0, os.getcwd()); import efectos; efectos.efectos(A)
A.guardar()
