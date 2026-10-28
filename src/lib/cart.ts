import { ADDITIONAL_PRODUCTS, BURGERS_DATA, MENU_PRODUCTS, ORDER_PRICE_MATRIX } from "@/src/data/featured-products";
import type { BuilderCartItem, Cart, CartItem, CatalogCartItem, OrderDraft, SauceName } from "@/src/types/landing";

export const CART_STORAGE_KEY = "bravos-cart-v1";
export const CART_QUANTITY_LIMIT = 10;

export function createCartItem(order: OrderDraft): CartItem | null {
  const normalizedOrder = normalizeOrderDraft(order);
  if (!normalizedOrder) return null;
  const prices = getBuilderPriceSnapshot(normalizedOrder.burgerId);
  if (!prices) return null;

  return {
    ...normalizedOrder,
    id: createLocalId(),
    ...prices,
  };
}

export function createCatalogCartItem(productId: string, selections?: Pick<CatalogCartItem, "sauce" | "drink">): CatalogCartItem | null {
  const product = MENU_PRODUCTS.find((item) => item.id === productId);
  if (!product) return null;
  const sauce = product.includesFries ? normalizeSauce(selections?.sauce) : null;
  const drink = product.includesDrink ? normalizeDrink(selections?.drink) : null;
  if (product.includesFries && !sauce) return null;
  if (product.includesDrink && !drink) return null;

  return {
    id: createLocalId(),
    kind: "catalog",
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: 1,
    sauce,
    drink,
  };
}

export function createAdditionalCartItem(productId: string): CatalogCartItem | null {
  const product = ADDITIONAL_PRODUCTS.find((item) => item.id === productId);
  if (!product || product.price === null) return null;
  return { id: createLocalId(), kind: "catalog", productId: product.id, name: product.name, unitPrice: product.price, quantity: 1, sauce: null, drink: null };
}

export function getCartItemImage(item: CartItem): string | null {
  if (isCatalogCartItem(item)) return [...MENU_PRODUCTS, ...ADDITIONAL_PRODUCTS].find((product) => product.id === item.productId)?.image ?? null;
  return BURGERS_DATA.find((product) => product.id === item.burgerId)?.image ?? null;
}

export function normalizeCart(value: unknown): Cart {
  if (!isRecord(value) || !Array.isArray(value.items)) return { items: [] };

  const items = value.items
    .map(normalizeCartItem)
    .filter((item): item is CartItem => item !== null);

  return { items };
}

export function calculateCartItemSubtotal(item: CartItem): number | null {
  return isCatalogCartItem(item)
    ? item.unitPrice * item.quantity
    : item.unitPrice * item.burgerQuantity
      + (item.friesEnabled ? item.friesUnitPrice * item.friesQuantity : 0)
      + (item.drinkEnabled ? item.drinkUnitPrice * item.drinkQuantity : 0);
}

/** Cantidad total de productos principales, no cantidad de líneas ni componentes. */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + (isCatalogCartItem(item) ? item.quantity : item.burgerQuantity),
    0
  );
}

export function calculateCartTotal(items: CartItem[]): number | null {
  let total = 0;

  for (const item of items) {
    const subtotal = calculateCartItemSubtotal(item);
    if (subtotal === null) return null;
    total += subtotal;
  }

  return total;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value) || typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (value.kind === "catalog") return normalizeCatalogCartItem(value);

  const order = normalizeOrderDraft(value);
  if (!order) return null;
  const fallbackPrices = getBuilderPriceSnapshot(order.burgerId);
  if (!fallbackPrices) return null;
  return {
    ...order,
    id: value.id.slice(0, 100),
    unitPrice: normalizeHistoricalPrice(value.unitPrice) ?? fallbackPrices.unitPrice,
    friesUnitPrice: normalizeHistoricalPrice(value.friesUnitPrice) ?? fallbackPrices.friesUnitPrice,
    drinkUnitPrice: normalizeHistoricalPrice(value.drinkUnitPrice) ?? fallbackPrices.drinkUnitPrice,
  };
}

function normalizeCatalogCartItem(value: Record<string, unknown>): CatalogCartItem | null {
  if (typeof value.productId !== "string" || typeof value.id !== "string") return null;
  const product = [...MENU_PRODUCTS, ...ADDITIONAL_PRODUCTS].find((item) => item.id === value.productId);
  if (!product || product.price === null) return null;

  const sauce = "includesFries" in product && product.includesFries ? normalizeSauce(value.sauce) : null;
  const drink = "includesDrink" in product && product.includesDrink ? normalizeDrink(value.drink) : null;
  if ("includesFries" in product && product.includesFries && !sauce) return null;
  if ("includesDrink" in product && product.includesDrink && !drink) return null;

  return {
    id: value.id.slice(0, 100),
    kind: "catalog",
    productId: product.id,
    name: product.name,
    unitPrice: normalizeHistoricalPrice(value.unitPrice) ?? product.price,
    quantity: normalizeQuantity(value.quantity),
    sauce,
    drink,
  };
}

function normalizeOrderDraft(value: unknown): OrderDraft | null {
  if (!isRecord(value) || typeof value.burgerId !== "string") return null;
  if (!BURGERS_DATA.some((burger) => burger.id === value.burgerId)) return null;

  const sauce = value.friesEnabled === true ? normalizeSauce(value.sauce) : null;
  const drink = value.drinkEnabled === true ? normalizeDrink(value.drink) : null;
  if (value.friesEnabled === true && !sauce) return null;
  if (value.drinkEnabled === true && !drink) return null;

  return {
    burgerId: value.burgerId,
    burgerQuantity: normalizeQuantity(value.burgerQuantity),
    friesEnabled: value.friesEnabled === true,
    friesQuantity: normalizeQuantity(value.friesQuantity),
    drinkEnabled: value.drinkEnabled === true,
    drinkQuantity: normalizeQuantity(value.drinkQuantity),
    sauce,
    drink,
    notes: typeof value.notes === "string" ? value.notes.slice(0, 200) : "",
  };
}

/** Salsas para las papas, en el orden en que se muestran y se escriben en el pedido. */
export const SAUCES: readonly SauceName[] = ["Ranchera", "Tártara", "Mayo Golf"];

function normalizeSauce(value: unknown): CatalogCartItem["sauce"] {
  if (value === "Ninguna") return value;
  if (typeof value === "string" && (SAUCES as readonly string[]).includes(value)) return [value as SauceName];
  if (!Array.isArray(value)) return null;
  const sauces = SAUCES.filter((sauce) => value.includes(sauce));
  return sauces.length > 0 ? sauces : null;
}

export function formatSauceSelection(value: CatalogCartItem["sauce"]): string | null {
  if (value === "Ninguna") return "Sin salsa";
  return Array.isArray(value) && value.length > 0 ? value.join(" + ") : null;
}

function normalizeDrink(value: unknown): CatalogCartItem["drink"] {
  return value === "Coca-Cola" || value === "Inca Kola" ? value : null;
}

function normalizeHistoricalPrice(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1000
    ? Math.round(value * 100) / 100
    : null;
}

function getBuilderPriceSnapshot(burgerId: string): Pick<BuilderCartItem, "unitPrice" | "friesUnitPrice" | "drinkUnitPrice"> | null {
  const prices = ORDER_PRICE_MATRIX[burgerId];
  if (!prices) return null;
  return {
    unitPrice: prices.solo,
    friesUnitPrice: prices.fries - prices.solo,
    drinkUnitPrice: prices.drink - prices.solo,
  };
}

export function isCatalogCartItem(item: CartItem): item is CatalogCartItem {
  return "kind" in item && item.kind === "catalog";
}

export function isAdditionalCartItem(item: CartItem): item is CatalogCartItem {
  return isCatalogCartItem(item) && ADDITIONAL_PRODUCTS.some((product) => product.id === item.productId);
}

export function isBuilderCartItem(item: CartItem): item is BuilderCartItem {
  return !isCatalogCartItem(item);
}

function normalizeQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.min(CART_QUANTITY_LIMIT, Math.max(1, Math.trunc(value)));
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `bravos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
