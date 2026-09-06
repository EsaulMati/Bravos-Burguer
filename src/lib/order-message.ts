import { BURGERS_DATA } from "@/src/data/featured-products";
import { calculateCartItemSubtotal, calculateCartTotal, formatSauceSelection, isAdditionalCartItem, isCatalogCartItem } from "@/src/lib/cart";
import { normalizePeruvianPhone } from "@/src/lib/checkout";
import type { Cart, CheckoutDraft, PaymentMethod } from "@/src/types/landing";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
};

export function buildOrderMessage(cart: Cart, checkout: CheckoutDraft): string {
  const cartSubtotal = calculateCartTotal(cart.items);
  const lines: string[] = [
    "🔥 BRAVOS BURGER",
    "Nuevo pedido",
    "",
    "Cliente",
    `Nombre: ${checkout.customerName.trim()}`,
    `Celular: ${normalizePeruvianPhone(checkout.phone)}`,
    "",
    "Pedido",
  ];

  cart.items.filter((item) => !isAdditionalCartItem(item)).forEach((item, index) => {
    if (isCatalogCartItem(item)) {
      lines.push("", `${index + 1}. ${item.quantity} × ${item.name}`);
      if (item.sauce) lines.push(`   • Salsas: ${formatSauceSelection(item.sauce)}`);
      if (item.drink) lines.push(`   • Gaseosa: ${item.drink}`);
      lines.push(`   • Subtotal: ${formatCurrency(calculateCartItemSubtotal(item))}`);
      return;
    }

    const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
    if (!burger) return;
    const subtotal = calculateCartItemSubtotal(item);

    lines.push("", `${index + 1}. ${item.burgerQuantity} × ${burger.name}`);
    lines.push(item.friesEnabled ? `   • Papas: Sí (${item.friesQuantity})` : "   • Papas: No");
    if (item.friesEnabled && item.sauce) lines.push(`   • Salsas: ${formatSauceSelection(item.sauce)}`);
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

  lines.push("", `Total: ${formatCurrency(cartSubtotal)}`);

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
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function paymentLabel(method: CheckoutDraft["paymentMethod"]): string {
  return method ? PAYMENT_LABELS[method] : "Por definir";
}

function formatCurrency(value: number | null): string {
  return value === null ? "Por confirmar" : `S/ ${value.toFixed(2)}`;
}
