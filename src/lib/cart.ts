import { BURGERS_DATA, MENU_PRODUCTS, calculateOrderPrice } from "@/src/data/featured-products";
import type { BuilderCartItem, Cart, CartItem, CatalogCartItem, OrderDraft } from "@/src/types/landing";

export const CART_STORAGE_KEY = "bravos-cart-v1";
export const CART_QUANTITY_LIMIT = 10;

export function createCartItem(order: OrderDraft): CartItem | null {
  const normalizedOrder = normalizeOrderDraft(order);
  if (!normalizedOrder) return null;

  return {
    ...normalizedOrder,
    id: createLocalId(),
  };
}

export function createCatalogCartItem(productId: string): CatalogCartItem | null {
  const product = MENU_PRODUCTS.find((item) => item.id === productId);
  if (!product) return null;

  return {
    id: createLocalId(),
    kind: "catalog",
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: 1,
  };
}

export function getCartItemImage(item: CartItem): string | null {
  if (isCatalogCartItem(item)) return MENU_PRODUCTS.find((product) => product.id === item.productId)?.image ?? null;
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
    : calculateOrderPrice(item);
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
  return order ? { ...order, id: value.id.slice(0, 100) } : null;
}

function normalizeCatalogCartItem(value: Record<string, unknown>): CatalogCartItem | null {
  if (typeof value.productId !== "string" || typeof value.id !== "string") return null;
  const product = MENU_PRODUCTS.find((item) => item.id === value.productId);
  if (!product) return null;

  return {
    id: value.id.slice(0, 100),
    kind: "catalog",
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: normalizeQuantity(value.quantity),
  };
}

function normalizeOrderDraft(value: unknown): OrderDraft | null {
  if (!isRecord(value) || typeof value.burgerId !== "string") return null;
  if (!BURGERS_DATA.some((burger) => burger.id === value.burgerId)) return null;

  return {
    burgerId: value.burgerId,
    burgerQuantity: normalizeQuantity(value.burgerQuantity),
    friesEnabled: value.friesEnabled === true,
    friesQuantity: normalizeQuantity(value.friesQuantity),
    drinkEnabled: value.drinkEnabled === true,
    drinkQuantity: normalizeQuantity(value.drinkQuantity),
    notes: typeof value.notes === "string" ? value.notes.slice(0, 200) : "",
  };
}

export function isCatalogCartItem(item: CartItem): item is CatalogCartItem {
  return "kind" in item && item.kind === "catalog";
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
