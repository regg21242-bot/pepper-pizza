def efectos(A):
    L = A.T['lineas']
    A.efecto(A.pajaros(L[2]['corte']), 0, .4)
    for i, d in [(0, .3), (0, 1.0), (0, 1.6), (1, 1.0), (1, 1.5), (2, .5), (3, .9), (7, .3)]: A.efecto(A.pop(700 + 120 * i), L[i]['corte'] + d, .5)
    A.efecto(A.ding() if hasattr(A, 'ding') else A.campana(1320, .8), L[3]['corte'] + 1.3, .25)
    for k in range(5): A.efecto(A.tic(), L[4]['corte'] + .2 + k * .5, .5)
    A.efecto(A.latido(), L[5]['corte'] + .4, .8); A.efecto(A.latido(), L[6]['corte'] + .3, .7)
    A.efecto(A.pajaros(L[9]['fin'] - L[7]['corte']), L[7]['corte'], .3)
    A.efecto(A.campana(784, 3), L[8]['palabras'][-1][0], .35)
