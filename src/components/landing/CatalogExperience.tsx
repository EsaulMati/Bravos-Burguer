"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { CartDrawer } from "./cart/CartDrawer";
import { BrandStory } from "./BrandStory";
import { LeonSection } from "./LeonSection";
import { CookingExperience } from "./CookingExperience";

/* Portada: la marca y El León. Los pedidos se arman en /menu; aquí solo queda el carrito para seguir al checkout. */
export function CatalogExperience() {
  const { cart, updateItem, removeItem } = usePersistentCart();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const continueToCheckout = () => {
    if (cart.items.length === 0) return;
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <div className="flex flex-col"><BrandStory /><LeonSection /><div><CookingExperience /></div></div>
      <CartDrawer
        items={cart.items}
        isOpen={isCartOpen}
        onOpen={openCart}
        onClose={closeCart}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onContinue={continueToCheckout}
      />
    </>
  );
}
