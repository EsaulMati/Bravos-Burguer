# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas en Arequipa que quieren conocer rápidamente la oferta de Bravos Burger, configurar un pedido y dejarlo listo para enviar por WhatsApp.

## Product Purpose

Presentar el menú y precios de Bravos Burger, permitir armar una orden visualmente, conservar el carrito en el navegador y preparar el pedido para enviarlo por WhatsApp.

## Positioning

Bravos Burger es una propuesta de hamburguesas premium con identidad Grill & Smoke, cocina al fuego y una experiencia visual gastronómica propia.

## Operating Context

La experiencia debe funcionar en web móvil y escritorio. El usuario explora el menú, configura hamburguesa y acompañamientos, agrega órdenes al carrito, confirma datos mínimos y continúa a WhatsApp.

## Capabilities and Constraints

- Mantener el constructor, carrito, persistencia local, checkout compacto y generación del pedido para WhatsApp.
- No incorporar backend, base de datos, autenticación, panel administrativo, delivery ni APIs innecesarias.
- Mantener una sola fuente de verdad para catálogo y precios.
- No inventar productos, precios ni disponibilidad no respaldados por datos o assets.
- Preservar los videos e imágenes originales sin recomprimirlos ni modificarlos físicamente.

## Brand Commitments

- Nombre: Bravos Burger / Bravos Grill & Smoke.
- Logo oficial: `/public/bravos-logo.png`.
- Identidad: hamburguesas premium, grill, humo, madera, carbón, fuego, bronce, ámbar, crema y ambiente nocturno cálido.
- Evitar una interfaz uniformemente negra, saturada de naranja, bordes o brillos.
- La fotografía gastronómica y los escenarios físicos deben liderar la experiencia.

## Evidence on Hand

- Catálogo central existente en `src/data/featured-products.ts`.
- Assets oficiales de La Gordita, El León, papas, gaseosas, empanadas y combos Ya Pagaron en `/public`.
- Video principal `/public/bravos-hero.mp4`.
- Video específico del constructor y escenario publicitario de combos en `/public`.
- No hay evidencia confirmada para Carnívora ni precios de empanadas o combos fuera de los datos existentes.

## Product Principles

- La funcionalidad estable del pedido tiene prioridad sobre cualquier cambio visual.
- Ver, elegir, comprobar el precio y agregar debe ser inmediato.
- La composición del producto debe sentirse física, gastronómica y específica de Bravos.
- El menú comercial y el constructor son experiencias distintas pero comparten catálogo.
- La interfaz debe adaptarse de forma intencional a móvil y escritorio.

## Accessibility & Inclusion

Mantener semántica, navegación por teclado, foco visible, contraste suficiente, textos alternativos, controles táctiles adecuados y una experiencia coherente con `prefers-reduced-motion`.
