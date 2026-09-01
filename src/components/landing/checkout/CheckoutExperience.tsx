"use client";

import { useState } from "react";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { CartDrawer } from "../cart/CartDrawer";
import { CheckoutSection } from "./CheckoutSection";

export function CheckoutExperience() {
  const { cart, updateItem, removeItem } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  return <><CheckoutSection items={cart.items} onOpenCart={() => setIsCartOpen(true)} /><CartDrawer items={cart.items} isOpen={isCartOpen} onOpen={() => setIsCartOpen(true)} onClose={() => setIsCartOpen(false)} onUpdateItem={updateItem} onRemoveItem={removeItem} onContinue={() => setIsCartOpen(false)} /></>;
}
