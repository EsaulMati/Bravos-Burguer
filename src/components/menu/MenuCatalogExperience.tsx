"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CartDrawer } from "@/src/components/landing/cart/CartDrawer";
import { MENU_SECTIONS } from "@/src/data/featured-products";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { createCatalogCartItem } from "@/src/lib/cart";
import { QuantityControl } from "@/src/components/landing/order-builder/QuantityControl";

const money = (value: number) =>
  `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;

export function MenuCatalogExperience() {
  const router = useRouter();
  const { cart, addItem, updateItem, removeItem } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const feedbackTimer = useRef<number | null>(null);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addProduct = (productId: string) => {
    const item = createCatalogCartItem(productId);
    if (!item) return;
    addItem({ ...item, quantity: quantities[productId] ?? 1 });
    setLastAddedId(productId);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setLastAddedId(""), 1400);
  };

  const continueOrder = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <div id="menu" className="menu-page-surface px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-14 sm:space-y-16">
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <section key={section.title} aria-labelledby={`category-${sectionIndex}`}>
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#b76b32]" aria-hidden="true" />
                <h2
                  id={`category-${sectionIndex}`}
                  className="font-serif text-3xl font-bold text-[#382013] sm:text-4xl"
                >
                  {section.title}
                </h2>
              </div>

              <div className="mt-6 grid gap-y-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12">
                {section.items.map((item) => {
                  const wasAdded = lastAddedId === item.id;
                  return (
                    <article
                      key={item.id}
                      className={`group menu-catalog-card menu-catalog-card--${item.orientation}`}
                    >
                      <div className="relative overflow-hidden bg-[#1c120d]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 767px) 100vw, 44vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="px-1 pt-4 sm:px-2">
                        <div className="flex items-center justify-between gap-5">
                          <h3 className="font-serif text-xl font-bold leading-tight text-[#382013] sm:text-2xl">
                            {item.name}
                          </h3>
                          <p className="shrink-0 font-dosis text-2xl font-bold tabular-nums text-[#9e4d20]">
                            {money(item.price * (quantities[item.id] ?? 1))}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3"><QuantityControl label={`Cantidad de ${item.name}`} value={quantities[item.id] ?? 1} max={10} onChange={(quantity) => setQuantities((current) => ({ ...current, [item.id]: quantity }))} />
                        <button
                          type="button"
                          onClick={() => addProduct(item.id)}
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#a84c1d] px-5 font-dosis text-sm font-bold text-white transition-colors hover:bg-[#833816] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84c1d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ead9bd]"
                        >
                          {wasAdded ? "Añadido" : "Añadir"}
                        </button></div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
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
