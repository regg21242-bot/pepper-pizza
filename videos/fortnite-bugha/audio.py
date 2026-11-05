"""Audio de 'El chico que ganó 3 millones jugando Fortnite'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='juguetón', extra_end=3.0, bpm=128)
c = A.cap
def laser():
    t = np.arange(int(SR * .18)) / SR; return np.sin(2 * np.pi * (1800 - 6000 * t) * t) * A.env(len(t), .002, .06) * .5
def click():
    return A.tone(3000, .03, .006, (1,)) * .5
for k in range(int(c(0, 2) / .11)): A.fx(click(), .3 + k * .11, .4, (k % 2) * .4 - .2)   # teclado
for k in range(5): A.fx(laser(), .6 + k * .45, .5, .3)
A.fx(A.fanfare(), c(0, 2) - .1, .9); A.fx(A.register(), c(0, 2) + .2, .7)
for k in range(10): A.fx(A.paper(), c(0, 2) + k * .08, .4, (k % 3 - 1) * .5)
A.fx(A.pop(700), A.ST[1] + .3, .5); A.fx(A.stamp(), c(1, 2) + .6, .8)
A.fx(A.ding(), c(2, 1), .5)
for k in range(30): A.fx(A.pop(400 + (k % 7) * 90), c(2, 2) + k * .07, .18, (k % 3 - 1) * .5)
A.fx(A.crowd(A.DURS[3] + A.DURS[4]), A.ST[3], .7); A.fx(A.pop(900), c(3, 0) + .3, .5)
A.fx(A.crowd(1.5), c(3, 4), .9)
A.fx(A.whoosh(1.0), c(4, 1) - .3, .5); A.fx(A.ding(), c(4, 1) + .9, .5); A.fx(A.whoosh(.8), c(4, 2), .4)
A.fx(A.fanfare(), A.ST[5] + .2, .8); A.fx(A.crowd(A.DURS[5]), A.ST[5], .9); A.fx(A.register(), c(5, 0), .6)
siren = np.concatenate([A.tone(f, .35, 2, (1, .2)) for f in [960, 770] * 6]) * .35
A.fx(siren, c(6, 2) - .3, .7); A.fx(A.knock(), c(6, 2) + .1, 1.0); A.fx(A.knock(), c(6, 2) + .3, 1.0); A.fx(A.stamp(), c(6, 4), .9)
for k in range(5): A.fx(A.pop(800 + k * 60), A.ST[7] + .2 + k * .35, .4)
A.fx(A.pop(900), c(7, 4), .7); A.fx(A.ding(), c(7, 4) + .05, .5)
A.guardar(sys.argv[1], sys.argv[2])
