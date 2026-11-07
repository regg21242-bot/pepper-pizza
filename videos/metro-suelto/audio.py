"""Audio de '¿Por qué la punta del metro está suelta?'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
from sonido import Mezcla
A = Mezcla(estilo='cine', extra_end=2.6)
c = A.cap
click = A.tone(2600, .04, .01, (1,)) * .6
for k in range(8): A.fx(click, c(0, 1) + .3 + k * .35, .5, (k % 2) * .4 - .2)
A.fx(A.stamp(), c(1, 1), .5); A.fx(A.ding(), c(1, 2), .5)
for k in range(6): A.fx(click, A.ST[2] + .2 + k * 1.05, .4)
A.fx(A.pop(600), c(2, 2), .4)
A.fx(A.whoosh(.5), c(3, 1) - .3, .5); A.fx(click, c(3, 1) + .3, .7)
A.fx(A.knock(), c(4, 2), .7); A.fx(click, c(4, 2) + .05, .7)
A.fx(A.ding(), c(5, 1), .6)
A.guardar(sys.argv[1], sys.argv[2])
