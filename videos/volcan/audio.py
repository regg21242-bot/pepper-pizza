"""Audio de '¿Cómo funciona un volcán?'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='cine', extra_end=3.0, bpm=80)
c = A.cap
def rumble(d, g=1.0):
    x = A.lp(A.noise(d), 80); t = np.arange(len(x)) / SR
    return x * (1 + .5 * np.sin(2 * np.pi * 2 * t)) * np.minimum(t / .3, 1) * np.minimum((d - t) / .5, 1) * 3 * g
def blub():
    t = np.arange(int(SR * .15)) / SR; return np.sin(2 * np.pi * (300 + 900 * t) * t) * A.env(len(t), .005, .05) * .6
def boom():
    return A.mix(A.lp(A.noise(2.5), 25) * A.env(int(SR * 2.5), .003, .7) * 3, A.tone(40, 2.0, .7, (1, .5)) * 1.6)
A.fx(rumble(A.DURS[0]), 0, .8)
A.fx(rumble(3, .6), c(1, 2), .7)
for k in range(10): A.fx(blub(), A.ST[2] + .3 + k * .7, .4, (k % 2) * .6 - .3)
for k in range(16): A.fx(blub(), A.ST[3] + .2 + k * .45, .25, (k % 3 - 1) * .5)
fizz = (A.noise(2.0) - A.lp(A.noise(2.0), 2)) * np.linspace(1, .2, int(SR * 2.0)) * .25
A.fx(fizz, c(3, 4), .7)
for k in range(14): A.fx(blub(), A.ST[4] + .2 + k * .35, .4, (k % 2) * .4 - .2)
A.fx(rumble(2.5, 1.2), c(5, 2) - .5, .9); A.fx(boom(), c(5, 4) - .1, 1.0)
A.fx(boom(), A.ST[6] + .3, .7); A.fx(rumble(3, .7), c(6, 4), .6)
A.fx(A.ding(), c(7, 2), .4); A.fx(A.church_bell(), c(7, 3), .3)
A.fx(A.pop(800), c(8, 0) + .1, .5)
A.guardar(sys.argv[1], sys.argv[2])
