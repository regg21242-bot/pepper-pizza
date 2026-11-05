# El secreto del pachinko — guion y publicación

Vídeo vertical 1080×1920, ~60 s, voz de Álvaro (es-ES-AlvaroNeural), música, efectos y subtítulos.

## Narración

1. En Japón, apostar dinero es ilegal. Pero aquí, cada noche, miles de personas ganan dinero.
2. Esto es un pachinko: una mezcla de pinball y tragaperras. Y hay miles por todo el país.
3. Juegas con bolitas de metal. Si ganas, te dan más bolitas. Pero el local no puede darte dinero.
4. Así que cambias las bolitas por un premio especial: una tarjetita con un poquito de oro dentro.
5. Luego sales, das la vuelta a la esquina… y hay una ventanita escondida. Ahí te compran el premio. En efectivo.
6. Esa ventanita es de otra empresa. Le vende el premio a un mayorista… que se lo devuelve al pachinko. Y el mismo premio da vueltas una y otra vez.
7. ¿Y la policía? Lo sabe. Y es totalmente legal. Lo llaman el sistema de las tres tiendas.
8. Todo el mundo lo sabe… pero nadie lo dice. ¿Tú entrarías a jugar?

## Texto para la publicación

> ¿Tú entrarías a jugar? 👇
>
> #curiosidades #japon #sabiasque #datoscuriosos #pachinko

## Cómo se rehace

1. Edita el texto en `guion.json`.
2. `python3 voz.py <carpeta>` genera la voz y `tiempos.js` (subtítulos y duración de cada escena).
3. `python3 audio.py <carpeta> audio.wav` mezcla música, efectos y voz.
4. `node render.js pachinko.mp4 audio.wav` renderiza el vídeo.

## Datos (verificados)

- En Japón las apuestas con dinero están prohibidas por el Código Penal; solo se permiten carreras públicas (caballos, lanchas, bicicletas, motos) y loterías.
- El pachinko se considera "entretenimiento": los premios no pueden ser dinero.
- Los jugadores cambian las bolitas por "premios especiales" (特殊景品, a menudo una tarjeta con una lámina de oro), que venden en una ventanilla aparte (景品交換所) gestionada por otra empresa. El premio vuelve al salón a través de un mayorista: es el "sistema de las tres tiendas" (三店方式, santen hōshiki).
- Hay varios miles de salones en Japón (unos 7.000 en los últimos años).
