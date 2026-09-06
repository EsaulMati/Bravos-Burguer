"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { CartDrawer } from "../cart/CartDrawer";
import { CheckoutSection } from "./CheckoutSection";

export function CheckoutExperience() {
  const { cart, isHydrated, updateItem, removeItem, clearCart } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && cart.items.length === 0) router.replace("/");
  }, [cart.items.length, isHydrated, router]);

  if (!isHydrated || cart.items.length === 0) return null;

  return <>{cart.items.length > 0 && <CheckoutSection items={cart.items} onOpenCart={() => setIsCartOpen(true)} onRemoveItem={removeItem} onOrderConfirmed={clearCart} />}<CartDrawer items={cart.items} isOpen={isCartOpen} onOpen={() => setIsCartOpen(true)} onClose={() => setIsCartOpen(false)} onUpdateItem={updateItem} onRemoveItem={removeItem} onContinue={() => setIsCartOpen(false)} /></>;
}
