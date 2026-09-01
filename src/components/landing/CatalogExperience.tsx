"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BURGERS_DATA } from "@/src/data/featured-products";
import { createCartItem, createCatalogCartItem } from "@/src/lib/cart";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import type { OrderDraft } from "@/src/types/landing";
import { CartDrawer } from "./cart/CartDrawer";
import { FeaturedMenu } from "./FeaturedMenu";
import { ComboShowcase } from "./ComboShowcase";
import { InteractiveOrderBuilder } from "./order-builder/InteractiveOrderBuilder";

export function CatalogExperience({ surface = "home" }: { surface?: "home" | "builder" }) {
  const [order, setOrder] = useState<OrderDraft>({
    burgerId: BURGERS_DATA[0]?.id ?? "brava-doble",
    burgerQuantity: 1,
    friesEnabled: true,
    friesQuantity: 1,
    drinkEnabled: true,
    drinkQuantity: 1,
    notes: "",
  });
  const { cart, addItem, updateItem, removeItem } = usePersistentCart();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const [comboQuantities, setComboQuantities] = useState<Record<string, number>>({ "ya-pagaron-x3": 1, "ya-pagaron-x4": 1 });
  const [comboFeedback, setComboFeedback] = useState<Record<string, string>>({});

  const updateOrder = (changes: Partial<OrderDraft>) => {
    setCartFeedback("");
    setOrder((currentOrder) => ({ ...currentOrder, ...changes }));
  };

  const addOrderToCart = () => {
    const cartItem = createCartItem(order);
    if (!cartItem) {
      setCartFeedback("No pudimos agregar esta orden. Revisa la selección e inténtalo nuevamente.");
      return;
    }

    addItem(cartItem);
    setCartFeedback("Orden agregada al carrito. Puedes armar otra o revisar tus órdenes.");
    setOrder((currentOrder) => ({
      ...currentOrder,
      burgerQuantity: 1,
      friesEnabled: true,
      friesQuantity: 1,
      drinkEnabled: true,
      drinkQuantity: 1,
      notes: "",
    }));
  };

  const updateComboQuantity = (comboId: string, quantity: number) => {
    setComboQuantities((current) => ({ ...current, [comboId]: Math.min(10, Math.max(1, quantity)) }));
  };

  const addComboToCart = (comboId: string) => {
    const item = createCatalogCartItem(comboId);
    if (!item) return;
    addItem({ ...item, quantity: comboQuantities[comboId] ?? 1 });
    setComboFeedback((current) => ({ ...current, [comboId]: "Combo agregado al carrito." }));
    window.setTimeout(() => setComboFeedback((current) => ({ ...current, [comboId]: "" })), 1800);
  };

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const continueToCheckout = () => {
    if (cart.items.length === 0) return;
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {surface === "home" ? <><FeaturedMenu /><ComboShowcase quantities={comboQuantities} onQuantityChange={updateComboQuantity} onAddCombo={addComboToCart} feedback={comboFeedback} /><InteractiveOrderBuilder order={order} onUpdateOrder={updateOrder} onAddToCart={addOrderToCart} cartFeedback={cartFeedback} /></> : <div className="relative overflow-hidden bg-[#130d09] px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-10"><div className="relative mx-auto max-w-7xl"><div className="mb-8 max-w-2xl"><p className="font-dosis text-xs font-bold uppercase tracking-[.3em] text-[#d99a5b]">Configurador Grill &amp; Smoke</p><h1 className="mt-3 font-serif text-5xl font-bold leading-none text-[#fff1d7] sm:text-7xl">Arma tu pedido</h1><p className="mt-4 max-w-md text-sm leading-relaxed text-[#ead6b7] sm:text-base">Elige. Míralo en la mesa. Agrégalo al carrito.</p></div><InteractiveOrderBuilder order={order} onUpdateOrder={updateOrder} onAddToCart={addOrderToCart} cartFeedback={cartFeedback} /></div></div>}
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
