"""Audio de '¿Por qué explotan las palomitas?'. Uso: python3 audio.py carpeta_voz salida.wav"""
import sys, re; sys.path.insert(0, '../lib')
import numpy as np
from sonido import Mezcla, SR
A = Mezcla(estilo='juguetón', extra_end=3.0, bpm=112)
c = A.cap
def at(si, word, off=0):
    ch = A.CAPS[si]
    for k, (t0, txt) in enumerate(ch):
        ws = re.sub(r'[*¿?¡!.,…:]', '', txt).lower().split(' ')
        for i, w in enumerate(ws):
            if w.startswith(word.lower()):
                nx = ch[k + 1][0] if k + 1 < len(ch) else A.DURS[si] - .4
                return A.ST[si] + t0 + i * (nx - t0) / len(ws) + off
    raise SystemExit('sin palabra ' + word)
def popsnd(g=1.0):
    return A.mix(A.lp(A.noise(.12), 3) * A.env(int(SR * .12), .001, .03) * 2.5, A.pop(900) * .6) * g
def sizzle(d, g=.25):
    x = A.noise(d) - A.lp(A.noise(d), 3); return x * np.minimum(np.arange(len(x)) / SR / .4, 1) * g
def hiss(d):
    x = A.noise(d) - A.lp(A.noise(d), 6); t = np.arange(len(x)) / SR; return x * np.minimum(t / .05, 1) * np.maximum(1 - t / d, 0) * .5
# 1
A.fx(sizzle(2.5), A.ST[0], .5); tx = at(0, 'explota', .1)
A.fx(popsnd(1.4), tx, 1.0); A.fx(A.boing(), tx + .1, .4)
for k in range(8): A.fx(popsnd(.6), tx + .35 + k * .17, .5, (k % 3 - 1) * .5)
A.fx(A.pop(800), at(0, 'palomita'), .5)
# 2
A.fx(A.whoosh(.5), at(1, 'cáscara') + .4, .5)
for w in ('cáscara', 'almidón', 'agua'): A.fx(A.pop(650), at(1, w), .5)
A.fx(A.ding(), at(1, 'agua') + .5, .4)
# 3
A.fx(sizzle(5, .3), A.ST[2], .5); A.fx(hiss(1.5), at(2, 'vapor') - .2, .5); A.fx(A.stamp(), at(2, 'salir') - .1, .8)
# 4
for k in range(1, 4): A.fx(A.tone(300 + k * 150, .3, .2), c(3, k), .5)
A.fx(hiss(2.2), at(3, 'olla') + .2, .6); A.fx(A.flute([1568, 1568, 1568], .25), at(3, 'olla') + .4, .25)
# 5
A.fx(sizzle(6, .35), A.ST[4], .6); A.fx(A.ding(), at(4, '180'), .4); A.fx(A.pop(500), at(4, 'nueve'), .5)
for k in range(5): A.fx(A.knock(), at(4, 'cáscara') - .2 + k * .18, .3)
tb = at(4, 'revienta', .15); A.fx(popsnd(1.8), tb, 1.0); A.fx(A.thud(), tb, .6)
# 6
A.fx(A.whoosh(.8), at(5, 'infla') - .3, .5); A.fx(A.fanfare(), at(5, 'cuarenta') - .2, .4)
A.fx(A.bell(2093), at(5, 'enfría'), .3); A.fx(A.pop(700), at(5, 'blanca'), .5)
cr = A.mix(*[A.lp(A.noise(.05), 2) * A.env(int(SR * .05), .001, .02) for _ in range(1)])
for k in range(6): A.fx(cr * 2, at(5, 'crujiente') + .3 + k * .06, .6)
# 7
A.fx(popsnd(1.4), at(6, 'pop') - .1, .9); A.fx(A.sad(), at(6, 'rompiéndose') - .3, .3)
A.fx(hiss(1.0), at(6, 'vapor') - .2, .8); A.fx(A.boing(), at(6, 'patita') + .05, .6); A.fx(popsnd(1.0), at(6, 'patita') + .35, .7)
# 8
A.fx(A.sad(), c(7, 0) + .4, .35); A.fx(hiss(2.5) * .4, at(7, 'grieta'), .5); A.fx(A.pop(600), at(7, 'faltaba'), .4)
# 9
A.fx(A.pop(700), at(8, 'méxico') - .1, .5); A.fx(A.ding(), at(8, '9000') - .1, .5)
A.fx(A.whoosh(.4), at(8, 'perú') - .4, .5); A.fx(A.ding(), at(8, '6700') - .1, .5)
# 10
A.fx(A.pop(900), c(9, 0) + .2, .6)
for w in ('mantequilla', 'chile', 'caramelo'): A.fx(popsnd(.8), at(9, w) - .1, .6)
A.guardar(sys.argv[1], sys.argv[2])
