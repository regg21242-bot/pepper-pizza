"""Audio de 'La noche de los muertos vivientes' (resumen). Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='cine', extra_end=3.2, bpm=70)
c = A.cap
def groan(d=1.2, f=90):
    t = np.arange(int(SR * d)) / SR
    s = np.sin(2 * np.pi * (f + 15 * np.sin(2 * np.pi * 3 * t)) * t) + .5 * np.sin(2 * np.pi * 2.01 * f * t)
    return s * np.sin(np.pi * t / d) ** 2 * .5 + A.lp(A.noise(d), 40)[:len(t)] * .3
def stinger():
    return A.mix(*[A.tone(f, 1.5, .8, (1, .4)) * .3 for f in [233, 247, 262]])
def gunshot():
    return A.mix(A.lp(A.noise(.4), 2) * A.env(int(SR * .4), .0005, .06) * 1.8, A.tone(60, .4, .1, (1,)) * 1.2)
def boom():
    return A.mix(A.lp(A.noise(1.8), 30) * A.env(int(SR * 1.8), .002, .5) * 2.5, A.tone(45, 1.5, .5, (1, .5)) * 1.5)
A.fx(stinger(), A.ST[0] + .1, .8)
for k in range(4): A.fx(groan(1.4, 80 + k * 12), 1.0 + k * 1.8, .5, (k % 2) * .6 - .3)
A.fx(A.stamp(), c(0, 3), .7)
A.fx(A.church_bell(), A.ST[1] + .2, .4); A.fx(A.wink(), c(1, 4), .4)
A.fx(groan(1.0, 70), c(2, 1) - .3, .8); A.fx(stinger(), c(2, 1), .9); A.fx(A.thud(), c(2, 2) + .2, .9)
for k in range(10): A.fx(A.step(), c(2, 3) + k * .2, .6)
for k in range(12): A.fx(A.knock(), c(3, 1) + .3 + k * .28, .7, (k % 3 - 1) * .4)
for k in range(3): A.fx(groan(1.2, 75 + k * 10), c(3, 3) + k * .8, .5, .4)
A.fx(A.pop(400), c(4, 1) + .2, .4); A.fx(stinger(), c(4, 3), .6)
radio = A.lp(A.noise(A.DURS[5]), 2) * .12
A.fx(radio, A.ST[5], .6); A.fx(A.stamp(), c(5, 3), .6)
A.fx(boom(), c(6, 1) - .2, 1.0)
A.fx(groan(1.5, 110), c(7, 2) + .4, .8); A.fx(stinger(), c(7, 2) + .4, .7); A.fx(groan(1.6, 85), c(7, 4), .7)
for k in range(6): A.fx(A.knock(), A.ST[8] + .3 + k * .55, .5, (k % 2) * .6 - .3)
A.fx(A.church_bell(), A.ST[9] + .2, .4)
for k in range(10): A.fx(A.step(), A.ST[9] + .2 + k * .3, .5)
A.fx(gunshot(), c(10, 2), 1.0); A.fx(A.sad(), c(10, 4), .7)
A.fx(stinger(), c(11, 0) + .2, .6)
A.guardar(sys.argv[1], sys.argv[2])
