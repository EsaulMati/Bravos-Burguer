"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { CartDrawer } from "../cart/CartDrawer";
import { CheckoutSection } from "./CheckoutSection";

export function CheckoutExperience() {
  const { cart, isHydrated, updateItem, removeItem, clearCart } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  // Funciones estables: el cajón vuelve a poner el foco en "Cerrar" cada vez que cambia onClose.
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => {
    if (isHydrated && cart.items.length === 0) router.replace("/");
  }, [cart.items.length, isHydrated, router]);

  if (!isHydrated || cart.items.length === 0) return null;

  return <>{cart.items.length > 0 && <CheckoutSection items={cart.items} onOpenCart={openCart} onRemoveItem={removeItem} onOrderConfirmed={clearCart} />}<CartDrawer items={cart.items} isOpen={isCartOpen} onOpen={openCart} onClose={closeCart} onUpdateItem={updateItem} onRemoveItem={removeItem} onContinue={closeCart} /></>;
}
