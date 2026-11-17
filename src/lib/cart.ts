import { ADDITIONAL_PRODUCTS, BURGERS_DATA, ORDER_PRICE_MATRIX, PROMOS } from "@/src/data/featured-products";
import type { BuilderCartItem, Cart, CartItem, CatalogCartItem, DrinkCounts, DrinkName, OrderDraft, SauceName } from "@/src/types/landing";

// v2: las burgers ya traen papas y "papas" pasó a ser porción extra; los carritos de v1 no se leen.
export const CART_STORAGE_KEY = "bravos-cart-v2";
export const CART_QUANTITY_LIMIT = 10;

export function createCartItem(order: OrderDraft): CartItem | null {
  const normalizedOrder = normalizeOrderDraft(order);
  if (!normalizedOrder) return null;
  const prices = getBuilderPrices(normalizedOrder.burgerId);
  if (!prices) return null;

  return {
    ...normalizedOrder,
    id: createLocalId(),
    ...prices,
  };
}

/** Combo con precio cerrado: la salsa es obligatoria porque todas sus burgers traen papas. */
export function createPromoCartItem(promoId: string, sauce: CatalogCartItem["sauce"], quantity: number, notes = "", drinkCounts?: DrinkCounts): CatalogCartItem | null {
  const promo = PROMOS.find((item) => item.id === promoId);
  const normalizedSauce = normalizeSauce(sauce);
  if (!promo || !normalizedSauce) return null;
  const counts = promo.drinkCount ? normalizeDrinkCounts(drinkCounts, promo.drinkCount) : undefined;
  if (promo.drinkCount && !counts) return null;
  return { id: createLocalId(), kind: "catalog", productId: promo.id, name: `Combo ${promo.name}`, unitPrice: promo.price, quantity: normalizeQuantity(quantity), sauce: normalizedSauce, drink: null, notes: notes.trim().slice(0, 200), ...(counts && { drinkCounts: counts }) };
}

export const DRINK_NAMES: readonly DrinkName[] = ["Coca-Cola", "Inca Kola"];

/** Acepta el reparto solo si suma exactamente las gaseosas que trae el combo. */
function normalizeDrinkCounts(value: unknown, total: number): DrinkCounts | undefined {
  if (!isRecord(value)) return undefined;
  const counts: DrinkCounts = {};
  let sum = 0;
  for (const name of DRINK_NAMES) {
    const count = value[name];
    if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) continue;
    counts[name] = count;
    sum += count;
  }
  return sum === total ? counts : undefined;
}

/** "1 Coca-Cola + 1 Inca Kola" o "2 Coca-Cola". */
export function formatDrinkCounts(counts: DrinkCounts | undefined): string | null {
  if (!counts) return null;
  const parts = DRINK_NAMES.filter((name) => (counts[name] ?? 0) > 0).map((name) => `${counts[name]} ${name}`);
  return parts.length > 0 ? parts.join(" + ") : null;
}

export function createAdditionalCartItem(productId: string): CatalogCartItem | null {
  const product = ADDITIONAL_PRODUCTS.find((item) => item.id === productId);
  if (!product || product.price === null) return null;
  return { id: createLocalId(), kind: "catalog", productId: product.id, name: product.name, unitPrice: product.price, quantity: 1, sauce: null, drink: null };
}

export function getCartItemImage(item: CartItem): string | null {
  if (isCatalogCartItem(item)) return [...PROMOS, ...ADDITIONAL_PRODUCTS].find((product) => product.id === item.productId)?.image ?? null;
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
  // Los precios guardados en el navegador no se usan nunca: se pueden editar a mano. Siempre salen del catálogo.
  const prices = getBuilderPrices(order.burgerId);
  if (!prices) return null;
  return { ...order, id: value.id.slice(0, 100), ...prices };
}

function normalizeCatalogCartItem(value: Record<string, unknown>): CatalogCartItem | null {
  if (typeof value.productId !== "string" || typeof value.id !== "string") return null;
  const promo = PROMOS.find((item) => item.id === value.productId);
  if (promo) {
    const sauce = normalizeSauce(value.sauce);
    const drinkCounts = promo.drinkCount ? normalizeDrinkCounts(value.drinkCounts, promo.drinkCount) : undefined;
    if (!sauce || (promo.drinkCount && !drinkCounts)) return null;
    return { id: value.id.slice(0, 100), kind: "catalog", productId: promo.id, name: `Combo ${promo.name}`, unitPrice: promo.price, quantity: normalizeQuantity(value.quantity), sauce, drink: null, notes: typeof value.notes === "string" ? value.notes.slice(0, 200) : "", ...(drinkCounts && { drinkCounts }) };
  }
  const product = ADDITIONAL_PRODUCTS.find((item) => item.id === value.productId);
  if (!product || product.price === null) return null;

  return {
    id: value.id.slice(0, 100),
    kind: "catalog",
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: normalizeQuantity(value.quantity),
    sauce: null,
    drink: null,
  };
}

function normalizeOrderDraft(value: unknown): OrderDraft | null {
  if (!isRecord(value) || typeof value.burgerId !== "string") return null;
  if (!BURGERS_DATA.some((burger) => burger.id === value.burgerId)) return null;

  // Toda burger trae papas, así que la salsa siempre se elige; friesEnabled es la porción extra.
  const sauce = normalizeSauce(value.sauce);
  const drink = value.drinkEnabled === true ? normalizeDrink(value.drink) : null;
  if (!sauce) return null;
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

function getBuilderPrices(burgerId: string): Pick<BuilderCartItem, "unitPrice" | "friesUnitPrice" | "drinkUnitPrice"> | null {
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
