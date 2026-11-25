def efectos(A):
    L = A.T['lineas']
    A.efecto(A.motor(L[1]['corte'], 30), 0, .5); A.efecto(A.estruendo(2.5) * .5, L[0]['corte'] + 1.0, .8); A.efecto(A.crujido(1.2), L[0]['corte'] + 1.1, .5)
    A.efecto(A.agua(L[2]['corte'] - L[1]['corte']), L[1]['corte'], .5)
    A.efecto(A.melodia([67, 71, 74, 74, 72, 71, 69, 71, 72, 74, 71, 67], .38, .22), L[2]['corte'] + .2, .8, -.2)
    A.efecto(A.agua(L[4]['corte'] - L[3]['corte']) * 2, L[3]['corte'], .7)
    A.efecto(A.agua(L[6]['corte'] - L[4]['corte']), L[4]['corte'], .4)
    A.efecto(A.estruendo(4.0), L[6]['corte'] + .4, .8); A.efecto(A.agua(L[7]['corte'] - L[6]['corte']) * 1.6, L[6]['corte'], .6)
    A.efecto(A.viento(A.T['fin'] - L[7]['corte']), L[7]['corte'], .5); A.efecto(A.agua(A.T['fin'] - L[7]['corte']), L[7]['corte'], .35)
    A.efecto(A.whoosh(1.0), L[9]['corte'] + .2, .5)
