# En este pueblo — entrega

## Archivos
- `en-este-pueblo.mp4`: 1080×1920, 30 fps, 98.3 s, H.264 a unos 3 Mbps más AAC 192k, 39 MB.
- `en-este-pueblo_ligero.mp4`: la misma resolución a ~1 Mbps, 13 MB, para apps que no aceptan archivos pesados.
- `en-este-pueblo.srt`: 51 subtítulos.
- Carpetas:
  - `personajes/`: hoja de personajes y ropa nueva del protagonista.
  - `escenarios/`: una captura por escenario (14).
  - `planos/`: capturas de los planos y hojas de planos.
  - `assets/audio/`: mezcla final.
  - `assets/voz/`: líneas de Álvaro.

## Lista de verificación
- [x] Los 44 planos del guion están en orden. Los planos 14a, 14b, 14c y 22b son tomas extra.
- [x] Voz de Álvaro (es-ES-AlvaroNeural, +10 %).
- [x] Subtítulos de una sola palabra, centrados: Fredoka Bold 90 px, blanco, contorno negro de 4 px y sombra.
- [x] "¡HUSS!" en cada bote del balón: 13 en total. El texto en pantalla y el efecto de audio usan los mismos tiempos de `assets/linea.json`.
- [x] La música se corta en seco en "paró" (52.195 s) y queda en silencio 1.2 s. Lo comprobé en la pista de música: el pico baja de 0.60 a 0.00.
- [x] Audio del MP4 final:
  - Integrado: −13.6 LUFS.
  - LRA: 3.5 LU.
  - True peak: −1.5 dBTP.
- [x] Curva de la mezcla por secciones (LUFS):

  | Sección | LUFS |
  |---|---|
  | Inicio | −13.8 |
  | Partido | −12.9 |
  | Silencio tras "paró" | −16.6 |
  | Diálogo | −12.3 |
  | Noche siguiente | −12.8 |
  | Fiesta final | −14.1 |

- [x] Una captura por escenario en `escenarios/`.
- [x] Ropa nueva del protagonista:
  - Sudadera azul lisa con puños y bajo amarillos.
  - Tronquito original en el pecho.
  - Pantalón liso.

## Notas
- **Duración:** el video dura 98 s y no 75. La voz a velocidad natural necesita más tiempo por plano, sobre todo en los diálogos (ver tabla abajo).
- **Sin efecto en Linda:** el plano de Linda no lleva el "¡ya!" de karate. Solo suenan los golpes.

## Duración por plano (plan vs real)
| Plano | Plan (s) | Real (s) | Inicio | Texto |
|---|---|---|---|---|
| 1 | 2.0 | 1.78 | 0.00 | En este pueblo… |
| 2 | 2.0 | 1.91 | 1.78 | …todo el mundo se va de fiesta… |
| 3 | 2.5 | 2.58 | 3.69 | …menos yo. |
| 4 | 3.0 | 2.76 | 6.27 | Veo que cada noche hay una fiesta en algún lado. |
| 5 | 1.5 | 1.50 | 9.03 | — |
| 6 | 1.5 | 2.41 | 10.53 | Hasta el pez del alcalde tiene fiesta. |
| 7 | 1.8 | 1.91 | 12.94 | Aquí nadie practica nada. |
| 8 | 0.7 | 1.04 | 14.85 | ¿Para qué? |
| 9 | 1.5 | 1.78 | 15.89 | Siempre hay otra fiesta. |
| 10 | 1.6 | 2.61 | 17.67 | Mi mejor amigo va a todas las fiestas. |
| 11 | 1.6 | 2.64 | 20.28 | Mi vecina Linda va a todas las fiestas. |
| 12 | 1.8 | 2.64 | 22.92 | Hasta la abuela se va a bailar los martes. |
| 13 | 1.0 | 1.66 | 25.56 | Pero yo no. |
| 14a | 2.2 | 2.20 | 27.22 | Día tras día. |
| 14c | 1.6 | 1.60 | 29.42 | — |
| 14b | 1.6 | 1.60 | 31.02 | — |
| 15 | 2.0 | 2.68 | 32.62 | Entonces llegó la fiesta más grande del año… |
| 16 | 2.0 | 1.63 | 35.30 | …el partido de fiesta. |
| 17 | 1.2 | 2.25 | 36.93 | Todos llegaron con gorros de fiesta. |
| 18 | 1.2 | 1.69 | 39.18 | Yo entré a la cancha. |
| 19 | 2.0 | 2.17 | 40.87 | Todos se rieron del niño del gorro. |
| 20 | 1.2 | 2.18 | 43.04 | Luego, me pasaron el balón. |
| 21 | 2.4 | 2.40 | 45.22 | — |
| 22 | 1.0 | 2.40 | 47.62 | Cincuenta puntos. |
| 23 | 0.8 | 1.31 | 50.02 | Yo solito. |
| 24 | 1.2 | 1.61 | 51.33 | La música se paró. |
| 25 | 1.6 | 2.11 | 52.94 | Todo el público se quedó callado. |
| 26 | 3.0 | 3.17 | 55.05 | Kevin se acercó y me preguntó: '¿cómo eres tan bueno?' |
| 27 | 3.0 | 4.19 | 58.22 | Le dije la verdad: mientras ustedes se iban de fiesta, yo practicaba. |
| 28 | 0.6 | 0.60 | 62.41 | — |
| 29 | 1.8 | 3.47 | 63.01 | La noche siguiente caminé por el pueblo… y algo estaba raro. |
| 30 | 1.8 | 2.40 | 66.48 | Ni música, ni luces de fiesta. |
| 31 | 1.0 | 1.47 | 68.88 | Nada. |
| 32 | 4.0 | 3.39 | 70.35 | Y en cada ventana se oía… |
| 33 | 1.4 | 1.90 | 73.74 | Kevin practicaba guitarra. |
| 34 | 1.2 | 1.87 | 75.64 | Linda practicaba karate. |
| 35 | 1.4 | 2.05 | 77.51 | Mi abuela hacía lagartijas. |
| 36 | 1.4 | 1.95 | 79.56 | Ya nadie va a las fiestas. |
| 37 | 1.0 | 1.99 | 81.51 | Todo el pueblo está entrenando. |
| 38 | 0.8 | 1.65 | 83.50 | Y eso está genial. |
| 39 | 2.2 | 2.72 | 85.15 | Ahora soy el único libre el viernes en la noche. |
| 40 | 1.0 | 2.05 | 87.87 | Así que hice mi propia fiesta. |
| 41 | 1.8 | 2.55 | 89.92 | El único invitado fue el pez del alcalde. |
| 42 | 1.8 | 2.66 | 92.47 | La verdad, baila muy bien. |
| 43 | 1.4 | 1.40 | 95.13 | — |
| 44 | 0.8 | 0.80 | 96.53 | — |
| **Total** | **75.9** | **97.33** | | |

HUSS: 1.23 s (plano 1), 4.75 s (plano 3), 5.72 s (plano 3), 27.47 s (plano 14a), 28.44 s (plano 14a), 29.67 s (plano 14c), 31.27 s (plano 14b), 45.47 s (plano 21), 46.44 s (plano 21), 47.41 s (plano 21), 72.22 s (plano 32), 73.19 s (plano 32), 96.68 s (plano 44)
