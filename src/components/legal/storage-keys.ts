import { CART_STORAGE_KEY } from "@/src/lib/cart";
import { CHECKOUT_STORAGE_KEY } from "@/src/lib/checkout";

/** Marca que el visitante ya cerró el aviso de privacidad. */
export const PRIVACY_NOTICE_KEY = "bravos-aviso-privacidad-v1";

/** Todo lo que el sitio guarda en el navegador; la página de privacidad lo borra con un botón. */
export const STORED_DATA_KEYS = [CART_STORAGE_KEY, CHECKOUT_STORAGE_KEY];
