import { BURGERS_DATA, PROMOS } from "@/src/data/featured-products";
import { calculateCartItemSubtotal, calculateCartTotal, formatSauceSelection, isAdditionalCartItem, isCatalogCartItem, formatDrinkCounts } from "@/src/lib/cart";
import { normalizePeruvianPhone } from "@/src/lib/checkout";
import type { Cart, CheckoutDraft, PaymentMethod } from "@/src/types/landing";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
};

export function buildOrderMessage(cart: Cart, checkout: CheckoutDraft, order?: { code: string; date: string; reopens?: string }): string {
  const cartSubtotal = calculateCartTotal(cart.items);
  const lines: string[] = [
    "🔥 BRAVOS GRILL & SMOKE",
    order ? `Pedido #${order.code} · ${order.date}` : "Nuevo pedido",
    ...(order?.reopens ? [`⏰ Enviado fuera de horario: se atiende al abrir (${order.reopens})`] : []),
    "",
    "Cliente",
    `Nombre: ${checkout.customerName.trim()}`,
    `Celular: ${normalizePeruvianPhone(checkout.phone)}`,
    "",
    "Entrega",
    `Dirección: ${checkout.address.trim()}`,
  ];
  if (checkout.reference.trim()) lines.push(`Referencia: ${checkout.reference.trim()}`);
  if (checkout.mapsUrl) lines.push(`Ubicación: ${checkout.mapsUrl}`);
  lines.push("", "Pedido");

  cart.items.filter((item) => !isAdditionalCartItem(item)).forEach((item, index) => {
    if (isCatalogCartItem(item)) {
      lines.push("", `${index + 1}. ${item.quantity} × ${item.name}`);
      const promo = PROMOS.find((product) => product.id === item.productId);
      if (promo) lines.push(`   • Incluye: ${promo.includes}`);
      if (item.sauce) lines.push(`   • Salsas: ${formatSauceSelection(item.sauce)}`);
      if (item.drink) lines.push(`   • Gaseosa: ${item.drink}`);
      const drinks = formatDrinkCounts(item.drinkCounts);
      if (drinks) lines.push(`   • Gaseosas: ${drinks}${item.quantity > 1 ? " (en cada combo)" : ""}`);
      if (item.notes?.trim()) lines.push(`   • Indicaciones: ${item.notes.trim()}`);
      lines.push(`   • Subtotal: ${formatCurrency(calculateCartItemSubtotal(item))}`);
      return;
    }

    const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
    if (!burger) return;
    const subtotal = calculateCartItemSubtotal(item);

    lines.push("", `${index + 1}. ${item.burgerQuantity} × ${burger.name}`);
    lines.push("   • Con papas");
    if (item.sauce) lines.push(`   • Salsas: ${formatSauceSelection(item.sauce)}`);
    if (item.friesEnabled) lines.push(`   • Papas extra: ${item.friesQuantity}`);
    if (item.drinkEnabled && item.drink) lines.push(`   • Gaseosa: ${item.drink} (${item.drinkQuantity})`);
    if (item.notes.trim()) lines.push(`   • Indicaciones: ${item.notes.trim()}`);
    lines.push(`   • Subtotal: ${formatCurrency(subtotal)}`);
  });

  const additionalItems = cart.items.filter(isAdditionalCartItem);
  if (additionalItems.length > 0) {
    lines.push("", "ADICIONALES");
    additionalItems.forEach((item) => {
      lines.push("", `${item.name} x${item.quantity}`);
      lines.push(`   • Subtotal: ${formatCurrency(calculateCartItemSubtotal(item))}`);
    });
  }

  lines.push("", "Pago", `Método: ${paymentLabel(checkout.paymentMethod)}`);

  lines.push("", `Total: ${formatCurrency(cartSubtotal)}`, "Delivery: por confirmar");

  return lines.join("\n");
}

export function normalizeWhatsAppNumber(
  configuredNumber: string,
  defaultCountryCode: string
): string {
  const digits = configuredNumber.replace(/\D/g, "");
  const countryCode = defaultCountryCode.replace(/\D/g, "");
  if (!digits || !countryCode) return "";
  if (digits.startsWith(countryCode)) return digits;
  return `${countryCode}${digits}`;
}

export function buildWhatsAppUrl(number: string, message: string): string | null {
  if (!number || !message.trim()) return null;
  // Directo a api.whatsapp.com: la redirección de wa.me rompe los emojis del mensaje (el 🔥 llegaba como "�").
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}

function paymentLabel(method: CheckoutDraft["paymentMethod"]): string {
  return method ? PAYMENT_LABELS[method] : "Por definir";
}

function formatCurrency(value: number | null): string {
  return value === null ? "Por confirmar" : `S/ ${value.toFixed(2)}`;
}
