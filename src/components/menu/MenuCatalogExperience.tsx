"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CartDrawer } from "@/src/components/landing/cart/CartDrawer";
import { ADDITIONAL_PRODUCTS, MENU_SECTIONS } from "@/src/data/featured-products";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { createAdditionalCartItem, createCatalogCartItem } from "@/src/lib/cart";
import { QuantityControl } from "@/src/components/landing/order-builder/QuantityControl";
import { DrinkSelector, SauceSelector } from "@/src/components/landing/SelectionControls";
import type { DrinkSelection, SauceSelection } from "@/src/types/landing";
import { Toast, useToast } from "@/src/components/feedback/Toast";
import { addedToCartMessage } from "@/src/lib/cart-copy";

const money = (value: number) =>
  `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;

export function MenuCatalogExperience() {
  const router = useRouter();
  const { cart, addItem, updateItem, removeItem } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selections, setSelections] = useState<Record<string, { sauce: SauceSelection; drink: DrinkSelection }>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const feedbackTimer = useRef<number | null>(null);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const { toast, showToast } = useToast();

  const addProduct = (productId: string) => {
    const product = MENU_SECTIONS.flatMap((section) => section.items).find((candidate) => candidate.id === productId);
    const selection = selections[productId] ?? { sauce: null, drink: null };
    if (product?.includesFries && !selection.sauce) {
      setMessages((current) => ({ ...current, [productId]: "" }));
      showToast("Selecciona tu salsa", "error");
      return;
    }
    if (product?.includesDrink && !selection.drink) {
      setMessages((current) => ({ ...current, [productId]: "" }));
      showToast("Selecciona tu gaseosa", "error");
      return;
    }
    const item = createCatalogCartItem(productId, selection);
    if (!item) return;
    addItem({ ...item, quantity: quantities[productId] ?? 1 });
    setQuantities((current) => ({ ...current, [productId]: 1 }));
    setSelections((current) => ({ ...current, [productId]: { sauce: null, drink: null } }));
    setMessages((current) => ({ ...current, [productId]: "" }));
    setLastAddedId(productId);
    showToast(addedToCartMessage(item.name), "success");
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setLastAddedId(""), 1400);
  };

  const addAdditional = (productId: string) => {
    const item = createAdditionalCartItem(productId);
    if (!item) {
      showToast("Este adicional todavía no tiene precio", "error");
      return;
    }
    addItem({ ...item, quantity: quantities[productId] ?? 1 });
    setQuantities((current) => ({ ...current, [productId]: 1 }));
    setMessages((current) => ({ ...current, [productId]: "" }));
    setLastAddedId(productId);
    showToast(addedToCartMessage(item.name), "success");
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setLastAddedId(""), 1400);
  };

  const continueOrder = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <Toast toast={toast} />
      <div id="menu" className="menu-page-surface pb-12 sm:pb-14">
        <nav aria-label="Categorías del menú" className="menu-category-nav sticky top-[4.5rem] z-30 border-b border-[#16110E]/10 bg-[#F3E9D6] lg:top-20">
          <ul className="scrollbar-hidden mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
            {MENU_SECTIONS.map((section) => <li key={section.id} className="shrink-0"><a href={`#${section.id}`} className="tap inline-flex min-h-11 items-center rounded-full border border-[#16110E]/20 px-4 font-dosis text-[.95rem] font-semibold text-[#16110E] hover:bg-[#16110E] hover:text-[#F3E9D6]">{section.title}</a></li>)}
            <li className="shrink-0"><a href="#adicionales" className="tap inline-flex min-h-11 items-center rounded-full border border-[#16110E]/20 px-4 font-dosis text-[.95rem] font-semibold text-[#16110E] hover:bg-[#16110E] hover:text-[#F3E9D6]">Adicionales</a></li>
          </ul>
        </nav>
        <div className="mx-auto mt-10 max-w-6xl space-y-14 px-4 sm:mt-12 sm:space-y-16 sm:px-6">
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <section key={section.id} id={section.id} className="scroll-mt-36" aria-labelledby={`category-${sectionIndex}`}>
              <div className="flex items-center gap-4">
                <span className="h-0.5 w-10 bg-[#B35629]" aria-hidden="true" />
                <h2
                  id={`category-${sectionIndex}`}
                  className="font-serif text-4xl leading-none text-[#16110E] sm:text-6xl"
                >
                  {section.title}
                </h2>
              </div>

              <div className="mt-6 grid gap-y-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12">
                {section.items.map((item) => {
                  const wasAdded = lastAddedId === item.id;
                  const selection = selections[item.id] ?? { sauce: null, drink: null };
                  return (
                    <article
                      key={item.id}
                      id={item.id}
                      className={`group menu-catalog-card menu-catalog-card--${item.orientation} scroll-mt-36`}
                    >
                      <div className="relative overflow-hidden bg-[#1c120d]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 767px) 100vw, 44vw"
                          className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="px-1 pt-4 sm:px-2">
                        <div className="flex items-start justify-between gap-5">
                          <h3 className="font-serif text-2xl leading-none text-[#16110E] sm:text-3xl">
                            {item.name}
                          </h3>
                          <p className="shrink-0 font-serif text-3xl leading-none tabular-nums text-[#B35629]">
                            {money(item.price)}
                          </p>
                        </div>
                        {item.description && <p className="mt-2 text-base leading-relaxed text-[#6B5D52]">{item.description}</p>}
                        {item.includesFries && <div className="mt-4"><SauceSelector light value={selection.sauce} onChange={(sauce) => { setSelections((current) => ({ ...current, [item.id]: { ...selection, sauce } })); setMessages((current) => ({ ...current, [item.id]: "" })); }} /></div>}
                        {item.includesDrink && <div className="mt-4"><DrinkSelector light value={selection.drink} onChange={(drink) => { setSelections((current) => ({ ...current, [item.id]: { ...selection, drink } })); setMessages((current) => ({ ...current, [item.id]: "" })); }} /></div>}
                        <div className="mt-4 flex items-center gap-3">
                          <QuantityControl light label={`Cantidad de ${item.name}`} value={quantities[item.id] ?? 1} max={10} onChange={(quantity) => setQuantities((current) => ({ ...current, [item.id]: quantity }))} />
                          <button type="button" onClick={() => addProduct(item.id)} className="tap inline-flex min-h-12 flex-1 items-center justify-center bravos-fill rounded-full bg-[#B35629] px-5 font-sans text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3E9D6]">{wasAdded ? "Agregado ✓" : `Agregar · ${money(item.price * (quantities[item.id] ?? 1))}`}</button>
                        </div>
                        <p aria-live="polite" className="mt-2 min-h-5 text-sm font-semibold text-[#9e3f20]">{messages[item.id]}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          <section id="adicionales" aria-labelledby="additional-products-title" className="scroll-mt-36 rounded-3xl border border-[#8f5a39]/25 bg-[#16110E] px-3 py-8 shadow-[0_24px_60px_rgba(52,24,10,.18)] sm:px-7 sm:py-10">
            <div className="max-w-2xl">
              <h2 id="additional-products-title" className="font-serif text-4xl leading-none text-[#F3E9D6] sm:text-5xl">Agrégale algo más</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#cdb197]">Cada adicional se agrega como un producto independiente a tu carrito.</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
              {ADDITIONAL_PRODUCTS.map((item) => {
                const quantity = quantities[item.id] ?? 1;
                const hasPrice = item.price !== null;
                return <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-[#8f5a39]/20 bg-[#21140e] p-3 text-[#F3E9D6] shadow-[0_14px_30px_rgba(55,25,10,.14)] sm:p-4">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_45%,#4a2919,#160d09_72%)]">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 16vw" className="object-contain p-2.5 sm:p-3" />
                  </div>
                  <div className="flex flex-1 flex-col pt-3">
                    <h3 className="min-h-10 font-serif text-base font-bold leading-tight sm:text-lg">{item.name}</h3>
                    <p className="mt-1 font-dosis text-lg font-bold text-[#f0a35e]">{item.price !== null ? money(item.price * quantity) : "Precio pendiente"}</p>
                    <div className="mt-3"><QuantityControl label={`Cantidad de ${item.name}`} value={quantity} max={10} onChange={(next) => setQuantities((current) => ({ ...current, [item.id]: next }))} /></div>
                    <button type="button" disabled={!hasPrice} onClick={() => addAdditional(item.id)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#B35629] px-3 font-dosis text-sm font-bold text-white transition-colors hover:bg-[#9E4A22] disabled:cursor-not-allowed disabled:bg-[#4a3429] disabled:text-[#a98d7b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e59050]">{lastAddedId === item.id ? "Agregado ✓" : hasPrice ? "Agregar" : "Sin precio"}</button>
                    <p aria-live="polite" className="mt-2 min-h-5 text-xs text-[#e4b98e]">{messages[item.id]}</p>
                  </div>
                </article>;
              })}
            </div>
          </section>
        </div>
      </div>

      <CartDrawer
        items={cart.items}
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={closeCart}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onContinue={continueOrder}
      />
    </>
  );
}
