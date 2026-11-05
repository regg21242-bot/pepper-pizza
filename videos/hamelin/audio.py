"""Audio de 'El flautista de Hamelín'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys; sys.path.insert(0, '../lib')
from sonido import Mezcla
A = Mezcla(estilo='medieval')
c = A.cap
# 1: desfile de boda con tambor que se calla
for k in range(int((c(0, 5) - 0.2) / .5)): A.fx(A.drum(), .2 + k * .5, .45, -.3)
A.fx(A.stamp(), c(0, 2), .8)
A.fx(A.shh(), c(0, 5), .8)
# 2: letrero, tambor tachado y +700
A.fx(A.pop(600), A.ST[1] + .2, .5); A.fx(A.stamp(), c(1, 1) + .3, .6); A.fx(A.pop(900), c(1, 4), .6)
# 3: flauta del flautista
A.fx(A.flute([76, 79, 81, 79, 76, 74, 76, 79, 83, 81, 79, 76, 74, 76]), c(2, 2) - .2, .55, .2)
A.fx(A.flute([76, 79, 81, 83, 81, 79, 76, 79]), c(2, 5), .45, .2)
# 4: niños que lo siguen, campana triste
A.fx(A.flute([79, 81, 83, 84, 83, 81, 79, 76, 79, 81, 83, 81, 79, 76, 74, 72], .24), A.ST[3], .45, .3)
A.fx(A.pop(800), c(3, 1), .6)
A.fx(A.church_bell(), c(3, 3), .9)
# 5: iglesia
A.fx(A.church_bell(), A.ST[4] + .1, .6); A.fx(A.stamp(), c(4, 3) + .2, .6); A.fx(A.paper(), c(4, 5), .7)
# 6: ratas
for k in range(14): A.fx(A.tone(2600 + (k % 3) * 300, .08, .03, (1,)), A.ST[5] + .2 + k * .32, .35, (k % 2) * .6 - .3)
A.fx(A.stamp(), c(5, 2), .7); A.fx(A.stamp(), c(5, 4), .7)
# 7: mapa
A.fx(A.whoosh(.6), c(6, 1), .5); A.fx(A.boing(), c(6, 4), .5); A.fx(A.sad(), c(6, 5), .6)
# 8: pregunta
A.fx(A.pop(900), c(7, 3), .7); A.fx(A.ding(), c(7, 3) + .05, .5)
A.guardar(sys.argv[1], sys.argv[2])
