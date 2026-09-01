import { ADDONS_DATA, BURGERS_DATA } from "@/src/data/featured-products";
import { calculateCartItemSubtotal, calculateCartTotal, isCatalogCartItem } from "@/src/lib/cart";
import { normalizePeruvianPhone } from "@/src/lib/checkout";
import type { Cart, CheckoutDraft, PaymentMethod } from "@/src/types/landing";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
};

export function buildOrderMessage(cart: Cart, checkout: CheckoutDraft): string {
  const friesAddon = ADDONS_DATA.find((addon) => addon.id === "fries");
  const drinkAddon = ADDONS_DATA.find((addon) => addon.id === "drink");
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

  cart.items.forEach((item, index) => {
    if (isCatalogCartItem(item)) {
      lines.push(
        "",
        `${index + 1}. ${item.quantity} × ${item.name}`,
        `   • Subtotal: ${formatCurrency(calculateCartItemSubtotal(item))}`
      );
      return;
    }

    const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
    if (!burger) return;
    const subtotal = calculateCartItemSubtotal(item);

    lines.push(
      "",
      `${index + 1}. ${item.burgerQuantity} × ${burger.name}`,
      item.friesEnabled && friesAddon
        ? `   • ${item.friesQuantity} × ${friesAddon.name}`
        : "   • Sin papas",
      item.drinkEnabled && drinkAddon
        ? `   • ${item.drinkQuantity} × ${drinkAddon.name}`
        : "   • Sin bebida"
    );
    if (item.notes.trim()) lines.push(`   • Indicaciones: ${item.notes.trim()}`);
    lines.push(`   • Subtotal: ${formatCurrency(subtotal)}`);
  });

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
