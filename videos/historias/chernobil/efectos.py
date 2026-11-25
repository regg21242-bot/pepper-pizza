def efectos(A):
    L = A.T['lineas']
    A.efecto(A.grillos(L[3]['corte']), 0, .35); A.efecto(A.estruendo(3.0) * .7, L[0]['corte'] + 1.0, .7)
    A.efecto(A.geiger(L[3]['corte'] - L[1]['corte'], 9), L[1]['corte'], .35)
    A.efecto(A.pajaros(L[4]['corte'] - L[3]['corte']), L[3]['corte'], .35)
    A.efecto(A.motor(L[7]['corte'] - L[4]['corte'], 42), L[4]['corte'], .6)
    A.efecto(A.viento(A.T['fin'] - L[7]['corte']), L[7]['corte'], .45); A.efecto(A.crujido(1.5), L[7]['corte'] + 1.5, .4); A.efecto(A.crujido(1.5), L[8]['corte'] + .8, .35)
    A.efecto(A.geiger(A.T['fin'] - L[7]['corte'], 3), L[7]['corte'], .25)
