import type { CheckoutDraft, CheckoutErrors } from "@/src/types/landing";

export const CHECKOUT_STORAGE_KEY = "bravos-checkout-v1";

export const INITIAL_CHECKOUT_DRAFT: CheckoutDraft = {
  customerName: "",
  phone: "",
  paymentMethod: "",
};

export function normalizeCheckout(value: unknown): CheckoutDraft {
  if (!isRecord(value)) return INITIAL_CHECKOUT_DRAFT;

  const paymentMethod =
    value.paymentMethod === "yape" ||
    value.paymentMethod === "plin"
      ? value.paymentMethod
      : "";
  return {
    customerName: cleanText(value.customerName, 80),
    phone: normalizePeruvianPhone(value.phone),
    paymentMethod,
  };
}

export function serializeCheckout(draft: CheckoutDraft): CheckoutDraft {
  return normalizeCheckout(draft);
}

export function normalizePeruvianPhone(value: unknown): string {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("51")) {
    return digits.length >= 11 ? digits.slice(2, 11) : digits.slice(0, 11);
  }
  return digits.slice(0, 9);
}

export function validateCheckout(draft: CheckoutDraft): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = draft.customerName.trim();

  if (name.length < 2) errors.customerName = "Ingresa un nombre de al menos 2 caracteres.";
  else if (name.length > 80) errors.customerName = "El nombre no puede superar 80 caracteres.";

  if (!/^9\d{8}$/.test(normalizePeruvianPhone(draft.phone))) {
    errors.phone = "Ingresa un celular peruano válido de 9 dígitos que empiece en 9.";
  }

  if (!draft.paymentMethod) errors.paymentMethod = "Selecciona un método de pago.";

  return errors;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
