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
