# Notas del proyecto (léelas al empezar un chat nuevo)

Este repositorio empezó como la página de **Pepper Pizza** (`index.html`, `img/`), pero ahora sobre todo guarda los **vídeos para TikTok/Reels** en `videos/` y las notas de la **página de Kahal Bioturismo**.

Rama de trabajo: `claude/eager-knuth-pxgzyv`.

---

## 1. Vídeos para TikTok / Reels

- Índice de todos los vídeos (estado, textos y hashtags): **`videos/INDICE.md`**
- Guía para publicar y resumen de la investigación: `videos/PUBLICAR.md`

### Lo que le gusta al usuario
- Voz: **Álvaro** (`es-ES-AlvaroNeural`, velocidad +8 a +12 %). Es la que más le gustó.
- Estilo que mejor funciona: **monitos de palitos con fondos detallados**, subtítulos abajo con la palabra clave resaltada en amarillo.
- Hay un segundo estilo "cine" (oscuro, subtítulos arriba palabra por palabra con recuadro azul, paneles de vidrio, detalles dorados): `videos/lib/cine.js`.
- Duración: 45–60 s o más. Si es una serie, cada parte de al menos 55 s.
- Español con palabras de México ("metro", no "flexómetro" raro; evitar "coger", usar "llevar").
- Comprobar los datos con búsquedas antes de hacer el guion y dar las fuentes. No inventar cifras: si algo es una estimación, decirlo.
- Dibujos originales: nada de copiar personajes, logos o imágenes con derechos de autor.
- Siempre terminar con una **pregunta de opinión** para que comenten.

### Fórmula de contenido (de la investigación)
Lo que más vistas saca: historias reales contadas con animación, misterios, "cosas que no te contaron", Japón y negocios raros, y un gancho imposible en el primer segundo.
Después de los primeros vídeos, el usuario pidió temas **actuales**, de algo que **tú podrías contratar o hacer**, y que dejen una **pregunta moral**. El que más le convenció: alquilar a un papá en Japón.

Ideas pendientes: agencias de renuncia (Momuri), wakaresaseya (separadores de parejas), jōhatsu (gente que desaparece), Shoji Morimoto (el hombre que se alquila para no hacer nada), ikemeso (chicos guapos que te hacen llorar), novios de alquiler en China, funerales en vida en Corea, agencias que piden perdón por ti y hermanas de alquiler.

### Cómo se hace un vídeo
Cada vídeo vive en `videos/<carpeta>/` con:
`guion.json` (texto por escena; `*palabra*` = resaltada, `{1284|mil doscientos ochenta y cuatro}` = número en pantalla y palabras en la voz), `escenas.js` (dibujos en canvas), `audio.py` (música y efectos), `index.html` (copiado de `lib/plantilla.html`), `tiempos.js` (se genera solo).

```bash
cd videos
bash lib/hacer.sh <carpeta>              # voz + render + audio → <carpeta>/<carpeta>.mp4
bash lib/hacer.sh <carpeta> solo-voz     # solo regenerar la voz y los tiempos
bash lib/hacer.sh <carpeta> solo-render  # solo volver a dibujar
```
Librería compartida en `videos/lib/`: `base.js` (personajes, subtítulos, fondos), `cine.js`, `voz.py` (edge-tts), `sonido.py` (música: juguetón, medieval, japón, parís, cine; y efectos), `render.js` (Playwright + ffmpeg).

### Cosas técnicas a recordar
- La voz (edge-tts) solo funciona porque en el entorno está permitido el dominio `speech.platform.bing.com`.
- **Git:** subir un commit con código y un MP4 grande juntos falla ("commit_refs"). Primero haz commit y push del código, y después el MP4 solo en otro commit.
- Los MP4 salen de 15 a 40 MB. Si una app no los acepta, comprimirlos con ffmpeg (CRF más alto) a unos 8–15 MB.
- vidIQ no tiene créditos, e instagram.com está bloqueado desde aquí.

---

## 2. Página web de Kahal Bioturismo (cliente)

- Artefacto (privado; el usuario lo comparte desde el menú Compartir): https://claude.ai/artifact/UVMGMs9oJQK31om3L6bB5s
- Lema: "VIVE DESDE LA / CONSERVACIÓN" (conservación en grande).
- WhatsApp de reservas: +52 612 101 4653 (`WA_NUMERO='5216121014653'`).
- Reserva: el cliente elige expedición, fecha, número de personas y **Estudiante / General**. El mensaje de WhatsApp no incluye el total, porque el cliente explica él mismo los pagos en partes.
- Se la va a vender a un familiar (Fernando). Hablamos del dominio (.com o .mx, unos 200–400 MXN al año de renovación, que paga el cliente) y del precio del trabajo.

Pendiente con el cliente:
- Dijo "por el momento dejaremos solo las actividades de campamento": falta confirmar qué se quita.
- Opcional: poner "Presentar credencial vigente" en el precio de estudiante.
- Opcional: buscar qué nombres de dominio están libres.

---

## 3. Otros pendientes
- `videos/tienda-humanos/`: borrador sin terminar ("¿Una tienda de personas?"). Decidir si se termina o se borra.
- `videos/cebollas/`: primer vídeo, sustituido por otros (sin MP4).
- Resumen de película: hecho con "La noche de los muertos vivientes" (dominio público). Para usar escenas reales, el usuario tendría que bajarla de archive.org y mandarla.

---

## 4. Herramientas de edición (instaladas el 11-nov-2026)
- **HyperFrames**: plugin de Claude Code (`claude plugin install hyperframes@hyperframes`) + CLI con `npx hyperframes` (init / preview / render; `--resolution portrait` = 1080×1920).
- **Whisper** (faster-whisper) en `/root/.venvs/video` (con `av==18.1.0`; la 19 rompe faster-whisper).
  `/root/.venvs/video/bin/python videos/lib/transcribir.py GRABACION.mp4 --modelo small --palabras 4` → `.srt` + `.json` con tiempos por palabra.
- **yt-dlp** en el mismo venv (enlazado en `/root/.local/bin/yt-dlp`). YouTube, TikTok e Instagram están bloqueados por la red del entorno (necesitan comodines como `*.googlevideo.com` que se agregan en Settings).
- **earshot** (`uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot"`, modelos con `earshot doctor --fetch`), MCP: `claude mcp add earshot --scope user -e EARSHOT_THREADS=3 -- earshot mcp`. `earshot measure archivo.wav` da LUFS / true peak; `earshot sfx list` / `sfx render ID -o x.wav` para whoosh, pop, clic.
- **Blender MCP**: `claude mcp add blender --scope user uvx mcp-for-blender`. Solo sirve si Blender corre en la misma máquina que Claude Code (en la nube no hay Blender).
- El contenedor de la nube se borra: lo instalado se reinstala con el script de configuración del entorno.
