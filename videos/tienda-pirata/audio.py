"""Audio de 'La ficha de la Tienda Pirata'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='juguetón', extra_end=3.2, bpm=124)
c = A.cap
def sparkle_s():
    return A.mix(*[np.pad(A.tone(f, .3, .1, (1,)) * .3, (int(SR * i * .05), 0)) for i, f in enumerate([2093, 2637, 3136, 4186])])
def rumble(d):
    x = A.lp(A.noise(d), 60); t = np.arange(len(x)) / SR; return x * (1 + np.sin(2 * np.pi * 30 * t)) * 1.5
A.fx(A.pop(600), c(0, 3), .5); A.fx(A.fanfare(), c(0, 5), .8)
A.fx(sparkle_s(), A.ST[1] + .2, .7); A.fx(A.pop(700), c(1, 1), .5); A.fx(A.pop(800), c(1, 3), .5)
for k in range(6): A.fx(A.ding(), c(2, 1) + k * .12, .3, (k % 3 - 1) * .5)
A.fx(A.pop(900), c(2, 4), .6); A.fx(A.stamp(), c(2, 6) + .3, .8)
A.fx(A.pop(500), c(3, 1), .5); A.fx(sparkle_s(), c(3, 3), .8); A.fx(rumble(1.0), c(3, 4), .9)
A.fx(A.thud(), c(3, 5), 1.0); A.fx(A.fanfare(), c(3, 5) + .1, .8)
A.fx(sparkle_s(), c(4, 1), .6)
for k in range(3): A.fx(A.ding(), c(4, 3) + .2 + k * .2, .5, (k - 1) * .6)
A.fx(A.stamp(), c(4, 4), .6)
A.fx(A.stamp(), c(5, 1), .7); A.fx(A.boing(), c(5, 3), .5); A.fx(A.stamp(), c(5, 5), .9)
A.fx(A.pop(600), A.ST[6] + .2, .5); A.fx(A.whoosh(.4), c(6, 2) - .2, .5); A.fx(A.stamp(), c(6, 4), .9)
A.fx(A.pop(900), c(7, 0) + .2, .7); A.fx(A.ding(), c(7, 0) + .25, .5)
A.guardar(sys.argv[1], sys.argv[2])
