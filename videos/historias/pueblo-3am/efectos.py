"""Efectos de 'En este pueblo, todos despiertan a las 3 a.m.'"""
def efectos(A):
    L = A.T['lineas']; c = lambda i, k=0: L[i]['palabras'][min(k, len(L[i]['palabras']) - 1)][0]
    A.efecto(A.grillos(L[0]['corte'] + 4), 0, .6)
    for k in range(6): A.efecto(A.tic(), .4 + k * 1.0, .5)           # reloj al inicio
    A.efecto(A.latido(), L[1]['corte'] + 1.0, .9)                      # abre los ojos
    A.efecto(A.grillos(5), L[3]['corte'], .5)
    for k in range(8): A.efecto(A.tic(), L[3]['corte'] + .3 + k * .45, .35)
    A.efecto(A.grillos(4), L[6]['corte'], .4)
    for k in range(3): A.efecto(A.latido(), L[7]['corte'] + .1 + k * .8, 1.0)   # "me miraban a mí"
    A.efecto(A.subida(1.4), L[7]['corte'] - 1.2, .5)
    A.efecto(A.latido(), L[8]['fin'] - 1.0, .9)
    A.efecto(A.grillos(5), L[9]['corte'], .5)
