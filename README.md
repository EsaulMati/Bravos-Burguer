# Bravos Grill & Smoke

Sitio web de Bravos Grill & Smoke para explorar el menú, armar órdenes y preparar un pedido para enviarlo por WhatsApp. Toda la experiencia comercial funciona localmente en el navegador.

## Stack

- Next.js 16 con App Router y Turbopack.
- React 19 y TypeScript estricto.
- Tailwind CSS 4.
- Motion para transiciones puntuales de la experiencia visual.
- `next/image` y `next/font` para optimización de imágenes y tipografías.
- Fuentes Knewave (titulares grandes, estilo brocha, clase `font-brush`), Anton (nombres de productos y precios, clase `font-serif`), Rubik (textos y botones) y Barlow Condensed (etiquetas).
- Logo oficial y variantes en `public/brand/` (escudo Bravos Grill & Smoke).

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

El número se centraliza en `src/data/contact.ts` (`BRAVOS_WHATSAPP_NUMBER`).

Abrir WhatsApp no registra ni confirma la recepción de un pedido, así que no limpia el carrito. Después de abrir WhatsApp el checkout muestra "¿Ya nos llegó tu pedido?": el carrito solo se vacía cuando el cliente toca "Ya lo envié". Mientras tanto puede volver a abrir WhatsApp con el mismo mensaje. Ese estado se guarda en `sessionStorage` (`bravos-order-sent-v1`) y se descarta si cambia el carrito o los datos.

## Restricciones del proyecto

- No hay backend, API de pedidos, base de datos ni persistencia en servidor.
- No hay panel administrativo, cuentas ni autenticación.
- No hay gestión de delivery desde esta web.
- No hay cobros automáticos, QR, pasarela de pago ni integración con SUNAT.
- El hero muestra el despiece de El León movido por el scroll: 60 cuadros WebP en `public/hero/web` (computadora) y `public/hero/cel` (celular), sacados de los videos aprobados en `D:\bravos\hero-prueba\v4`. El primer cuadro es la foto real de la hamburguesa y no debe reemplazarse sin una solicitud explícita. Con movimiento reducido se queda la foto fija.
- La sección de la plancha usa la misma técnica (`src/hooks/useScrollFrames.ts`): 60 cuadros en `public/plancha/web` y `public/plancha/cel`, sacados de los videos en `D:\bravos\plancha-video`. La carne pasa de cruda a sellada con queso y el termómetro sube de 25 a 160 °C. Los cuadros se descargan recién cuando la sección se acerca.

## Publicación pendiente

Dominio canónico: https://bravossburguer.pro. Imagen para compartir: `public/og-bravos.jpg`. Pendiente del dueño: horario, zonas y costo de delivery, para mostrarlos en la web y en la ficha de Google (`app/page.tsx`).
