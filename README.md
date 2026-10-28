# Pepper Pizza

Página web de Pepper Pizza: portada con pizza animada, pizzas favoritas, ofertas y carrito de pedidos que se envían por WhatsApp.

## Archivos

- `index.html` — la página completa (estilos y código incluidos).
- `img/` — fotos de las pizzas e ingredientes, recortadas sin fondo.

## Ajustes rápidos

En `index.html`, dentro del código del carrito:

- `const WHATSAPP = '526121697130';` — número que recibe los pedidos (código de país + número, sin espacios).
- `const SHIPPING = 2.99;` — costo de envío a domicilio.

## Publicar

Conecta este repositorio en Netlify (o Vercel) sin comando de compilación y con `/` como carpeta de publicación. Cada cambio en `main` se publica solo.

## Chispa — imágenes con IA

`chispa/index.html` es una app aparte para crear imágenes con inteligencia artificial gratis y sin registro. Usa el servicio abierto [Pollinations](https://pollinations.ai), así que no necesita claves ni servidor. Al publicar el sitio queda en `/chispa/`.

Incluye ideas por categoría, fila de espera con cuenta regresiva (el plan gratuito permite 1 imagen cada 45 segundos), favoritas, «Otra versión» de una imagen, botón para compartir por WhatsApp o redes y un visor que se desliza entre imágenes.

Antes de dibujar, una IA de texto gratuita (también de Pollinations) interpreta la idea y la convierte en una descripción detallada en inglés, que es lo que mejor entiende el modelo de imágenes. La app muestra «Así lo entendí» para confirmar o corregir; si ese paso falla, se usa la idea tal como se escribió.

Otras funciones:

- **Dictar** la idea con la voz (en navegadores que lo permiten).
- **Cambiar algo** con palabras («ponle lentes de sol»): la IA de texto ajusta la descripción y se usa la misma semilla para conservar la imagen lo más parecida posible.
- **Texto y filtros**: escribir sobre la imagen con cuatro tipos de letra, colores y siete filtros; se guarda como imagen nueva en la galería.
- **Felicitar**: ideas listas para cumpleaños, día de las madres, buenos días, etc., con el texto sugerido para ponerle encima.
- **Instalar como app** en el teléfono (`manifest.webmanifest`, `sw.js` e íconos en `chispa/`).

## Serenity Spa — propuesta

`serenity/index.html` es una propuesta de página para Serenity Spa (La Paz, B.C.S.), en español e inglés, con reservas por WhatsApp.

Las fotos se agregan poniendo los archivos en `serenity/fotos/` con estos nombres; mientras no existan se ve un degradado con una etiqueta:

- `portada.jpg` — horizontal, terapeuta dando masaje.
- `sala.jpg` — vertical, sala del spa.
- `masaje.jpg` — vertical, se muestra en forma de arco.
- `servicio-1.jpg` a `servicio-9.jpg` — una por servicio, en el orden de la lista (relajante, tejido profundo, pareja, prenatal, exfoliación, sauna, faciales, pestañas, manicura).
