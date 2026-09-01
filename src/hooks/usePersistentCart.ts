"use client";

import { useCallback, useEffect, useState } from "react";
import { CART_STORAGE_KEY, normalizeCart } from "@/src/lib/cart";
import type { Cart, CartItem } from "@/src/types/landing";

export function usePersistentCart() {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrationTimer = window.setTimeout(() => {
      let hydratedCart: Cart = { items: [] };

      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        hydratedCart = storedCart ? normalizeCart(JSON.parse(storedCart)) : { items: [] };
      } catch {
        hydratedCart = { items: [] };
      }

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
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // El carrito continúa en memoria si el almacenamiento no está disponible.
    }
  }, [cart, isHydrated]);

  const addItem = useCallback((item: CartItem) => {
    setCart((currentCart) => ({ items: [...currentCart.items, item] }));
  }, []);

  const updateItem = useCallback((id: string, changes: Partial<CartItem>) => {
    setCart((currentCart) =>
      normalizeCart({
        items: currentCart.items.map((item) =>
          item.id === id ? { ...item, ...changes, id: item.id } : item
        ),
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((currentCart) => ({
      items: currentCart.items.filter((item) => item.id !== id),
    }));
  }, []);

  return { cart, addItem, updateItem, removeItem };
}
