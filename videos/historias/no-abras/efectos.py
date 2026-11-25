"""Efectos de 'No abras la puerta · Parte 1'"""
import numpy as np
def efectos(A):
    L = A.T['lineas']
    def w(i, pal, n=0):
        ps = [p for p in L[i]['palabras'] if ''.join(c for c in p[2].lower() if c.isalpha()) == pal]
        return (ps[min(n, len(ps) - 1)] if ps else L[i]['palabras'][0])[0]
    toc = lambda t, g=1.0: (A.efecto(A.golpe(70, .5), t, .9 * g), A.efecto(A.crujido(.15), t, .5 * g))
    for k in range(3): toc(w(0, 'toca') + k * .32)
    for k in range(3): toc(w(0, 'veces') - .1 + k * .3, .8)
    A.efecto(A.viento(L[2]['corte']), 0, .25)
    for k in range(6): A.efecto(A.tic(), .3 + k * 1.0, .35)
    tv = w(2, 'vibra')
    for k in range(3): A.efecto(A.motor(.35, 110), tv + k * .5, .5)
    A.efecto(A.pop(900), L[3]['corte'] + .4, .5); A.efecto(A.pop(1200), w(3, 'no') - .2, .6)
    A.efecto(A.latido(), w(3, 'no') + .1, .9)
    for k in range(3): toc(w(4, 'tocar') + k * .3)
    for k in range(3): toc(w(4, 'veces') + .2 + k * .3, .8)
    A.efecto(A.crujido(.8), L[5]['corte'] + .3, .7)
    for k in range(4): A.efecto(A.latido(), L[5]['corte'] + 1 + k * 1.1, .7)
    ts = w(6, 'suena')
    for k in range(4): A.efecto(A.lp(A.melodia([76, 79, 76, 79, None, None], .12), 5), ts + k * 1.0, .5)   # timbre apagado detrás de la puerta
    A.efecto(A.subida(1.6), L[7]['corte'] - 1.4, .5)
    for k in range(4): A.efecto(A.latido(), L[7]['corte'] + .3 + k * .9, 1.0)
    A.efecto(A.estruendo(2.0), L[8]['corte'] + .05, .5)
    t0, t1 = w(9, 'apagan'), w(9, 'tuya')
    for i in range(6): A.efecto(A.golpe(90, .35), t0 + (t1 - t0) * i / 5, .7); A.efecto(A.tic(), t0 + (t1 - t0) * i / 5, .9)
    tg = w(10, 'girar')
    for k in range(5): A.efecto(A.crujido(.25), tg + k * .45, .6)
    for k in range(6): A.efecto(A.latido(), L[11]['corte'] + .2 + k * 1.0, .8)
    A.efecto(A.pop(700), w(11, 'a') - .1, .6); A.efecto(A.pop(950), w(11, 'b') - .1, .6)
