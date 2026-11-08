"""Audio de 'El robo de la Mona Lisa · Parte 1'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
from sonido import Mezcla
A = Mezcla(estilo='paris', extra_end=3.0, bpm=140)
c = A.cap
A.fx(A.paper(), A.ST[0] + .2, .5); A.fx(A.stamp(), c(0, 2) + .3, .8); A.fx(A.ding(), c(0, 4), .5)
A.fx(A.knock(), c(1, 3), .7); A.fx(A.knock(), c(1, 3) + .2, .7)
for k in range(8): A.fx(A.step(), A.ST[2] + .2 + k * .4, .5)
A.fx(A.wink(), c(2, 4), .5)
A.fx(A.knock(), c(3, 0) + .3, .6); A.fx(A.paper(), c(3, 1), .5)
for k in range(5): A.fx(A.step(), c(3, 3) + k * .35, .5)
A.fx(A.stamp(), c(4, 3), .8); A.fx(A.sad(), c(4, 3) + .2, .5)
A.fx(A.stamp(), A.ST[5] + .2, .6)
for k in range(4): A.fx(A.paper(), c(5, 2) + k * .35, .7, (k - 1.5) * .3)
A.fx(A.pop(500), c(6, 1), .5); A.fx(A.pop(700), c(6, 2), .5)
A.fx(A.crowd(A.DURS[7]), A.ST[7], .6)
A.fx(A.fanfare(), c(8, 2), .6)
A.guardar(sys.argv[1], sys.argv[2])
