"""Audio de 'El robo de la Mona Lisa · Parte 2'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
from sonido import Mezcla
A = Mezcla(estilo='paris', extra_end=3.0, bpm=140)
c = A.cap
for k in range(3): A.fx(A.paper(), A.ST[0] + .4 + k * .5, .5)
A.fx(A.stamp(), c(0, 4), .8)
A.fx(A.pop(600), A.ST[1] + .4, .5)
for k in range(8): A.fx(A.knock(), c(1, 6) - .2 + k * .2, .4)
A.fx(A.knock(), c(2, 3) - .3, .8); A.fx(A.knock(), c(2, 3) - .1, .8); A.fx(A.wink(), c(2, 5) + .5, .5)
A.fx(A.train(3.0), A.ST[3] + .3, .5); A.fx(A.paper(), c(3, 3), .6); A.fx(A.register(), c(3, 6), .6)
A.fx(A.ding(), c(4, 3), .4); A.fx(A.stamp(), c(4, 4) + .2, .9)
for k in range(6): A.fx(A.step(), A.ST[5] + .1 + k * .2, .6)
A.fx(A.stamp(), c(5, 1), .8)
A.fx(A.fanfare(), c(6, 2), .4)
A.fx(A.sad(), c(7, 2), .5); A.fx(A.crowd(3.0), c(7, 4), .7); A.fx(A.fanfare(), c(7, 6), .6)
A.fx(A.fanfare(), c(8, 3), .7); A.fx(A.pop(900), c(8, 5), .6)
A.guardar(sys.argv[1], sys.argv[2])
