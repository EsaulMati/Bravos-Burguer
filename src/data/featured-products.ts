import type { ProductItem, ComboAddon, CategoryOption, OrderDraft } from "@/src/types/landing";

export const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Todo" },
  { id: "burgers", label: "Los de la Casa" },
  { id: "sides", label: "Con su Yapa" },
  { id: "drinks", label: "Pa Bajarlo" },
];

export const BURGERS_DATA: ProductItem[] = [
  { id: "brava-doble", name: "El León", category: "burgers", price: 25, description: "Doble carne, queso fundido, vegetales frescos y salsa de la casa.", image: "/bravos-el-leon-recorte.webp", cutoutImage: "/bravos-el-leon-recorte.webp", badge: "Doble", featured: true },
  { id: "brava-clasica", name: "La Gordita", category: "burgers", price: 20, description: "Carne a la plancha, queso, vegetales frescos y salsa de la casa.", image: "/bravos-la-gordita-recorte.webp", cutoutImage: "/bravos-la-gordita-recorte.webp", badge: "Clásica", featured: true },
];

export const ADDONS_DATA: ComboAddon[] = [
  { id: "fries", name: "Papas", description: "Porción de papas crocantes.", price: 2, cutoutImage: "/bravos-papas-porcion.png" },
  { id: "drink", name: "Gaseosa", description: "Gaseosa helada con hielo.", price: 5, cutoutImage: "/bravos-gaseosa-cola.png" },
];

export interface AdditionalProduct {
  id: string;
  name: string;
  price: number | null;
  image: string;
}

export const ADDITIONAL_PRODUCTS: AdditionalProduct[] = [
  { id: "extra-papas", name: "Porción de Papas", price: 5, image: "/bravos-papas-porcion.png" },
  { id: "extra-ranchera", name: "Salsa Ranchera", price: 3, image: "/bravos-salsa-ranchera.png.png" },
  { id: "extra-tartara", name: "Salsa Tártara", price: 3, image: "/bravos-salsa-tartara.png.png" },
  { id: "extra-mayo-golf", name: "Salsa Mayo Golf", price: 3, image: "/bravos-salsa-mayo-golf.webp" },
  { id: "extra-coca-cola", name: "Coca-Cola", price: 5, image: "/bravos-gaseosa-cola.png" },
  { id: "extra-inca-kola", name: "Inca Kola", price: 5, image: "/bravos-gaseosa-vaso.png" },
];

export const ORDER_PRICE_MATRIX: Record<string, { solo: number; fries: number; drink: number; full: number }> = {
  "brava-clasica": { solo: 20, fries: 22, drink: 25, full: 27 },
  "brava-doble": { solo: 25, fries: 27, drink: 30, full: 32 },
};

export function getOrderUnitPrice(burgerId: string, friesEnabled: boolean, drinkEnabled: boolean): number | null {
  const prices = ORDER_PRICE_MATRIX[burgerId];
  if (!prices) return null;
  if (friesEnabled && drinkEnabled) return prices.full;
  if (friesEnabled) return prices.fries;
  if (drinkEnabled) return prices.drink;
  return prices.solo;
}

export function calculateOrderPrice(order: OrderDraft): number | null {
  const prices = ORDER_PRICE_MATRIX[order.burgerId];
  if (!prices) return null;
  const friesDelta = prices.fries - prices.solo;
  const drinkDelta = prices.drink - prices.solo;
  return prices.solo * order.burgerQuantity + (order.friesEnabled ? friesDelta * order.friesQuantity : 0) + (order.drinkEnabled ? drinkDelta * order.drinkQuantity : 0);
}

export interface MenuCatalogItem {
  id: string;
  name: string;
  price: number;
  image: string;
  orientation: "portrait" | "landscape";
  includesFries?: boolean;
  includesDrink?: boolean;
  description?: string;
}

export interface MenuCatalogSection {
  id: string;
  title: string;
  items: MenuCatalogItem[];
}

const LEON_DESCRIPTION = BURGERS_DATA.find((item) => item.id === "brava-doble")?.description;
const GORDITA_DESCRIPTION = BURGERS_DATA.find((item) => item.id === "brava-clasica")?.description;

export const MENU_SECTIONS: MenuCatalogSection[] = [
  { id: "los-de-la-casa", title: "Los de la Casa", items: [
    { id: "gordita", name: "La Gordita", price: 20, image: "/bravos-la-gordita-foto.webp", orientation: "portrait", description: GORDITA_DESCRIPTION },
    { id: "leon", name: "El León", price: 25, image: "/bravos-el-leon-foto.webp", orientation: "portrait", description: LEON_DESCRIPTION },
  ] },
  { id: "con-su-yapa", title: "Con su Yapa", items: [
    { id: "gordita-papas", name: "La Gordita con Papas", price: 22, image: "/bravos-la-gordita-con-papas-foto.webp", orientation: "landscape", includesFries: true, description: GORDITA_DESCRIPTION },
    { id: "leon-papas", name: "El León con Papas", price: 27, image: "/bravos-el-leon-con-papas-foto.webp", orientation: "landscape", includesFries: true, description: LEON_DESCRIPTION },
  ] },
  { id: "pa-bajarlo", title: "Pa Bajarlo", items: [
    { id: "gordita-gaseosa", name: "La Gordita con Gaseosa", price: 25, image: "/bravos-la-gordita-con-gaseosa-foto.webp", orientation: "landscape", includesDrink: true, description: GORDITA_DESCRIPTION },
    { id: "leon-gaseosa", name: "El León con Gaseosa", price: 30, image: "/bravos-el-leon-con-gaseosa-foto.webp", orientation: "landscape", includesDrink: true, description: LEON_DESCRIPTION },
  ] },
  { id: "con-todo", title: "Con Todo", items: [
    { id: "gordita-full", name: "La Gordita Full", price: 27, image: "/bravos-la-gordita-full-foto.webp", orientation: "landscape", includesFries: true, includesDrink: true, description: GORDITA_DESCRIPTION },
    { id: "leon-full", name: "El León Full", price: 32, image: "/bravos-el-leon-full-foto.webp", orientation: "landscape", includesFries: true, includesDrink: true, description: LEON_DESCRIPTION },
  ] },
  { id: "para-la-manchita", title: "Para la Manchita", items: [
    { id: "ya-pagaron-x3", name: "Ya Pagaron x3", price: 63, image: "/bravos-ya-pagaron-x3-menu.webp", orientation: "landscape", includesFries: true, description: "Tres hamburguesas con papas para compartir." },
    { id: "ya-pagaron-x4", name: "Ya Pagaron x4", price: 82, image: "/bravos-ya-pagaron-x4-menu.webp", orientation: "landscape", includesFries: true, description: "Cuatro hamburguesas con papas para la manchita." },
  ] },
];

export const MENU_PRODUCTS = MENU_SECTIONS.flatMap((section) => section.items);

export const SHARE_COMBOS = [
  { id: "ya-pagaron-x3", name: "Ya Pagaron x3", description: "Tres hamburguesas con papas para compartir.", price: 63, image: "/bravos-ya-pagaron-x3-con-papas.png" },
  { id: "ya-pagaron-x4", name: "Ya Pagaron x4", description: "Cuatro hamburguesas con papas para la manchita.", price: 82, image: "/bravos-ya-pagaron-x4-con-papas.png" },
] as const;

export const FEATURED_PRODUCTS: ProductItem[] = [...BURGERS_DATA];
