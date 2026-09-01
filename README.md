# Bravos Burger

Sitio web de Bravos Burger para explorar el menú, armar órdenes y preparar un pedido para enviarlo por WhatsApp. Toda la experiencia comercial funciona localmente en el navegador.

## Stack

- Next.js 16 con App Router y Turbopack.
- React 19 y TypeScript estricto.
- Tailwind CSS 4.
- Motion para transiciones puntuales de la experiencia visual.
- `next/image` y `next/font` para optimización de imágenes y tipografías.
- Fuentes Rasa, Montserrat Alternates y Dosis.

El gestor de paquetes del proyecto es npm (`package-lock.json`).

## Instalación y ejecución

Requiere una versión de Node.js compatible con Next.js 16.

```bash
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

Para ejecutar el build de producción localmente:

```bash
npm run build
npm run start
```

## Comandos de verificación

```bash
npm run lint
npm exec tsc -- --noEmit --incremental false
npm run build
```

## Estructura principal

- `app/`: layout global, metadata, estilos y ruta principal `/`.
- `src/components/landing/`: hero, menú, constructor, carrito, checkout y footer.
- `src/data/featured-products.ts`: catálogo central de productos, categorías y precios.
- `src/data/contact.ts`: configuración de contacto de Bravos.
- `src/lib/`: normalización del carrito y checkout, cálculos y mensaje de WhatsApp.
- `src/types/landing.ts`: modelos TypeScript compartidos.
- `public/`: video e imágenes del catálogo.

## Funcionalidades actuales

- Menú filtrable por categorías.
- Constructor de orden con hamburguesa, complementos, cantidades y observaciones.
- Carrito local con múltiples órdenes independientes, edición y eliminación.
- Checkout compacto con nombre, celular y selección de Yape o Plin.
- Revisión final y generación del mensaje para WhatsApp.
- Diseño responsive y estados accesibles para teclado y tecnologías de asistencia.

## Persistencia local

No existe servidor ni base de datos. La información se almacena únicamente en el navegador:

- `bravos-cart-v1`: líneas del carrito.
- `bravos-checkout-v1`: nombre, celular y método de pago.

Los datos recuperados se validan y un JSON inválido se descarta sin bloquear la aplicación.

## Configuración de WhatsApp

El número se centraliza en `src/data/contact.ts`. Actualmente `BRAVOS_WHATSAPP_NUMBER` permanece vacío de forma deliberada, por lo que el botón de envío está deshabilitado. No se debe inventar ni publicar un número hasta recibir el contacto real de Bravos.

Abrir WhatsApp no registra ni confirma la recepción de un pedido y tampoco limpia el carrito.

## Restricciones del proyecto

- No hay backend, API de pedidos, base de datos ni persistencia en servidor.
- No hay panel administrativo, cuentas ni autenticación.
- No hay gestión de delivery desde esta web.
- No hay cobros automáticos, QR, pasarela de pago ni integración con SUNAT.
- El hero, su video, sus textos sincronizados y su comportamiento se consideran piezas protegidas y no deben modificarse sin una solicitud explícita.

## Publicación pendiente

Antes de publicar deben definirse el dominio canónico, la imagen Open Graph y el número real de WhatsApp. No se configuraron URLs ni datos ficticios.
