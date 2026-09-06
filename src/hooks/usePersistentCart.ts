"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CART_STORAGE_KEY, normalizeCart } from "@/src/lib/cart";
import type { Cart, CartItem } from "@/src/types/landing";

export function usePersistentCart() {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isHydrated, setIsHydrated] = useState(false);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const hydrationTimer = window.setTimeout(() => {
      const persisted = readPersistedCart();
      const hydratedCart = persisted.cart;
      updatedAtRef.current = persisted.updatedAt;

      if (!cancelled) {
        setCart(hydratedCart);
        setIsHydrated(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(hydrationTimer);
    };
  }, []);

  useEffect(() => {
    const syncAfterHistoryRestore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const persisted = readPersistedCart();
      updatedAtRef.current = persisted.updatedAt;
      setCart(persisted.cart);
    };
    window.addEventListener("pageshow", syncAfterHistoryRestore);
    return () => window.removeEventListener("pageshow", syncAfterHistoryRestore);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ ...cart, updatedAt: updatedAtRef.current }));
    } catch {
      // El carrito continúa en memoria si el almacenamiento no está disponible.
    }
  }, [cart, isHydrated]);

  const addItem = useCallback((item: CartItem) => {
    updatedAtRef.current = Date.now();
    setCart((currentCart) => ({ items: [...currentCart.items, item] }));
  }, []);

  const updateItem = useCallback((id: string, changes: Partial<CartItem>) => {
    updatedAtRef.current = Date.now();
    setCart((currentCart) =>
      normalizeCart({
        items: currentCart.items.map((item) =>
          item.id === id ? { ...item, ...changes, id: item.id } : item
        ),
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    updatedAtRef.current = Date.now();
    setCart((currentCart) => ({
      items: currentCart.items.filter((item) => item.id !== id),
    }));
  }, []);

  const clearCart = useCallback(() => {
    const updatedAt = Date.now();
    updatedAtRef.current = updatedAt;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [], updatedAt }));
    } catch { /* El estado en memoria también se vacía. */ }
    setCart({ items: [] });
  }, []);

  return { cart, isHydrated, addItem, updateItem, removeItem, clearCart };
}

const CART_EXPIRATION_MS = 2 * 60 * 60 * 1000;

function readPersistedCart(): { cart: Cart; updatedAt: number } {
  const now = Date.now();
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return { cart: { items: [] }, updatedAt: now };
    const parsed: unknown = JSON.parse(storedCart);
    const updatedAt = getStoredTimestamp(parsed);
    if (updatedAt !== null && now - updatedAt >= CART_EXPIRATION_MS) {
      return { cart: { items: [] }, updatedAt: now };
    }
    return { cart: normalizeCart(parsed), updatedAt: updatedAt ?? now };
  } catch {
    return { cart: { items: [] }, updatedAt: now };
  }
}

function getStoredTimestamp(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("updatedAt" in value)) return null;
  const timestamp = (value as { updatedAt?: unknown }).updatedAt;
  return typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0
    ? timestamp
    : null;
}
