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
import { CookingExperience } from "./CookingExperience";
import { Toast, useToast } from "@/src/components/feedback/Toast";
import type { SauceSelection } from "@/src/types/landing";
import { addedToCartMessage } from "@/src/lib/cart-copy";

export function CatalogExperience({ surface = "home" }: { surface?: "home" | "builder" }) {
  const [order, setOrder] = useState<OrderDraft>({
    burgerId: BURGERS_DATA[0]?.id ?? "brava-doble",
    burgerQuantity: 1,
    friesEnabled: false,
    friesQuantity: 1,
    drinkEnabled: false,
    drinkQuantity: 1,
    sauce: null,
    drink: null,
    notes: "",
  });
  const { cart, addItem, updateItem, removeItem } = usePersistentCart();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const [comboQuantities, setComboQuantities] = useState<Record<string, number>>({ "ya-pagaron-x3": 1, "ya-pagaron-x4": 1 });
  const { toast, showToast } = useToast();

  const updateOrder = (changes: Partial<OrderDraft>) => {
    setCartFeedback("");
    setOrder((currentOrder) => ({ ...currentOrder, ...changes }));
  };

  const addOrderToCart = () => {
    if (order.friesEnabled && !order.sauce) {
      showToast("Selecciona tu salsa", "error");
      return;
    }
    if (order.drinkEnabled && !order.drink) {
      showToast("Selecciona tu gaseosa", "error");
      return;
    }
    const cartItem = createCartItem(order);
    if (!cartItem) {
      showToast("Completa las opciones de tu pedido", "error");
      return;
    }

    addItem(cartItem);
    const addedBurger = BURGERS_DATA.find((item) => item.id === order.burgerId);
    const addedName = addedBurger?.name ?? "Pedido";
    showToast(addedToCartMessage(addedName), "success");
    setOrder((currentOrder) => ({
      ...currentOrder,
      burgerQuantity: 1,
      friesEnabled: false,
      friesQuantity: 1,
      drinkEnabled: false,
      drinkQuantity: 1,
      sauce: null,
      drink: null,
      notes: "",
    }));
  };

  const updateComboQuantity = (comboId: string, quantity: number) => {
    setComboQuantities((current) => ({ ...current, [comboId]: Math.min(10, Math.max(1, quantity)) }));
  };

  const addComboToCart = (comboId: string, sauce: SauceSelection) => {
    if (!sauce) { showToast("Selecciona tu salsa", "error"); return false; }
    const item = createCatalogCartItem(comboId, { sauce, drink: null });
    if (!item) return false;
    addItem({ ...item, quantity: comboQuantities[comboId] ?? 1 });
    setComboQuantities((current) => ({ ...current, [comboId]: 1 }));
    showToast("Combo añadido al carrito", "success");
    return true;
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
      <Toast toast={toast} />
      {surface === "home" ? <div className="flex flex-col"><div className="order-1"><FeaturedMenu /></div><div className="order-3 md:order-2"><ComboShowcase quantities={comboQuantities} onQuantityChange={updateComboQuantity} onAddCombo={addComboToCart} /></div><div className="order-2 md:order-3"><InteractiveOrderBuilder order={order} onUpdateOrder={updateOrder} onAddToCart={addOrderToCart} cartFeedback={cartFeedback} /></div><div className="order-4"><CookingExperience /></div></div> : <div className="relative overflow-hidden bg-[#130d09] px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-10"><div className="relative mx-auto max-w-7xl"><div className="mb-8 max-w-2xl"><p className="font-dosis text-xs font-bold uppercase tracking-[.3em] text-[#d99a5b]">Configurador Grill &amp; Smoke</p><h1 className="mt-3 font-serif text-5xl font-bold leading-none text-[#fff1d7] sm:text-7xl">Arma tu pedido</h1><p className="mt-4 max-w-md text-sm leading-relaxed text-[#ead6b7] sm:text-base">Elige. Míralo en la mesa. Agrégalo al carrito.</p></div><InteractiveOrderBuilder order={order} onUpdateOrder={updateOrder} onAddToCart={addOrderToCart} cartFeedback={cartFeedback} /></div></div>}
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
