"""Sintetiza el bote de balón "¡HUSS!" desde cero (numpy + soundfile) y lo procesa con ffmpeg.
Salidas (assets/sfx/): huss_noche_1-4.wav, huss_dia_1-4.wav, huss_prueba_noche.wav (6 s, 3 grupos)
y revision/huss_espectrograma.png.  Uso: python3 tools/huss.py"""
import os, subprocess
import numpy as np, soundfile as sf

SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(RAIZ, 'assets', 'sfx'); REV = os.path.join(RAIZ, 'revision'); os.makedirs(SFX, exist_ok=True); os.makedirs(REV, exist_ok=True)
db = lambda x: 10 ** (x / 20)
GOLPES = [0.00, 0.20, 0.39]          # 3 botes por grupo
VOLS = [1.00, 0.88, 0.95]            # golpe 1, 2, 3
SEP_GRUPOS = 0.97                    # separación entre grupos seguidos
DUR_BOTE = 0.15

def fase(f):                          # integra una frecuencia variable -> fase
    return 2 * np.pi * np.cumsum(f) / SR

def bote(rng, k_tono=1.0):
    n = int(DUR_BOTE * SR); t = np.arange(n) / SR
    # 1) golpe grave: 120 -> 45 Hz en 60 ms, ataque 1 ms, caída exponencial de 80 ms
    f1 = np.where(t < .060, 120 * (45 / 120) ** (t / .060), 45.0) * k_tono
    env1 = np.minimum(1, t / .001) * np.exp(-t / .080)
    grave = np.sin(fase(f1)) * env1
    # 2) tono del balón: 880 -> 260 Hz en 40 ms (exponencial), luego se queda en ~350 Hz con caída de 60 ms
    f2 = np.where(t < .040, 880 * (260 / 880) ** (t / .040), 260 + (350 - 260) * (1 - np.exp(-(t - .040) / .006))) * k_tono
    ph = fase(f2); tono = np.sin(ph) + db(-6) * np.sin(2 * ph) + db(-12) * np.sin(3 * ph)
    env2 = np.minimum(1, t / .0008) * np.where(t < .040, 1.0, np.exp(-(t - .040) / .060))
    tono = tono / 1.6 * env2 * db(-4)
    # 3) clic de goma: ruido blanco de 3 ms con pasa-altos en 2 kHz
    nc = int(.003 * SR); ruido = rng.standard_normal(nc); a = np.exp(-2 * np.pi * 2000 / SR)
    hp = np.zeros(nc); prev_x = prev_y = 0.0
    for i in range(nc): y = a * (prev_y + ruido[i] - prev_x); hp[i] = y; prev_x, prev_y = ruido[i], y
    hp *= np.hanning(nc) / (np.abs(hp).max() + 1e-9) * db(-10)
    clic = np.zeros(n); clic[:nc] = hp
    return grave + tono + clic

def grupo(variante):
    rng = np.random.default_rng(100 + variante)
    n = int((GOLPES[-1] + DUR_BOTE + .05) * SR); x = np.zeros(n)
    for g0, v in zip(GOLPES, VOLS):
        b = bote(rng, 1 + rng.uniform(-.03, .03)) * v * (1 + rng.uniform(-.02, .02))
        i = int(round(g0 * SR)); x[i:i + len(b)] += b
    return x

def reverb_patio(x, rt60=.6, mezcla=.15, predelay=.02, seed=7):
    rng = np.random.default_rng(seed); n = int(rt60 * 1.2 * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-6.91 * t / rt60)            # -60 dB a los 0.6 s
    ir = np.convolve(ir, np.ones(6) / 6, mode='same')                  # patio: un poco más opaco
    ir = np.concatenate([np.zeros(int(predelay * SR)), ir]); ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.convolve(x, ir)[: len(x) + len(ir)]
    seco = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return (1 - mezcla) * seco + mezcla * wet * (np.abs(seco).max() / (np.abs(wet).max() + 1e-9))

def limita(entrada, salida):
    """ffmpeg: lleva el pico a -1 dBFS con limitador (techo -1 dBTP, sobremuestreado x4)."""
    pico = np.abs(sf.read(entrada)[0]).max(); gan = 20 * np.log10(db(-0.6) / pico)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', entrada, '-af',
                    f'volume={gan:.2f}dB,aresample=192000,alimiter=limit={db(-1):.4f}:attack=0.5:release=40:level=false,aresample=48000',
                    '-ar', '48000', '-c:a', 'pcm_s24le', salida], check=True)

def main():
    tmp = os.path.join(SFX, '_tmp.wav')
    for v in range(1, 5):
        g = grupo(v)
        for nombre, señal in (('dia', g), ('noche', reverb_patio(g))):
            sf.write(tmp, señal / np.abs(señal).max() * .7, SR, subtype='FLOAT'); limita(tmp, os.path.join(SFX, f'huss_{nombre}_{v}.wav'))
    # tira de prueba de 6 s: 3 grupos de noche seguidos (cada 0.97 s), alternando variantes
    tira = np.zeros(6 * SR)
    for k, v in enumerate([1, 2, 3]):
        y, _ = sf.read(os.path.join(SFX, f'huss_noche_{v}.wav')); i = int((0.5 + k * SEP_GRUPOS) * SR); tira[i:i + len(y)] += y[: len(tira) - i]
    sf.write(tmp, tira / np.abs(tira).max() * .7, SR, subtype='FLOAT'); limita(tmp, os.path.join(SFX, 'huss_prueba_noche.wav')); os.remove(tmp)
    # espectrograma de un solo bote (seco)
    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, matplotlib.mlab
    b = bote(np.random.default_rng(1)); fig, ax = plt.subplots(figsize=(9, 5), dpi=130)
    x = np.concatenate([np.zeros(240), b]); P, F, Tt = matplotlib.mlab.specgram(x, NFFT=1024, Fs=SR, noverlap=1008); L = 10 * np.log10(P + 1e-20); ax.pcolormesh(Tt, F, L, shading='auto', cmap='magma', vmin=L.max() - 55, vmax=L.max())
    ax.set_ylim(0, 2000); ax.set_xlabel('tiempo (s)'); ax.set_ylabel('frecuencia (Hz)'); ax.set_title('Un bote del "¡HUSS!": tono 880 → 260 Hz en 40 ms, luego ~350 Hz; golpe 120 → 45 Hz')
    for f, c in ((880, '#7FE0FF'), (260, '#7FE0FF'), (350, '#B0FF9A'), (120, '#FFD27A'), (45, '#FFD27A')): ax.axhline(f, color=c, lw=.7, ls='--')
    fig.tight_layout(); fig.savefig(os.path.join(REV, 'huss_espectrograma.png')); print('ok')

if __name__ == '__main__':
    main()
