"""Tono promedio (F0) de un wav: autocorrelación por cuadros de 40 ms, solo cuadros con voz. Uso: python3 tools/tono.py archivo.wav"""
import sys, subprocess, numpy as np
def leer(p, sr=16000):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32), sr
def f0s(p, fmin=100, fmax=600):
    x, sr = leer(p); n, h = int(.04 * sr), int(.01 * sr); out = []
    umbral = .1 * np.sqrt(np.mean(x ** 2)) * 3
    for i in range(0, len(x) - n, h):
        f = x[i:i + n] - x[i:i + n].mean()
        if np.sqrt(np.mean(f ** 2)) < umbral: continue
        f = f * np.hanning(n); ac = np.correlate(f, f, 'full')[n - 1:]; ac /= ac[0] + 1e-9
        a, b = int(sr / fmax), int(sr / fmin); k = a + np.argmax(ac[a:b])
        if ac[k] < .55: continue
        if 1 <= k < len(ac) - 1:   # interpolación parabólica
            y0, y1, y2 = ac[k - 1], ac[k], ac[k + 1]; k = k + .5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
        out.append(sr / k)
    return np.array(out)
def tono(p):
    v = f0s(p); return (float(np.mean(v)), float(np.percentile(v, 5)), float(np.percentile(v, 95))) if len(v) else (0, 0, 0)
if __name__ == '__main__':
    for p in sys.argv[1:]: m, lo, hi = tono(p); print(f'{p}: promedio {m:.0f} Hz (p5 {lo:.0f}, p95 {hi:.0f})')
