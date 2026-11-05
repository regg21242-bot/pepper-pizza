"""Audio de 'La plaga del baile de 1518'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
from sonido import Mezcla
A = Mezcla(estilo='medieval', bpm=100)
c = A.cap
A.fx(A.paper(), A.ST[0] + .2, .6); A.fx(A.pop(700), c(0, 1), .5)
for k in range(10): A.fx(A.step(), c(0, 4) + k * .3, .5, (k % 2) * .4 - .2)
A.fx(A.boing(), c(0, 4), .5)
for k in range(9): A.fx(A.ding(), A.ST[1] + .1 + k / .9, .25)          # días que pasan
A.fx(A.stamp(), c(1, 1), .6); A.fx(A.stamp(), c(1, 2), .6)
A.fx(A.pop(500), c(1, 4), .5); A.fx(A.pop(650), c(1, 4) + .15, .5)
A.fx(A.crowd(A.DURS[2]), A.ST[2], .5)
A.fx(A.pop(800), c(2, 0) + .9, .5); A.fx(A.fanfare(), c(2, 3), .6)
A.fx(A.pop(400), c(3, 2), .6); A.fx(A.stamp(), c(3, 4), .9)
for k in range(5): A.fx(A.register() * .4, c(4, 0) + k * .15, .4)
A.fx(A.flute([74, 76, 77, 79, 81, 79, 77, 76, 74, 76, 77, 74], .2), c(4, 1), .5, .2)
for k in range(10): A.fx(A.drum(), c(4, 1) + k * .3, .4, -.3)
for k in range(5): A.fx(A.thud(), c(5, 1) + k * .25, .5, (k % 3 - 1) * .4)
A.fx(A.sad(), c(5, 4), .6)
A.fx(A.church_bell(), A.ST[6] + .3, .7); A.fx(A.church_bell(), c(6, 5), .6)
A.fx(A.pop(600), c(7, 1), .5); A.fx(A.pop(700), c(7, 2), .5); A.fx(A.pop(800), c(7, 3), .5)
A.fx(A.pop(900), c(7, 4), .7); A.fx(A.ding(), c(7, 4) + .05, .5)
A.guardar(sys.argv[1], sys.argv[2])
