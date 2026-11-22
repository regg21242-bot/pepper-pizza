"""Efecto "¡HUSS!" con la voz de la grabación (assets/voz/huss/huss_voz.wav).
1) Detecta cada "hus" por volumen y lo recorta (10 ms antes del soplido → fin de la "s"), fundido de 5 ms.
2) Escoge los 6 mejores (cortos, con "s" clara y caída de tono).
3) Procesa cada uno con ffmpeg: adeclip, afftdn, pasa-altos 120 Hz, +2 semitonos (rubberband), +3 dB @2.5k, +2 dB @6k, compresor 6:1 (2/50 ms).
4) Agrega debajo el golpe grave (seno 90→45 Hz, 60 ms) a −12 dB y arma 4 grupos de 3 (0.00, 0.20, 0.39 s).
5) Versiones NOCHE (reverb de patio 0.5 s, 12 %) y DÍA (seca); limitador con pico a −1 dBFS.
Salidas: assets/sfx/huss_noche_1-4.wav, huss_dia_1-4.wav, huss_prueba_noche.wav y revision/huss_espectrograma.png"""
import os, subprocess
import numpy as np, soundfile as sf

SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'assets', 'voz', 'huss', 'huss_voz.wav')
SFX = os.path.join(RAIZ, 'assets', 'sfx'); REV = os.path.join(RAIZ, 'revision'); TMP = os.path.join(RAIZ, 'assets', 'voz', 'huss', 'tmp'); os.makedirs(TMP, exist_ok=True)
db = lambda x: 10 ** (x / 20)
GOLPES, SEP_GRUPOS = [0.00, 0.20, 0.39], 0.97
ORDENES = [(0, 1, 2), (3, 4, 5), (1, 5, 3), (4, 2, 0)]

def ff(entrada, salida, af):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', entrada, '-af', af, '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_f32le', salida], check=True)

def detectar(x):
    """Inicio y fin de cada "hus": energía en ventanas de 5 ms por encima de −22 dB del máximo."""
    n = int(.005 * SR); e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n)]); edb = 20 * np.log10(e + 1e-9)
    on = edb > edb.max() - 22; segs, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            segs.append((i * n, j * n)); i = j
        else: i += 1
    return segs, edb

def pitch(seg):
    seg = seg - seg.mean(); ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]; lo, hi = int(SR / 600), int(SR / 120); k = lo + np.argmax(ac[lo:hi]); return SR / k, ac[k] / (ac[0] + 1e-9)

def puntua(c):
    """Más corto, más energía de "s" (>4 kHz) al final y mayor caída de tono = mejor."""
    d = len(c) / SR; f = np.abs(np.fft.rfft(c[int(len(c) * .55):])); fr = np.fft.rfftfreq(len(c) - int(len(c) * .55), 1 / SR)
    s = f[fr > 4000].sum() / (f.sum() + 1e-9)
    f0 = [pitch(c[int(t * SR):int((t + .025) * SR)]) for t in (.02, .07)]; caida = f0[0][0] / max(80, f0[1][0])
    return s * 2 + min(caida, 2.2) - d * 3

def golpe_grave(n):
    t = np.arange(int(.06 * SR)) / SR; f = 90 * (45 / 90) ** (t / .06); g = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .002) * np.exp(-t / .03)
    out = np.zeros(n); out[:min(n, len(g))] = g[:n]; return out

def reverb(x, rt60=.5, mezcla=.12, seed=7):
    rng = np.random.default_rng(seed); n = int(rt60 * 1.2 * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-6.91 * t / rt60); ir = np.convolve(ir, np.ones(5) / 5, mode='same'); ir = np.concatenate([np.zeros(int(.015 * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.convolve(x, ir); seco = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return (1 - mezcla) * seco + mezcla * wet * (np.abs(seco).max() / (np.abs(wet).max() + 1e-9))

def limitar(x, salida):
    p = os.path.join(TMP, '_lim.wav'); sf.write(p, x / np.abs(x).max() * .5, SR, subtype='FLOAT')
    pico = np.abs(sf.read(p)[0]).max(); gan = 20 * np.log10(db(-.5) / pico)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-af', f'volume={gan:.2f}dB,aresample=192000,alimiter=limit={db(-1):.4f}:attack=0.5:release=40:level=false,aresample=48000', '-ar', '48000', '-c:a', 'pcm_s24le', salida], check=True)

def main():
    x, sr = sf.read(ORIG); assert sr == SR
    segs, _ = detectar(x); cands = []
    for a, b in segs:
        a2, b2 = max(0, a - int(.01 * SR)), min(len(x), b + int(.005 * SR)); d = (b2 - a2) / SR
        if .09 <= d <= .26 and np.abs(x[a:b]).max() > .6: cands.append((a2, b2))
    print('candidatos', [(round(a / SR, 2), round((b - a) / SR, 3)) for a, b in cands])
    clips = []
    for a, b in cands:
        c = x[a:b].copy(); nf = int(.005 * SR); c[:nf] *= np.linspace(0, 1, nf); c[-nf:] *= np.linspace(1, 0, nf); clips.append((puntua(c), a / SR, c))
    clips = sorted(clips, key=lambda q: -q[0])[:6]; clips = sorted(clips, key=lambda q: q[1]); print('elegidos', [round(q[1], 2) for q in clips])
    procesados = []
    for k, (_, t0, c) in enumerate(clips):
        e, s = os.path.join(TMP, f'hus{k}_in.wav'), os.path.join(TMP, f'hus{k}.wav'); sf.write(e, np.concatenate([c, np.zeros(int(.04 * SR))]), SR, subtype='FLOAT')
        ff(e, s, 'adeclip,afftdn=nf=-30,highpass=f=120,rubberband=pitch=1.122462:transients=crisp,equalizer=f=2500:t=q:w=1.2:g=3,equalizer=f=6000:t=q:w=1.2:g=2,acompressor=threshold=0.1:ratio=6:attack=2:release=50:makeup=2')
        y, _ = sf.read(s); y = y / (np.abs(y).max() + 1e-9); y = y + golpe_grave(len(y)) * db(-12); procesados.append(y)
    for v, orden in enumerate(ORDENES, 1):
        n = int((GOLPES[-1] + .3) * SR); g = np.zeros(n)
        for t0, (i, vol) in zip(GOLPES, zip(orden, (1.0, .9, .96))): y = procesados[i] * vol; j = int(t0 * SR); g[j:j + len(y)] += y[: n - j]
        limitar(g, os.path.join(SFX, f'huss_dia_{v}.wav')); limitar(reverb(g), os.path.join(SFX, f'huss_noche_{v}.wav'))
    tira = np.zeros(6 * SR)
    for k, v in enumerate([1, 2, 3]): y, _ = sf.read(os.path.join(SFX, f'huss_noche_{v}.wav')); j = int((.5 + k * SEP_GRUPOS) * SR); tira[j:j + len(y)] += y[: len(tira) - j]
    limitar(tira, os.path.join(SFX, 'huss_prueba_noche.wav'))
    # espectrograma de un grupo (día)
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, matplotlib.mlab
    y, _ = sf.read(os.path.join(SFX, 'huss_dia_1.wav')); P, F, T = matplotlib.mlab.specgram(y, NFFT=1024, Fs=SR, noverlap=960); L = 10 * np.log10(P + 1e-20)
    fig, ax = plt.subplots(figsize=(11, 5), dpi=130); ax.pcolormesh(T, F, L, shading='auto', cmap='magma', vmin=L.max() - 65, vmax=L.max()); ax.set_ylim(0, 10000)
    ax.set_xlabel('tiempo (s)'); ax.set_ylabel('frecuencia (Hz)'); ax.set_title('Un grupo "¡HUSS!" (3 "hus" en 0.00 / 0.20 / 0.39 s): voz con caída de tono + "s" arriba de 4 kHz')
    for f in (300, 3000, 4000): ax.axhline(f, color='#7FE0FF', lw=.6, ls='--')
    fig.tight_layout(); fig.savefig(os.path.join(REV, 'huss_espectrograma.png')); print('ok')

if __name__ == '__main__':
    main()
