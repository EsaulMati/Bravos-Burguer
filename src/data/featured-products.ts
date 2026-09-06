import type { ProductItem, ComboAddon, CategoryOption, OrderDraft } from "@/src/types/landing";

export const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Todo" },
  { id: "burgers", label: "Los de la Casa" },
  { id: "empanadas", label: "Pa Picar" },
  { id: "sides", label: "Con su Yapa" },
  { id: "drinks", label: "Pa Bajarlo" },
];

export const BURGERS_DATA: ProductItem[] = [
  { id: "brava-doble", name: "El León", category: "burgers", price: 25, description: "Doble carne, queso fundido, vegetales frescos y salsa de la casa.", image: "/bravos-el-leon.png", cutoutImage: "/bravos-el-leon.png", badge: "Doble", featured: true },
  { id: "brava-clasica", name: "La Gordita", category: "burgers", price: 20, description: "Carne a la plancha, queso, vegetales frescos y salsa de la casa.", image: "/bravos-la-gordita.png", cutoutImage: "/bravos-la-gordita.png", badge: "Clásica", featured: true },
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
}

export interface MenuCatalogSection {
  title: string;
  items: MenuCatalogItem[];
}

export const MENU_SECTIONS: MenuCatalogSection[] = [
  { title: "Los de la Casa", items: [
    { id: "gordita", name: "La Gordita", price: 20, image: "/bravos-la-gordita-menu.webp", orientation: "portrait" },
    { id: "leon", name: "El León", price: 25, image: "/bravos-el-leon-menu.webp", orientation: "portrait" },
  ] },
  { title: "Con su Yapa", items: [
    { id: "gordita-papas", name: "La Gordita con Papas", price: 22, image: "/bravos-la-gordita-con-papas-menu.webp", orientation: "landscape", includesFries: true },
    { id: "leon-papas", name: "El León con Papas", price: 27, image: "/bravos-el-leon-con-papas-menu.webp", orientation: "landscape", includesFries: true },
  ] },
  { title: "Pa Bajarlo", items: [
    { id: "gordita-gaseosa", name: "La Gordita con Gaseosa", price: 25, image: "/bravos-la-gordita-con-gaseosa-menu.webp", orientation: "landscape", includesDrink: true },
    { id: "leon-gaseosa", name: "El León con Gaseosa", price: 30, image: "/bravos-el-leon-con-gaseosa-menu.webp", orientation: "landscape", includesDrink: true },
  ] },
  { title: "Con Todo", items: [
    { id: "gordita-full", name: "La Gordita Full", price: 27, image: "/bravos-la-gordita-full-menu.webp", orientation: "landscape", includesFries: true, includesDrink: true },
    { id: "leon-full", name: "El León Full", price: 32, image: "/bravos-el-leon-full-menu.webp", orientation: "landscape", includesFries: true, includesDrink: true },
  ] },
  { title: "Para la Manchita", items: [
    { id: "ya-pagaron-x3", name: "Ya Pagaron x3", price: 63, image: "/bravos-ya-pagaron-x3-menu.webp", orientation: "landscape", includesFries: true },
    { id: "ya-pagaron-x4", name: "Ya Pagaron x4", price: 82, image: "/bravos-ya-pagaron-x4-menu.webp", orientation: "landscape", includesFries: true },
  ] },
  { title: "Pa Picar", items: [
    { id: "empanada-argentina", name: "Empanada Argentina", price: 7.5, image: "/bravos-empanada-carne-menu.webp", orientation: "portrait" },
    { id: "empanada-osobuco", name: "Empanada de Osobuco", price: 10, image: "/bravos-empanada-ossobuco-menu.webp", orientation: "portrait" },
  ] },
];

export const MENU_PRODUCTS = MENU_SECTIONS.flatMap((section) => section.items);

export const SHARE_COMBOS = [
  { id: "ya-pagaron-x3", name: "Ya Pagaron x3", description: "Tres hamburguesas con papas para compartir.", price: 63, image: "/bravos-ya-pagaron-x3-con-papas.png" },
  { id: "ya-pagaron-x4", name: "Ya Pagaron x4", description: "Cuatro hamburguesas con papas para la manchita.", price: 82, image: "/bravos-ya-pagaron-x4-con-papas.png" },
] as const;

export const FEATURED_PRODUCTS: ProductItem[] = [
  ...BURGERS_DATA,
  { id: "empanada-argentina", name: "Empanada Argentina", category: "empanadas", price: 7.5, description: "Empanada de carne.", image: "/bravos-empanada-carne.png" },
  { id: "empanada-osobuco", name: "Empanada de Osobuco", category: "empanadas", price: 10, description: "Carne cocida lentamente.", image: "/bravos-empanada-ossobuco.png" },
];
