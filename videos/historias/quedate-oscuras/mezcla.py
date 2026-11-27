"""Música (drone de terror original, Re menor) + efectos sincronizados + voz → audio/mezcla.wav (−14 LUFS, −1 dBTP).
Todo se sintetiza aquí con numpy: no se usa audio de nadie más.
Uso: /root/.venvs/video/bin/python mezcla.py   (después de voz.py y eventos.py)"""
import json, re, subprocess, numpy as np
SR = 48000; rng = np.random.default_rng(17)
T = json.loads(re.sub(r'^window\.T = |;\s*$', '', open('tiempos.js').read().strip())); EV = json.load(open('subs/eventos.json'))
P, E, FIN = T['palabras'], T['escenas'], T['fin']; N = int(FIN * SR) + SR
corte = [e['corte'] for e in E] + [FIN]
def pal(esc, rx, k=0):
    xs = [a for a, b, w, hl, e in P if e == esc - 1 and re.search(rx, w, re.I)]; return xs[k] if xs else None
def fin_pal(esc, rx):
    xs = [b for a, b, w, hl, e in P if e == esc - 1 and re.search(rx, w, re.I)]; return xs[-1] if xs else None
def cuadro(t): return round(t * 30) / 30
voz = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'audio/vo_full.wav', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-']), np.int16).astype(np.float32) / 32768
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
mus = np.zeros(N, np.float32); fx = np.zeros(N, np.float32)
t = np.arange(N) / SR
def env(d, a=.005, r=.1):
    n = int(d * SR); e = np.ones(n); na, nr = int(a * SR), int(r * SR); e[:na] = np.linspace(0, 1, na) if na else 1; e[n - nr:] *= np.linspace(1, 0, nr) if nr else 1; return e
def add(buf, s, t0, g=1.0):
    a = int(t0 * SR);
    if a < 0: s = s[-a:]; a = 0
    s = s[: max(0, N - a)]; buf[a:a + len(s)] += s * g
def tono(f, d, tipo='sin'):
    tt = np.arange(int(d * SR)) / SR; ph = 2 * np.pi * f * tt
    return {'sin': np.sin(ph), 'saw': 2 * (f * tt % 1) - 1, 'sq': np.sign(np.sin(ph))}[tipo]
def lp(s, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(s); acc = 0.
    for i in range(len(s)): acc = (1 - a) * s[i] + a * acc; y[i] = acc
    return y
def lpf(s, fc):  # rápido (FFT)
    S = np.fft.rfft(s); f = np.fft.rfftfreq(len(s), 1 / SR); S *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(S, len(s))
def hpf(s, fc):
    S = np.fft.rfft(s); f = np.fft.rfftfreq(len(s), 1 / SR); S *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(S, len(s))
def reverb(s, dec=2.5, wet=.35):
    n = int(dec * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / dec); ir = lpf(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    L = len(s) + n; w = np.fft.irfft(np.fft.rfft(s, L) * np.fft.rfft(ir, L), L); out = np.pad(s, (0, n)) * (1 - wet) + w * wet * .6; return out
# ================= MÚSICA =================
# pad grave en Re menor con detune (D2, A2, D3, F3) — sube y baja suave
def pad(notas, dur, det=.25):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for f in notas:
        for d in (-det, 0, det): s += (2 * ((f * (1 + d / 100)) * tt % 1) - 1) * .2
    return lpf(s, 700)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
padA = pad([hz(38), hz(45), hz(50), hz(53)], N / SR)[:N]; mus += padA * .22
ruido = lpf(rng.standard_normal(N), 400) * .25; mus += ruido * (.6 + .4 * np.sin(t * .2))
# volumen de la música por tramos: casi desaparece (−32 dB) en silencios y escenas 4, 13, 16
vol = np.ones(N)
def tramo(a, b, v, rampa=.12):
    ia, ib = int(a * SR), int(b * SR); vol[ia:ib] = np.minimum(vol[ia:ib], v)
    r = int(rampa * SR);
    if ia - r > 0: vol[ia - r:ia] = np.minimum(vol[ia - r:ia], np.linspace(1, v, r))
for esc in (4, 13, 16): tramo(corte[esc - 1], corte[esc], 10 ** (-32 / 20))
# piano agudo aislado cada 4-6 s con reverb larga
def piano(f, d=3.0):
    tt = np.arange(int(d * SR)) / SR; s = sum(np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (2.5 + k)) / k ** 1.5 for k in range(1, 6)); return s * env(d, .002, .5)
notas = [74, 77, 81, 76, 74, 72, 77, 69, 74, 81, 79, 77]; tp, k = 3.0, 0
while tp < FIN - 6: add(mus, reverb(piano(hz(notas[k % len(notas)])), 3.5, .5), tp, .16); tp += 4 + (k * 7 % 3); k += 1
# latido 60 BPM desde la escena 12
def latido():
    d = .5; tt = np.arange(int(d * SR)) / SR; a = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 22); b = np.sin(2 * np.pi * 46 * tt) * np.exp(-tt * 26)
    return a + np.pad(b, (int(.22 * SR), 0))[: len(a)] * .8
tb = corte[11]
while tb < corte[22]: add(mus, latido(), tb, .55); tb += 1.0
# risers (14-15 y 17)
def riser(d):
    tt = np.arange(int(d * SR)) / SR; f = 200 * (6 ** (tt / d)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * .4 + hpf(rng.standard_normal(len(tt)), 2000) * .25 * (tt / d)
    return s * (tt / d) ** 2
add(mus, riser(corte[15] - corte[13]), corte[13], .35); add(mus, riser(corte[17] - corte[16]), corte[16], .3)
mus *= vol
# ducking: −4 dB cuando hay voz
envv = np.abs(voz); envv = lpf(envv, 8); duck = np.where(envv > .02, 10 ** (-4 / 20), 1.0); duck = lpf(duck, 6); mus *= duck
# silencio REAL de 0.8 s tras "también" (escena 16)
tt16 = fin_pal(16, r'tambi');
if tt16: a, b = int(tt16 * SR), int((tt16 + .8) * SR); mus[a:b] = 0
# ================= EFECTOS =================
def alerta(d, g=1.0):  # dos tonos agudos alternados, ásperos (tipo alerta de emergencia)
    tt = np.arange(int(d * SR)) / SR; f = np.where((tt * 4) % 1 < .5, 853, 960); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .5
    return lpf(s, 4500) * env(d, .002, .01) * g
def vibra(d):
    tt = np.arange(int(d * SR)) / SR; on = ((tt * 2) % 1 < .55).astype(float); return np.sin(2 * np.pi * 150 * tt) * on * (1 + .4 * np.sin(2 * np.pi * 37 * tt)) * .6
def clic(g=1.0):
    d = int(.08 * SR); tt = np.arange(d) / SR; return (lpf(rng.standard_normal(d), 6000) * np.exp(-tt * 180) * .7 + np.sin(2 * np.pi * 140 * tt) * np.exp(-tt * 60) * .5) * g
def golpe_piano(f=hz(26), d=4.0):
    return reverb(piano(f, d) + piano(f * 2, d) * .5, 3.5, .5)
def sub(d=1.4):
    tt = np.arange(int(d * SR)) / SR; f = 70 * np.exp(-tt * 1.8) + 28; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
def ding():
    return reverb(np.sin(2 * np.pi * 1318 * np.arange(int(.6 * SR)) / SR) * np.exp(-np.arange(int(.6 * SR)) / SR * 8) * .5, 1.2, .3)
def whoosh(d=.5):
    n = int(d * SR); s = hpf(rng.standard_normal(n), 300); s = lpf(s, 2500); return s * np.sin(np.linspace(0, np.pi, n)) ** 2 * .4
def viento(d):
    n = int(d * SR); return lpf(rng.standard_normal(n), 500) * (.5 + .5 * np.sin(np.arange(n) / SR * .9)) * .5
def zumbido(d, f=60):
    tt = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * 2 * f * tt) + .3 * np.sign(np.sin(2 * np.pi * 3 * f * tt))) * .2
def ladrido():
    d = .22; tt = np.arange(int(d * SR)) / SR; f = 520 * np.exp(-tt * 4) + 260; s = (2 * ((np.cumsum(f) / SR) % 1) - 1) * np.exp(-tt * 14); return lpf(s + lpf(rng.standard_normal(len(tt)), 2500) * .3 * np.exp(-tt * 20), 2600)
def crujido(d=.8, g=1.0):
    n = int(d * SR); tt = np.arange(n) / SR; f = 180 + 90 * np.sin(tt * 7); imp = (rng.random(n) < (40 + 260 * np.sin(np.pi * tt / d)) / SR).astype(float)
    s = np.convolve(imp, np.sin(2 * np.pi * 900 * np.arange(int(.004 * SR)) / SR) * np.exp(-np.arange(int(.004 * SR)) / SR * 900), 'same')
    s += np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 * np.sin(np.pi * tt / d); return s * g
def paso():
    d = .25; tt = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 18) + lpf(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 30) * .5)
def estatica(d):
    return hpf(rng.standard_normal(int(d * SR)), 1500) * .35
def respiracion(d=2.0):
    n = int(d * SR); s = lpf(hpf(rng.standard_normal(n), 300), 1800); e = np.sin(np.linspace(0, np.pi, n)) ** 2; return s * e * .35
def tinnitus(d=1.0):
    tt = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * 7400 * tt) * np.linspace(1, 0, len(tt)) * 10 ** (-35 / 20)
# --- escena 1-2: alerta desde el cuadro 0, se corta en seco al terminar la frase de la escena 2 ---
fin_alerta = fin_pal(2, r'oscuras') or corte[2]
add(fx, alerta(fin_alerta), 0, .32); add(fx, vibra(min(4, corte[1])), 0, .35); add(fx, zumbido(corte[2] - fin_alerta, 50), fin_alerta, .12)
# --- escena 3: muchas alertas desfasadas y lejanas + sirena ---
for k in range(14):
    d0 = corte[2] + k * .11; s = alerta(corte[3] - d0, .5); s = lpf(s, 1800 - k * 60); add(fx, reverb(s, 1.5, .5)[: int((corte[3] - d0) * SR)], d0, .06)
tt3 = np.arange(int((corte[3] - corte[2]) * SR)) / SR; add(fx, np.sin(2 * np.pi * np.cumsum(600 + 250 * np.sin(2 * np.pi * .35 * tt3)) / SR) * .3, corte[2], .1)
# --- escena 4: todas las alarmas se cortan en el mismo cuadro que el rojo; tinnitus ---
toff = cuadro(pal(4, r'silencio')); fx[int(toff * SR):int(corte[4] * SR)] *= 0; add(fx, tinnitus(1.0), toff, 1.0)
# --- escena 5: tic de reloj + piano grave en "3:17" ---
for k in range(4): add(fx, clic(.25), corte[4] + .2 + k * 1.0)
add(fx, golpe_piano(), pal(5, r'3:17') or corte[4] + .6, .5)
# --- escena 6: ding + whoosh por línea ---
add(fx, ding(), corte[5] + .05, .4); d6 = corte[6] - corte[5]
for k in range(5): add(fx, whoosh(.4), corte[5] + (k + .3) * d6 * .8 / 5.2, .5)
# --- escena 7: viento + zumbido de farola al parpadear ---
add(fx, viento(corte[7] - corte[6]), corte[6], .35); add(fx, zumbido(.5, 120), corte[6] + .5, .25)
# --- 8: tela y respiración | 9: roce de cortina | 10: sub drop en "no abras" | 11: piano grave ---
add(fx, respiracion(1.6), corte[7] + .3, .5); add(fx, whoosh(1.2) * .5, corte[8] + .2, .4)
tno = pal(10, r'^…?no') if pal(10, r'^…?no') else corte[10] - 1; add(fx, sub(), tno, .9)
add(fx, golpe_piano(hz(26), 5), corte[10] + .1, .6)
# --- 12: un clic por ventana, al cuadro; el último con más reverb ---
for i, ta in enumerate(EV['apagados12']):
    s = clic(.8 if i < len(EV['apagados12']) - 1 else 1.1)
    if i == len(EV['apagados12']) - 1: s = reverb(s, 1.6, .5)
    add(fx, s, cuadro(ta) - .004)
# --- 13: respiración lenta + 2 latidos ---
add(fx, respiracion(2.2), corte[12] + .1, .6); add(fx, latido(), corte[12] + .4, .8); add(fx, latido(), corte[12] + 1.4, .8)
# --- 14: clic de linterna ---
tl14 = pal(14, r'linterna'); add(fx, clic(.9), (tl14 or corte[13] + 2) - .5)
# --- 15: ladridos con eco, cada vez más seguidos, y viento que se arremolina ---
tl15 = pal(15, r'ladrar') or corte[14] + .5; tb, gap = tl15, .55; tcorte = cuadro(pal(16, r'apaga') or corte[15] + 1)
while tb < tcorte: add(fx, reverb(ladrido(), 1.2, .4), tb, .45); tb += gap; gap = max(.28, gap * .9)
fx[int(tcorte * SR):int((tcorte + .05) * SR)] = 0; fx[int(tcorte * SR):int(corte[16] * SR)] = 0
add(fx, viento(corte[15] - corte[14]) * np.linspace(.3, 1.2, int((corte[15] - corte[14]) * SR)), corte[14], .45)
# después de "también": 0.8 s de silencio total y un golpe sordo lejano
if tt16: add(fx, lpf(paso(), 200), tt16 + .8, .9)
# --- 17: ráfaga corta de alerta + piano agudo disonante ---
add(fx, alerta(.45), corte[16], .3); add(fx, reverb(piano(hz(85)) + piano(hz(86)) * .8, 2.5, .5), corte[16] + .05, .3)
# --- 18: crujido leve de la casa | 19: zumbido del refri que sube ---
add(fx, crujido(.6, .25), corte[17] + .4); d19 = corte[19] - corte[18]
add(fx, zumbido(d19, 60) * np.linspace(.4, 1.4, int(d19 * SR)), corte[18], .5)
# --- 20: estática (4 cuadros al entrar y salir) + 3 pasos pesados ---
add(fx, estatica(4 / 30), corte[19], .8); add(fx, estatica(4 / 30), corte[20] - 4 / 30, .8); d20 = corte[20] - corte[19]
for k in range(3): add(fx, paso(), corte[19] + .4 + k * min(.75, d20 / 4), .9)
add(fx, estatica(d20) * .25, corte[19], .35)
# --- 21: crujido largo en "cruje" | 22: latido doble + zumbido del refri ---
add(fx, crujido(1.1, .9), pal(21, r'cruje') or corte[20] + 3)
add(fx, latido(), corte[21] + .3, .9); add(fx, zumbido(corte[22] - corte[21], 60), corte[21], .45)
# --- 23: pop al entrar cada tarjeta | 24: golpe final en "verlo" ---
def pop(): tt = np.arange(int(.12 * SR)) / SR; return np.sin(2 * np.pi * (600 + 900 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 30) * .6
for rx in (r'^A', r'^B'):
    tq = pal(23, rx);
    if tq: add(fx, pop(), tq, .5)
tpill = pal(24, r'^Sígueme');
if tpill: add(fx, pop(), tpill, .5)
tv = fin_pal(24, r'verlo');
if tv: add(fx, sub(1.6) + reverb(piano(hz(26)), 2.5, .4)[: int(1.6 * SR)] * .4, tv - .05, 1.0)
# ================= MEZCLA =================
def lufs(x):  # medición con ffmpeg
    out = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
mus = mus / (np.abs(mus).max() + 1e-9); fx = fx / (np.abs(fx).max() + 1e-9)
mezcla = voz * 1.0 + mus * .16 + fx * .42
open('audio/mezcla_seca.f32', 'wb').write(mezcla.astype(np.float32).tobytes())
src = ['-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio/mezcla_seca.f32']
I = lufs(np.frombuffer(open('audio/mezcla_seca.f32', 'rb').read(), np.float32)[: int(FIN * SR)]); g = -14 - I
for _ in range(3):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *src, '-af', f'atrim=0:{FIN},volume={g:.2f}dB,alimiter=limit=0.84:attack=2:release=60:level=false,aresample=48000', '-ac', '2', '-ar', '48000', 'audio/mezcla.wav'], check=True)
    o = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/mezcla.wav', '-af', 'ebur128', '-f', 'null', '-'], capture_output=True).stderr.decode(); Io = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])
    print('LUFS', Io); 
    if abs(Io + 13.8) < .3: break
    g += -13.8 - Io
print('mezcla lista', FIN, 's')
