"""Audio de prueba de la escena 12: voz + un clic de apagador por ventana (alineado al cuadro); el último con más reverb."""
import json, numpy as np, subprocess
SR = 48000
v = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'audio/vo_full.wav', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-']), np.int16).astype(np.float32) / 32768
EV = json.load(open('subs/eventos.json')); mix = v * .9; rng = np.random.default_rng(4)
def clic(n=1.0):
    d = int(.09 * SR); t = np.arange(d) / SR; ruido = rng.standard_normal(d)
    hi = np.convolve(ruido, np.ones(3) / 3, 'same') * np.exp(-t * 180)          # chasquido plástico
    lo = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 60) * .5                         # golpe del mecanismo
    s = (hi * .6 + lo) * n; s[:20] *= np.linspace(0, 1, 20); return s
ap = EV['apagados12']
for i, t in enumerate(ap):
    s = clic(.55 if i < len(ap) - 1 else .8); k = int(round(t * 30)) / 30; a = int(k * SR) - int(.004 * SR)  # al cuadro exacto
    if i == len(ap) - 1:  # cola de reverb
        ir = rng.standard_normal(int(1.2 * SR)) * np.exp(-np.arange(int(1.2 * SR)) / SR * 4) * .05; cv = np.convolve(s, ir); L = len(cv); s = cv + np.pad(s, (0, L - len(s)))
    mix[a:a + len(s)] += s[: len(mix) - a]
mix = mix / max(1, np.abs(mix).max() / .95)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', 'audio/prueba12.wav'], input=(mix * 32767).astype(np.int16).tobytes(), check=True)
print('ok', len(ap), 'clics')
