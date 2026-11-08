"""Audio de '¿Una tienda de personas?' (trata). Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='cine', extra_end=3.2, bpm=70)
c = A.cap
siren = np.concatenate([A.tone(f, .4, 2, (1, .2)) for f in [880, 700] * 5]) * .25
A.fx(siren, A.ST[1] + .1, .5)
clank = A.mix(A.tone(220, 1.2, .4, (1, .6, .4, .3)) * .5, A.lp(A.noise(.1), 4) * A.env(int(SR * .1), .001, .02))
A.fx(clank, A.ST[2] + .3, .9); A.fx(A.stamp(), c(2, 2), .5)
A.fx(A.paper(), c(3, 3) - .3, .7); A.fx(A.stamp(), c(3, 5), .6)
for k in range(20): A.fx(A.tone(1800, .05, .02, (1,)) * .3, c(4, 2) + k * .1, .3, (k % 3 - 1) * .5)
A.fx(A.ding(), c(5, 2) - .2, .5)
for k in range(3): A.fx(A.stamp(), c(5, 4) + k * .25, .35)
for k in (4, 5, 6): A.fx(A.ding(), c(6, k), .45)
A.guardar(sys.argv[1], sys.argv[2])
