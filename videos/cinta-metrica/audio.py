"""Audio de 'La cinta métrica que casi todos usan mal'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='juguetón', extra_end=3.2, bpm=118)
c = A.cap
def zip_(d):
    x = A.noise(d); t = np.arange(len(x)) / SR; return (x - A.lp(x, 2)) * (np.sin(2 * np.pi * 40 * t) > 0) * .4
def clank():
    return A.mix(A.tone(1800, .5, .12, (1, .5, .3)) * .6, A.tone(2700, .4, .08) * .4, A.lp(A.noise(.05), 3) * A.env(int(SR * .05), .001, .01))
def scratch(d):
    x = A.noise(d); t = np.arange(len(x)) / SR; return (x - A.lp(x, 3)) * (.5 + .5 * np.sin(2 * np.pi * 4 * t)) ** 2 * .7
A.fx(zip_(1.3), .3, .7); A.fx(A.pop(600), .2, .5); A.fx(A.stamp(), c(0, 3), .9)
for k in range(10): A.fx(A.tone(2600, .04, .01, (1,)) * .6, c(1, 2) - .2 + k * .35, .5)
A.fx(A.stamp(), c(1, 3) - .2, .7); A.fx(A.ding(), c(1, 4) + .2, .6)
A.fx(A.pop(700), c(2, 1), .5); A.fx(A.ding(), c(2, 2) + .3, .5); A.fx(A.pop(500), c(2, 3) - .2, .5); A.fx(clank() * .4, c(2, 5) + .2, .6); A.fx(A.ding(), c(2, 5) + .4, .5)
A.fx(A.pop(600), c(3, 2) - .1, .5); A.fx(A.knock(), c(3, 2) + .3, .8); A.fx(zip_(.8), c(3, 4) - .2, .6); A.fx(A.fanfare(), c(3, 4) + .3, .5)
A.fx(A.stamp(), c(4, 2), .6); A.fx(scratch(1.6), c(4, 3), .9); A.fx(A.ding(), c(4, 5), .5)
A.fx(A.knock(), A.ST[5] + .1, .7); A.fx(scratch(2.6) * .6, c(5, 2) - .2, .6); A.fx(A.ding(), c(5, 4), .6)
A.fx(zip_(.35), c(6, 2) - .3, .8); A.fx(clank(), c(6, 2) + .05, 1.0); A.fx(A.sad(), c(6, 4), .5); A.fx(A.stamp(), c(6, 5) + .3, .8)
for k in range(5): A.fx(A.pop(500 + k * 80), A.ST[7] + .1 + k * .15, .4)
A.fx(A.pop(900), c(7, 0) + .1, .7); A.fx(A.ding(), c(7, 0) + .15, .5)
A.guardar(sys.argv[1], sys.argv[2])
