"""Audio completo de "En este pueblo": voz (Álvaro), música A/B/C generada, efectos, ducking y master a -13 LUFS / -1 dBTP.
Lee assets/linea.json y assets/voz/lineas/*.wav. Salida: assets/audio/mezcla.wav (+ musica.wav, efectos.wav, voz.wav de control)."""
import json, os, subprocess
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); AU = os.path.join(RAIZ, 'assets', 'audio'); os.makedirs(AU, exist_ok=True)
L = json.load(open(os.path.join(RAIZ, 'assets', 'linea.json'))); PL = {p['id']: p for p in L['planos']}; FIN = L['fin']
N = int(FIN * SR); db = lambda x: 10 ** (x / 20); rng = np.random.default_rng(11)
def st(m, pan=0.0):  # mono → estéreo con paneo (-1..1)
    a = (pan + 1) * np.pi / 4; return np.stack([m * np.cos(a), m * np.sin(a)], 1) * np.sqrt(2)
def pon(buf, x, t0, g=1.0):
    i = int(round(t0 * SR)); x = x if x.ndim == 2 else st(x); j = min(len(buf), i + len(x))
    if j > i >= 0: buf[i:j] += x[:j - i] * g
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'low'); return signal.lfilter(b, a, x, axis=0)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x, axis=0)
def bp(x, f1, f2, o=2): b, a = signal.butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x, axis=0)
def env(n, a=.005, d=.3): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def ruido(d): return rng.standard_normal(int(d * SR))
def leer(p):
    x, sr = sf.read(p, dtype='float64'); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = signal.resample_poly(x, SR, sr)
    return x
def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    r = o[o.rfind('Summary:'):]; g = lambda k: float(r.split(k)[1].split()[0])
    return g('I:'), g('LRA:'), g('Peak:')
def mide(x):
    p = os.path.join(AU, '_m.wav'); sf.write(p, x, SR, subtype='FLOAT'); return lufs(p)[0]
nota = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instrumentos ----------------
def rhodes(m, d, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; f = nota(m)
    x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .25) + .12 * np.sin(2 * np.pi * 7 * f * t) * np.exp(-t / .05))
    x *= np.minimum(1, t / .004) * np.exp(-t / 1.1) * (1 + .12 * np.sin(2 * np.pi * 4.5 * t)); x[-int(.03 * SR):] *= np.linspace(1, 0, int(.03 * SR)); return x * v * .25
def campana(m, d=.9):
    n = int(d * SR); t = np.arange(n) / SR; f = nota(m)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .15) + .25 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / .06)) * env(n, .002, .45) * .3
def bajo(m, d, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; f = nota(m); x = np.tanh(1.6 * np.sin(2 * np.pi * f * t)) * np.minimum(1, t / .01) * np.exp(-t / .9)
    x[-int(.02 * SR):] *= np.linspace(1, 0, int(.02 * SR)); return lp(x, 600) * v * .5
def bombo(g=1.0):
    n = int(.35 * SR); t = np.arange(n) / SR; f = 50 + 90 * np.exp(-t / .03); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .14) * g
def escobilla(g=1.0): x = bp(ruido(.28), 1500, 7000) * env(int(.28 * SR), .02, .09); return x * .5 * g
def platillo(g=1.0): x = hp(ruido(.09), 7000) * env(int(.09 * SR), .001, .025); return x * .3 * g
def palmas(g=1.0):
    x = np.zeros(int(.2 * SR))
    for k, dt in enumerate([0, .008, .017]): s = bp(ruido(.15), 900, 4500) * env(int(.15 * SR), .001, .03 + .02 * (k == 2)); i = int(dt * SR); x[i:i + len(s)] += s[:len(x) - i]
    return x * .6 * g
def sierra(m, d, v=1.0):
    n = int(d * SR); t = np.arange(n) / SR; x = 0
    for det in (-.08, .08): ph = (nota(m) * (1 + det / 100) * t) % 1; x = x + (2 * ph - 1)
    x = lp(x * .5, 3500) * np.minimum(1, t / .01) * np.exp(-t / .5); x[-int(.02 * SR):] *= np.linspace(1, 0, int(.02 * SR)); return x * v * .18

# ---------------- música ----------------
def lofi(dur, alegre=False):
    """A: lo-fi 82 BPM (C: versión alegre a 95 BPM con campanitas y palmas). Acordes Fmaj7 - Dm7 - Gm7 - C7."""
    bpm = 95 if alegre else 82; b = 60 / bpm; out = np.zeros((int((dur + 2) * SR), 2))
    acordes = [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 58]]; raices = [41, 38, 43, 36]
    mel = [72, 69, 67, 69, 72, 74, 72, 69, 70, 69, 67, 65, 67, 69, 67, 64]
    compas = 0; t = 0.0
    while t < dur:
        c = acordes[compas % 4]
        for k, off in enumerate([0, 1.5]):
            for m in c: pon(out, st(rhodes(m, b * 1.6, .8 if k else 1.0), (m - 57) / 30), t + off * b + .01 * (m % 3))
        pon(out, st(bajo(raices[compas % 4], b * 1.8)), t); pon(out, st(bajo(raices[compas % 4] + 7, b * .9, .8)), t + 2.5 * b)
        for beat in range(4):
            sw = .08 * b
            if beat in (0, 2): pon(out, st(bombo(.8)), t + beat * b)
            if beat == 2: pon(out, st(bombo(.5)), t + (beat + .75) * b)
            if beat in (1, 3): pon(out, st(escobilla(.9), .1), t + beat * b)
            pon(out, st(platillo(.6), .35), t + beat * b); pon(out, st(platillo(.35), .35), t + (beat + .5) * b + sw)
        if alegre:
            for j in range(4): pon(out, st(campana(mel[(compas * 4 + j) % 16] + 12), -.2), t + j * b)
            for beat in (1, 3): pon(out, st(palmas(.6), -.15), t + beat * b)
        compas += 1; t += 4 * b
    out = lp(out, 9000)
    cr = np.zeros(len(out))  # crujido de vinilo
    idx = rng.integers(0, len(cr), int(dur * 18)); cr[idx] = rng.uniform(-.25, .25, len(idx)); out += st(hp(cr, 2000) * .25 + hp(ruido(len(cr) / SR), 4000) * .004)
    return out[:int(dur * SR)]
def fiesta_pop(dur):
    """B: pop de fiesta 122 BPM: bombo a negras, palmas, sintetizador brillante, bajo saltarín."""
    bpm = 122; b = 60 / bpm; out = np.zeros((int((dur + 2) * SR), 2)); acordes = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; raices = [36, 31, 33, 29]
    gancho = [72, 74, 76, 79, 76, 74, 72, 67]
    compas, t = 0, 0.0
    while t < dur:
        c = acordes[compas % 4]
        for beat in range(4):
            pon(out, st(bombo(1.0)), t + beat * b)
            if beat in (1, 3): pon(out, st(palmas(1.0)), t + beat * b)
            pon(out, st(platillo(.8), .3), t + (beat + .5) * b)
            for m in c: pon(out, st(sierra(m, b * .45, .9), (m - 64) / 20), t + (beat + .5) * b)
            for e8 in range(2): pon(out, st(bajo(raices[compas % 4] + 12 * e8, b * .45, 1.0)), t + (beat + e8 * .5) * b)
        for j in range(8): pon(out, st(sierra(gancho[(j + compas) % 8] + 12, b * .4, .7), .2), t + j * .5 * b)
        compas += 1; t += 4 * b
    return out[:int(dur * SR)]

# ---------------- efectos ----------------
SFX = os.path.join(RAIZ, 'assets', 'sfx')
def sfx(nombre): return leer(os.path.join(SFX, nombre))
def grillos(dur, pan_amp=.8):
    x = np.zeros((int(dur * SR), 2))
    for k in range(int(dur * 2.2)):
        t0 = rng.uniform(0, dur); f = rng.uniform(4200, 5200); n = int(.18 * SR); t = np.arange(n) / SR
        ch = np.sin(2 * np.pi * f * t) * (np.sin(2 * np.pi * 28 * t) > 0) * np.hanning(n); pon(x, st(ch * rng.uniform(.3, 1), rng.uniform(-pan_amp, pan_amp)), t0)
    return x
def viento(dur):
    w = lp(ruido(dur), 500) * (.6 + .4 * np.sin(2 * np.pi * .13 * np.arange(int(dur * SR)) / SR)); return np.stack([w, np.roll(w, 2400)], 1) * .5
def murmullo(dur):
    x = np.zeros(int(dur * SR))
    for k in range(10): v = bp(ruido(dur), rng.uniform(250, 500), rng.uniform(900, 1600)); m = .5 + .5 * np.sin(2 * np.pi * rng.uniform(2, 5) * np.arange(len(v)) / SR + rng.uniform(0, 6)); x += v * m ** 2
    return st(x * .4)
def publico(dur, fuerza=1.0):
    x = np.zeros(int(dur * SR))
    for k in range(14): v = bp(ruido(dur), rng.uniform(300, 700), rng.uniform(1500, 3500)); m = .4 + .6 * np.abs(np.sin(2 * np.pi * rng.uniform(.5, 2) * np.arange(len(v)) / SR + rng.uniform(0, 6))); x += v * m
    ap = np.zeros(len(x)); idx = rng.integers(0, len(ap), int(dur * 40)); ap[idx] = 1; ap = bp(np.convolve(ap, env(int(.03 * SR), .001, .006))[:len(x)], 1000, 5000)
    return np.stack([x * .35 + ap * .6, np.roll(x, 900) * .35 + np.roll(ap, 1300) * .6], 1) * fuerza
def chapoteo():
    x = bp(ruido(.5), 300, 3000) * env(int(.5 * SR), .01, .12); return x * .8
def swish():
    n = int(.45 * SR); t = np.arange(n) / SR; x = bp(ruido(.45), 2000, 8000) * np.sin(np.pi * t / .45) ** 2; return x * .9
def silbato(d=.45):
    n = int(d * SR); t = np.arange(n) / SR; f = 2900 + 120 * np.sign(np.sin(2 * np.pi * 26 * t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .03)
    return x * .5 + bp(ruido(d), 2500, 3500) * .05
def bip():
    x = np.zeros(int(.35 * SR))
    for t0 in (0, .16): n = int(.1 * SR); t = np.arange(n) / SR; s = np.sign(np.sin(2 * np.pi * 1800 * t)) * .3 * np.minimum(1, (.1 - t) / .01); i = int(t0 * SR); x[i:i + n] += s
    return lp(x, 6000)
def rayado():
    n = int(.2 * SR); t = np.arange(n) / SR; f = 400 * (1 - t / .2) ** 2 + 60; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(ruido(.2), 800, 4000) * .4 * (np.sin(2 * np.pi * 30 * t) > 0)
    return x * np.linspace(1, .6, n)
def ladrido():
    x = np.zeros(int(.6 * SR))
    for t0 in (0, .28): n = int(.16 * SR); t = np.arange(n) / SR; f = 420 * np.exp(-t / .2); s = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, .005, .06); i = int(t0 * SR); x[i:i + n] += s
    return lp(bp(x, 250, 2500), 1500)   # lejano
def motor(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR; f = 70 + 15 * np.sin(np.pi * t / d); x = np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * .4 + lp(ruido(d), 900) * .5
    a = np.sin(np.pi * t / d) ** 2; pan = np.linspace(-.9, .9, n); x = x * a; return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * np.sqrt(2)
def pasos(n=4, sep=.42):
    x = np.zeros(int((n * sep + .2) * SR))
    for k in range(n): s = bp(ruido(.08), 300, 3000) * env(int(.08 * SR), .002, .02); i = int(k * sep * SR); x[i:i + len(s)] += s
    return x
def rechinido():
    n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (1800 + 900 * t / .12) * t) * env(n, .002, .05) * .4
def cuerda(f, d=1.2):   # Karplus-Strong
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = .996 * .5 * (buf[i % p] + buf[(i + 1) % p])
    return out
def rasgueo(notas, d=.9):
    x = np.zeros(int((d + .1) * SR))
    for k, m in enumerate(notas): s = cuerda(nota(m), d); i = int(k * .012 * SR); x[i:i + len(s)] += s[:len(x) - i]
    return lp(x, 4000) * .35
def golpe_costal():
    n = int(.25 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * (90 + 60 * np.exp(-t / .02)) * t) * env(n, .001, .07) + lp(ruido(.25), 1200) * env(n, .001, .03)) * .9
def resoplido():
    return bp(ruido(.45), 400, 2500) * np.sin(np.pi * np.arange(int(.45 * SR)) / (.45 * SR)) ** 2 * .6
def clic(f=3000): n = int(.03 * SR); return bp(ruido(.03), f * .7, f * 1.3) * env(n, .0005, .004) * 1.2
def tin(): return campana(96, .6) * 1.3
def burbujas():
    x = np.zeros(int(.6 * SR))
    for k in range(5): n = int(.05 * SR); t = np.arange(n) / SR; f = rng.uniform(500, 900) * (1 + 3 * t / .05); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .015); i = int(rng.uniform(0, .5) * SR); x[i:i + n] += s
    return x * .6
def fuuu(d=.8):
    n = int(d * SR); t = np.arange(n) / SR; return bp(ruido(d), 400, 4000) * (t / d) ** 1.5 * np.minimum(1, (d - t) / .05) * .8
def zumbido(d): t = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * 120 * t) + .3 * np.sin(2 * np.pi * 240 * t)) * .1

def main():
    ini = lambda i: PL[i]['ini']; fin = lambda i: PL[i]['ini'] + PL[i]['dur']
    # ---------- voz (sola a -14 LUFS) ----------
    voz = np.zeros(N)
    for p in L['planos']:
        if p['voz_ini'] is not None: x = leer(os.path.join(RAIZ, 'assets', 'voz', 'lineas', f"p{p['voz_id']}.wav")); i = int(p['voz_ini'] * SR); voz[i:i + len(x)] += x[:N - i]
    voz *= db(-14 - mide(voz)); V = st(voz)
    # ducking: envolvente de la voz (ataque 10 ms, release 250 ms) → hasta -5 dB
    e = np.abs(voz); a1, r1 = np.exp(-1 / (.01 * SR)), np.exp(-1 / (.25 * SR)); ev = np.zeros(N); y = 0.0
    sub = 16; es = e[::sub]; evs = np.zeros(len(es)); a1s, r1s = a1 ** sub, r1 ** sub
    for i, v in enumerate(es): y = a1s * y + (1 - a1s) * v if v > y else r1s * y + (1 - r1s) * v; evs[i] = y
    ev = np.interp(np.arange(N), np.arange(len(evs)) * sub, evs); act = np.clip(ev / (np.percentile(ev[ev > 1e-4], 60) + 1e-9), 0, 1)
    duck = db(-5.5 * act)[:, None]
    # ---------- música ----------
    mus = np.zeros((N, 2))
    tB = PL['15']['voz_ini']; tP = L['paro']; t29 = ini('29'); t40 = ini('40')
    A1 = lofi(tB + .6); A1[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]; pon(mus, A1 * db(-6), 0)
    B = fiesta_pop(tP - tB + .1); B[:int(.5 * SR)] *= np.linspace(0, 1, int(.5 * SR))[:, None]; B = B[:int((tP - tB) * SR)]
    pon(mus, B * db(-3.5), tB); pon(mus, st(rayado()) * db(-12), tP - .2)       # corte en seco en "paró", con disco rayado antes
    A2 = lofi(t40 - t29 + .4); A2[:int(1.5 * SR)] *= np.linspace(0, 1, int(1.5 * SR))[:, None]; A2[-int(.4 * SR):] *= np.linspace(1, 0, int(.4 * SR))[:, None]; pon(mus, A2 * db(-6), t29)
    C = lofi(FIN - t40, alegre=True); C[-int(1.6 * SR):] *= np.linspace(1, 0, int(1.6 * SR))[:, None]; pon(mus, C * db(-4.5), t40)
    i0 = int(tP * SR); mus[i0:int(t29 * SR)] = 0                                 # silencio de música después del corte
    mus = mus * duck
    # ---------- efectos ----------
    fx = np.zeros((N, 2))
    noche = ['1', '2', '3', '4', '5', '7', '9', '10', '11', '12', '13', '14a', '14c', '29', '29b', '30', '31', '32', '36', '37', '39', '40', '41', '42', '43', '44']
    for i in noche: d = PL[i]['dur']; pon(fx, grillos(d) * db(-30), ini(i)); pon(fx, viento(d) * db(-36), ini(i))
    for i in ['1', '3', '9', '13', '29', '31', '39']: pon(fx, st(zumbido(PL[i]['dur'])) * db(-44), ini(i))
    for i in ['2', '4', '5', '7', '10', '11', '12']:
        d = PL[i]['dur']; pon(fx, murmullo(d) * db(-30), ini(i)); fm = lp(fiesta_pop(d), 800); pon(fx, fm * db(-24), ini(i))
    for i in ['5', '7']:
        for k in range(3): pon(fx, st(chapoteo(), rng.uniform(-.5, .5)) * db(-22), ini(i) + .2 + k * .45)
    pon(fx, st(ladrido(), -.6) * db(-34), 13.0)
    for k in range(3): pon(fx, st(burbujas()) * db(-26), ini('6') + .3 + k * .7)
    pon(fx, motor(PL['9']['dur'] + .3) * db(-21), ini('9'))
    # ¡HUSS! (grupos de 3 "hus" de tu grabación): noche con eco, día seco; en el 32 suenan desde varias casas
    k = 0
    for p in L['planos']:
        for h in p['huss']:
            k += 1; arch = f"huss_{'dia' if p['id'] == '14b' else 'noche'}_{(k - 1) % 4 + 1}.wav"; x = sfx(arch)
            if p['id'] == '32':
                for j, (g, pan, dt) in enumerate([(-15, -.6, 0), (-21, .7, .05), (-26, -.2, .11), (-24, .4, .17)]): pon(fx, st(sfx(f'huss_noche_{(k + j) % 4 + 1}.wav'), pan) * db(g), h + dt)
            else: pon(fx, st(x) * db(-14), h)
    pon(fx, st(swish()) * db(-15), PL['14c']['huss'][-1] + .39 + .14 + .45); pon(fx, st(swish()) * db(-15), PL['21']['huss'][-1] + .39 + .14 + .45)   # cuando el balón entra al aro
    # partido: público, silbato, pasos, risas, bip del marcador
    for i in ['15', '16', '17', '18', '19', '20', '21', '22', '23']: pon(fx, publico(PL[i]['dur']) * db(-24), ini(i))
    pon(fx, publico(1.2, 1.8) * db(-20), PL['21']['huss'][-1] + 1.0)
    pon(fx, st(silbato()) * db(-18), ini('17') + .1)
    for k2 in range(4): pon(fx, st(rechinido(), rng.uniform(-.4, .4)) * db(-24), ini('18') + .2 + k2 * .45)
    risa = np.concatenate([bp(ruido(.11), 500, 2500) * env(int(.11 * SR), .01, .05) for _ in range(10)]); pon(fx, st(np.tile(risa, 2)[:int(2 * SR)] * .8) * db(-16), ini('19') + .1)
    pon(fx, st(bip()) * db(-18), ini('22') + .15)
    for i in ['24']: pon(fx, publico(tP - ini(i)) * db(-24), ini(i))
    # después del corte: un grillo y viento; luego murmullo muy bajo
    pon(fx, viento(t29 - tP) * db(-30), tP); pon(fx, grillos(t29 - tP, .3) * db(-30), tP); pon(fx, murmullo(t29 - tP - 1.2) * db(-40), tP + 1.2)
    # noche siguiente
    pon(fx, st(pasos(int((PL['29']['dur'] + PL['29b']['dur']) / .42))) * db(-24), ini('29') + .1)
    pon(fx, viento(PL['30']['dur']) * db(-30), ini('30'))
    for k2, ch in enumerate([[43, 47, 50, 55, 59, 67], [48, 52, 55, 60, 64], [50, 54, 57, 62, 66], [50, 53, 58, 61, 66]]): pon(fx, st(rasgueo(ch), .1) * db(-18), ini('33') + .1 + k2 * .45)
    for k2 in range(2): pon(fx, st(golpe_costal()) * db(-16), ini('34') + .35 + k2 * .6)
    pon(fx, st(resoplido()) * db(-20), ini('35') + .3); pon(fx, st(clic(2500)) * db(-20), ini('35') + 1.3)
    pon(fx, st(clic(2200)) * db(-20), ini('40') + .2); pon(fx, st(tin()) * db(-22), ini('40') + .25)
    for i in ['41', '42']:
        for k2 in range(2): pon(fx, st(burbujas()) * db(-24), ini(i) + .4 + k2 * 1.1)
    pon(fx, st(fuuu(PL['44']['dur'] + .2)) * db(-16), ini('44') + .15)
    # ---------- mezcla y master ----------
    sf.write(os.path.join(AU, 'voz.wav'), V, SR, subtype='FLOAT'); sf.write(os.path.join(AU, 'musica.wav'), mus, SR, subtype='FLOAT'); sf.write(os.path.join(AU, 'efectos.wav'), fx, SR, subtype='FLOAT')
    # música a ~-22 dB bajo la voz (B a ~-18, C a ~-20): ajuste por medición
    gm = db(-35 - mide(mus[:int(tB * SR)]))
    mix = V + mus * gm + fx; fade = int(.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    p0 = os.path.join(AU, 'mezcla_sin_master.wav'); sf.write(p0, mix, SR, subtype='FLOAT')
    I0 = lufs(p0)[0]
    pre = os.path.join(AU, '_pre.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p0, '-af', f"volume={-13 - I0 + 1.2:.2f}dB,acompressor=threshold=0.09:ratio=3.5:attack=25:release=350:makeup=1,acompressor=threshold=0.2:ratio=2:attack=5:release=80:makeup=1,aresample=192000,alimiter=limit={db(-1.3):.4f}:attack=1:release=60:level=false,aresample=48000", '-c:a', 'pcm_f32le', pre], check=True)
    I1 = lufs(pre)[0]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', f"volume={-13 - I1:.2f}dB,aresample=192000,alimiter=limit={db(-1.2):.4f}:attack=1:release=60:level=false,aresample=48000", '-ar', '48000', '-c:a', 'pcm_s24le', os.path.join(AU, 'mezcla.wav')], check=True)
    for f in ('_m.wav', '_pre.wav'): os.remove(os.path.join(AU, f))
    I, LRA, TP = lufs(os.path.join(AU, 'mezcla.wav')); print(f'MEZCLA: integrado {I} LUFS · LRA {LRA} LU · true peak {TP} dBTP')
    # curva por tramos
    x, _ = sf.read(os.path.join(AU, 'mezcla.wav'))
    for a, b, nom in [(0, tB, 'inicio (A)'), (tB, tP, 'partido (B)'), (tP, tP + 1.2, 'silencio tras "paró"'), (tP + 1.2, t29, 'diálogo con ambiente'), (t29, t40, 'noche siguiente (A)'), (t40, FIN, 'mi propia fiesta (C)')]:
        print(f'  {nom:24s} {a:6.2f}-{b:6.2f} s  {mide(x[int(a * SR):int(b * SR)]):6.1f} LUFS')
    os.remove(os.path.join(AU, '_m.wav'))
main()
