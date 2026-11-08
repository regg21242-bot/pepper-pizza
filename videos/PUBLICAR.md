# 4 vídeos nuevos — listos para subir

> Índice completo de todos los vídeos (con textos y hashtags): ver `INDICE.md`.

Todos son verticales (1080×1920), duran entre 47 y 62 segundos y llevan la voz de Álvaro, música, efectos y subtítulos.

## Orden recomendado para publicar

Uno al día, empezando por el que más potencial tiene:

| # | Vídeo | Archivo | Por qué |
|---|---|---|---|
| 1 | El hombre que vendió la Torre Eiffel | `torre-eiffel/torre-eiffel.mp4` | Historia de estafa con giro ("¡la vendió otra vez!"); el formato de historia + giro es el que más vistas saca |
| 2 | El flautista de Hamelín era real | `hamelin/hamelin.mp4` | Misterio sin resolver: los misterios históricos están entre lo más visto (un vídeo sobre este mismo tema pasó de 1,2 M en TikTok en octubre) |
| 3 | En Japón puedes alquilar a un papá | `familia-alquiler/familia-alquiler.mp4` | Japón + "negocio raro", lo que mejor le funcionó a la cuenta analizada |
| 4 | La plaga del baile de 1518 | `plaga-baile/plaga-baile.mp4` | Historia "rara pero real", muy visual |

## Textos para copiar y pegar

**Torre Eiffel**
```
¿Tú te habrías dejado engañar? 👇

#curiosidades #historia #sabiasque #paris #historiasreales
```

**Hamelín**
```
¿Qué crees que les pasó a esos niños? 👇

#curiosidades #misterio #historia #sabiasque #historiasreales
```

**Alquilar a un papá**
```
¿Tú alquilarías a alguien así? 👇

#curiosidades #japon #sabiasque #datoscuriosos #historiasreales
```

**Plaga del baile**
```
¿Podría pasar algo así hoy? 👇

#curiosidades #historia #misterio #sabiasque #datoscuriosos
```

## Lo que está funcionando ahora (investigación de octubre–noviembre 2026)

Analicé los reels y TikToks en español que más superaron la media de su creador en el último mes:

- **Historias reales contadas con animación 2D** y un narrador: un vídeo animado sobre un trasplante de cabeza a un mono sacó 1,9 M de vistas (147 veces la media de esa cuenta), y uno sobre por qué Chiapas es de México, 1 M.
- **Misterios y "cosas que no te contaron"**: el flautista de Hamelín (1,2 M), qué pasaba si un kamikaze volvía (873 mil) o historias raras de reyes y reinas.
- **Japón** sigue funcionando muy bien (las geta, la seguridad de sus tiendas, sus inventos).
- **Gancho en el primer segundo con algo imposible**: "Un hombre se colaba en la casa cada noche" (5,3 M), "Le cortaron la cabeza a este mono y sobrevivió".
- **Duración**: los que mejor funcionan duran entre 35 y 75 segundos.
- **Cierre con una pregunta de opinión** en el vídeo y en la descripción, para que la gente comente.

## Datos de cada vídeo (comprobados)

- **Torre Eiffel:** Victor Lustig se hizo pasar por funcionario en 1925 y vendió la torre "como chatarra" a André Poisson, que pagó más un soborno y no lo denunció por vergüenza. Lustig volvió e intentó repetirlo; esta vez sí lo denunciaron y huyó.
- **Hamelín:** el 26 de junio de 1284 desaparecieron 130 niños tras un flautista vestido de colores. Lo recordaba un vitral de la iglesia (hacia 1300) y un registro de 1384 dice "hace 100 años que se fueron nuestros niños". En la Bungelosenstraße no se toca música por tradición. Las ratas se añadieron en el siglo XVI.
- **Alquilar familia:** Family Romance la fundó Yuichi Ishii en 2009 en Tokio. Werner Herzog hizo la película *Family Romance, LLC* (2019), sobre una niña de 12 años y su "papá" de alquiler. Ishii dice que su objetivo es una sociedad en la que nadie necesite su servicio.
- **Plaga del baile:** en julio de 1518, en Estrasburgo, una mujer empezó a bailar sin parar y se le unieron decenas de personas (entre 50 y 400, según la fuente). La ciudad contrató músicos y montó escenarios. Al final llevaron a los afectados a un santuario de San Vito para rezar.

## Cómo hacer más vídeos con el mismo sistema

1. Crea una carpeta con `guion.json` (copia uno de estos y cambia el texto; `{1284|mil doscientos ochenta y cuatro}` muestra la cifra y la voz la lee en palabras; `*palabra*` la resalta en amarillo).
2. `lib/hacer.sh <carpeta> solo-voz` genera la voz y los tiempos.
3. Escribe `escenas.js` (una función por escena) y `audio.py` (efectos).
4. `lib/hacer.sh <carpeta> solo-render` genera el vídeo final.
