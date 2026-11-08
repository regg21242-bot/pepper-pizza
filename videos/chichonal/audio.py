"""Audio de 'El Chichón, 1982'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='cine', extra_end=3.0, bpm=72)
c = A.cap
def rumble(d, g=1.0):
    x = A.lp(A.noise(d), 80); t = np.arange(len(x)) / SR
    return x * (1 + .5 * np.sin(2 * np.pi * 2 * t)) * np.minimum(t / .3, 1) * np.minimum((d - t) / .5, 1) * 3 * g
def boom():
    return A.mix(A.lp(A.noise(3.0), 25) * A.env(int(SR * 3.0), .003, .8) * 3, A.tone(38, 2.5, .8, (1, .5)) * 1.6)
def birds():
    o = np.zeros(int(SR * 3))
    for k in range(6):
        t = np.arange(int(SR * .12)) / SR; s = np.sin(2 * np.pi * (2800 + 1200 * np.sin(t * 60)) * t) * A.env(len(t), .005, .04) * .3
        j = int(SR * (k * .45 + .1)); o[j:j + len(s)] += s
    return o
A.fx(A.stamp(), c(0, 3) + .2, .6)
A.fx(birds(), A.ST[1] + .5, .6); A.fx(birds(), A.ST[2] + .3, .5)
A.fx(rumble(2.5, .5), c(3, 1), .6); A.fx(boom(), c(3, 3) - .2, 1.0); A.fx(rumble(4, .8), c(3, 3), .8)
for k in range(8): A.fx(A.step(), A.ST[4] + .2 + k * .5, .4)
A.fx(rumble(A.DURS[4], .5), A.ST[4], .5)
A.fx(A.stamp(), c(5, 2), .6)
A.fx(rumble(7.0, 1.3), c(5, 3) - .3, 1.0); A.fx(boom(), c(5, 3) - .2, .7)
fire = A.lp(A.noise(3.0), 6) * (0.6 + 0.4 * np.abs(np.sin(np.arange(int(SR * 3.0)) / SR * 9))) * .6
A.fx(fire, c(5, 7) - .3, .8)
A.fx(A.sad(), c(5, 8), .6)
A.fx(A.church_bell(), A.ST[6] + .3, .6)
A.fx(A.whoosh(1.0), c(7, 1), .5); A.fx(A.ding(), c(7, 3), .4)
A.fx(A.ding(), c(8, 1), .4); A.fx(A.pop(800), c(8, 3), .5)
A.guardar(sys.argv[1], sys.argv[2])
