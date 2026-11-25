def efectos(A):
    L = A.T['lineas']
    A.efecto(A.pajaros(L[2]['corte']), 0, .35)
    for k in range(6): A.efecto(A.ladrido(), L[1]['corte'] + 1.2 + k * .38 + (k // 3) * .5, .45, .4)
    A.efecto(A.crepitar(L[2]['corte'] - L[1]['corte']), L[1]['corte'], .25, -.4)
    A.efecto(A.estruendo(4.0), L[2]['corte'] + .5, 1.0); A.efecto(A.estruendo(3.0), L[2]['corte'] + 1.6, .6)
    A.efecto(A.viento(L[4]['corte'] - L[3]['corte']), L[3]['corte'], .5)
    A.efecto(A.crepitar(L[5]['corte'] - L[4]['corte']) * 1.5, L[4]['corte'], .7)
    for k in range(4): A.efecto(A.crujido(.8), L[5]['corte'] + .5 + k * .9, .6)
    A.efecto(A.grillos(L[7]['corte'] - L[6]['corte']), L[6]['corte'], .4)
    A.efecto(A.viento(L[8]['corte'] - L[7]['corte']) * 1.6, L[7]['corte'], .8); A.efecto(A.estruendo(5.0), L[7]['corte'] + .2, .9)
    A.efecto(A.viento(A.T['fin'] - L[8]['corte']), L[8]['corte'], .25)
