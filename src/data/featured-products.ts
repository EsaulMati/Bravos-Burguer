import type { ProductItem, ComboAddon } from "@/src/types/landing";

/** Las dos de la casa. Siempre vienen con papas; la gaseosa y las papas extra se suman aparte. */
export const BURGERS_DATA: ProductItem[] = [
  { id: "brava-clasica", name: "La Gordita", category: "burgers", price: 20, description: "Carne a la plancha, queso, vegetales frescos y salsa de la casa. Viene con papas.", image: "/bravos-la-gordita-recorte.webp", cutoutImage: "/bravos-la-gordita-recorte.webp", menuImage: "/bravos-la-gordita-con-papas-foto.webp", badge: "Clásica", featured: true },
  { id: "brava-doble", name: "El León", category: "burgers", price: 25, description: "Doble carne, queso fundido, vegetales frescos y salsa de la casa. Viene con papas.", image: "/bravos-el-leon-recorte.webp", cutoutImage: "/bravos-el-leon-recorte.webp", menuImage: "/bravos-el-leon-con-papas-foto.webp", badge: "Doble", featured: true },
];

export const ADDONS_DATA: ComboAddon[] = [
  { id: "fries", name: "Papas extra", description: "Una porción más de papas crocantes.", price: 3, cutoutImage: "/bravos-papas-porcion.png" },
  { id: "drink", name: "Gaseosa", description: "Gaseosa helada con hielo.", price: 5, cutoutImage: "/bravos-gaseosa-cola.png" },
];

export interface PromoProduct {
  id: string;
  name: string;
  /** Lo que se muestra arriba del nombre, por ejemplo "Combo". */
  label: string;
  /** Frase corta debajo del nombre. */
  subtitle?: string;
  /** Gaseosas que trae cada combo; el cliente reparte entre Coca-Cola e Inca Kola. */
  drinkCount?: number;
  price: number;
  /** Precio si se pidiera suelto, para mostrar el ahorro. */
  regularPrice: number;
  /** Lo que lleva, tal como se escribe en el pedido de WhatsApp. */
  includes: string;
  description: string;
  image: string;
}

/** Combos con precio cerrado. Cada burger trae sus papas; se elige la salsa una vez para todo el combo. */
export const PROMOS: PromoProduct[] = [
  { id: "promo-de-caceria", name: "De Cacería", label: "Combo", price: 55, regularPrice: 60, includes: "3 Gorditas, cada una con papas", description: "Tres Gorditas, cada una con sus papas. Para salir de cacería con la manchita.", image: "/bravos-combo-de-caceria.webp" },
  { id: "promo-duo-dinamico", name: "Tu Dúo Dinámico", label: "Combo", subtitle: "El infaltable", price: 56, regularPrice: 60, includes: "2 Leones, cada uno con papas y gaseosa", drinkCount: 2, description: "Dos Leones de doble carne, cada uno con sus papas y su gaseosa. Para los dos que nunca faltan.", image: "/bravos-combo-duo-dinamico.webp" },
];

export interface AdditionalProduct {
  id: string;
  name: string;
  price: number | null;
  image: string;
}

export const ADDITIONAL_PRODUCTS: AdditionalProduct[] = [
  { id: "extra-papas", name: "Porción de Papas", price: 3, image: "/bravos-papas-porcion.png" },
  { id: "extra-ranchera", name: "Salsa Ranchera", price: 3, image: "/bravos-salsa-ranchera.png" },
  { id: "extra-tartara", name: "Salsa Tártara", price: 3, image: "/bravos-salsa-tartara.png" },
  { id: "extra-mayo-golf", name: "Salsa Mayo Golf", price: 3, image: "/bravos-salsa-mayo-golf.webp" },
  { id: "extra-coca-cola", name: "Coca-Cola", price: 5, image: "/bravos-gaseosa-cola.png" },
  { id: "extra-inca-kola", name: "Inca Kola", price: 5, image: "/bravos-gaseosa-vaso.png" },
];

/** solo: la burger con sus papas. fries: + papas extra. drink: + gaseosa. full: las dos cosas. */
export const ORDER_PRICE_MATRIX: Record<string, { solo: number; fries: number; drink: number; full: number }> = {
  "brava-clasica": { solo: 20, fries: 23, drink: 25, full: 28 },
  "brava-doble": { solo: 25, fries: 28, drink: 30, full: 33 },
};
