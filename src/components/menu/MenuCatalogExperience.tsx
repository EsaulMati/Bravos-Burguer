"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CartDrawer } from "@/src/components/landing/cart/CartDrawer";
import { ADDITIONAL_PRODUCTS, ADDONS_DATA, BURGERS_DATA, PROMOS } from "@/src/data/featured-products";
import { usePersistentCart } from "@/src/hooks/usePersistentCart";
import { createAdditionalCartItem, createCartItem, createPromoCartItem } from "@/src/lib/cart";
import { QuantityControl } from "@/src/components/landing/order-builder/QuantityControl";
import { BurgerSheet, type SheetProduct, type SheetSelection } from "./BurgerSheet";
import { Toast, useToast } from "@/src/components/feedback/Toast";
import { addedToCartMessage } from "@/src/lib/cart-copy";

const friesPrice = ADDONS_DATA.find((addon) => addon.id === "fries")?.price ?? 0;
const drinkPrice = ADDONS_DATA.find((addon) => addon.id === "drink")?.price ?? 0;

const money = (value: number) =>
  `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;

/* Todo lo que abre el panel: las burgers (con gaseosa y papas extra) y los combos (solo salsa). */
const SHEET_PRODUCTS: SheetProduct[] = [
  ...BURGERS_DATA.map((burger) => ({ id: burger.id, name: burger.name, price: burger.price ?? 0, description: burger.description, image: burger.menuImage ?? burger.image, imageAlt: `${burger.name} con papas`, withExtras: true })),
  ...PROMOS.map((promo) => ({ id: promo.id, name: promo.name, price: promo.price, regularPrice: promo.regularPrice, label: promo.label, subtitle: promo.subtitle, drinkCount: promo.drinkCount, description: promo.description, image: promo.image, imageAlt: `Combo ${promo.name}: ${promo.includes}`, withExtras: false })),
];

export function MenuCatalogExperience() {
  const router = useRouter();
  const { cart, addItem, updateItem, removeItem } = usePersistentCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const closeSheet = useCallback(() => setOpenProductId(null), []);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const feedbackTimer = useRef<number | null>(null);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const { toast, showToast } = useToast();

  // El panel arma la selección (salsa, gaseosa, papas extra, indicaciones) y aquí entra al carrito como burger o como combo.
  const addFromSheet = (product: SheetProduct, selection: SheetSelection) => {
    const item = product.withExtras
      ? createCartItem({ burgerId: product.id, burgerQuantity: selection.quantity, friesEnabled: selection.extraFries, friesQuantity: selection.quantity, drinkEnabled: selection.drink !== null, drinkQuantity: selection.quantity, sauce: selection.sauce, drink: selection.drink, notes: selection.notes })
      : createPromoCartItem(product.id, selection.sauce, selection.quantity, selection.notes, selection.drinkCounts);
    if (!item) { showToast("Completa las opciones para continuar", "error"); return false; }
    addItem(item);
    setLastAddedId(product.id);
    showToast(product.withExtras ? addedToCartMessage(product.name) : `Combo ${product.name} añadido al carrito`, "success");
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setLastAddedId(""), 1400);
    return true;
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
        <MenuCategoryNav />
        <div className="menu-burgers relative overflow-hidden bg-[#16110E]">
          <MenuBackdropVideo />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,9,6,.78),rgba(15,9,6,.45)_40%,rgba(15,9,6,.82))]" />
          <section id="hamburguesas" aria-labelledby="burgers-title" className="relative mx-auto max-w-6xl scroll-mt-32 px-4 pt-12 sm:px-6 sm:pt-16">
            <div className="flex items-center gap-4">
              <span className="h-0.5 w-10 bg-[#E0793E]" aria-hidden="true" />
              <h2 id="burgers-title" className="font-serif text-4xl leading-none text-[#F3E9D6] sm:text-6xl">Hamburguesas</h2>
            </div>
            <p className="mt-3 text-base text-[#e6d6bf]">Todas vienen con papas. Súmale gaseosa (+{money(drinkPrice)}) o papas extra (+{money(friesPrice)}).</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
              {BURGERS_DATA.map((burger) => (
                <article key={burger.id} id={burger.id} className="group menu-catalog-card menu-catalog-card--landscape relative scroll-mt-32 rounded-[1.6rem] bg-[#F3E9D6] p-3 pb-5 shadow-[0_30px_60px_rgba(0,0,0,.35)] transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-1 sm:p-4 sm:pb-6">
                  <div className="relative overflow-hidden bg-[#1c120d]">
                    <Image src={burger.menuImage ?? burger.image} alt={`${burger.name} con papas`} fill sizes="(max-width: 767px) 100vw, 44vw" className="object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
                  </div>
                  <div className="px-1 pt-4 sm:px-2">
                    <div className="flex items-start justify-between gap-5">
                      <h3 className="font-serif text-2xl leading-none text-[#16110E] sm:text-3xl">{burger.name}</h3>
                      <p className="shrink-0 font-serif text-3xl leading-none tabular-nums text-[#B35629]">{money(burger.price ?? 0)}</p>
                    </div>
                    {burger.tagline && <p className="mt-2 font-brush text-2xl leading-none text-[#B35629]">{burger.tagline}</p>}
                    <p className="mt-2 text-base leading-relaxed text-[#6B5D52]">{burger.description}</p>
                    {/* Toda la tarjeta abre el panel: el botón se estira sobre ella con ::after. */}
                    <button type="button" onClick={() => setOpenProductId(burger.id)} aria-haspopup="dialog"
                      className="tap mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#B35629] px-5 font-sans text-base font-semibold text-white after:absolute after:inset-0 after:rounded-[1.6rem] after:content-[''] hover:bg-[#9E4A22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3E9D6]">
                      {lastAddedId === burger.id ? "Agregado ✓" : "Agregar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="combos" aria-labelledby="combos-title" className="relative mx-auto max-w-6xl scroll-mt-32 px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
            <div className="flex items-center gap-4">
              <span className="h-0.5 w-10 bg-[#E0793E]" aria-hidden="true" />
              <h2 id="combos-title" className="font-serif text-4xl leading-none text-[#F3E9D6] sm:text-6xl">Combos</h2>
            </div>
            <p className="mt-3 text-base text-[#e6d6bf]">Para la manchita, a precio cerrado.</p>
            <div className="mt-8 grid gap-6">
              {PROMOS.map((promo) => (
                <article key={promo.id} id={promo.id} className="group relative grid scroll-mt-32 overflow-hidden rounded-[1.6rem] bg-[#F3E9D6] shadow-[0_30px_60px_rgba(0,0,0,.35)] transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-1 md:grid-cols-[1.15fr_1fr]">
                  <div className="relative aspect-[16/10] bg-[#2a1a11] md:aspect-auto md:min-h-[20rem]">
                    <Image src={promo.image} alt={`Combo ${promo.name}: ${promo.includes}`} fill sizes="(max-width: 767px) 100vw, 600px" className="object-contain p-4 transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex flex-col justify-center p-5 sm:p-7">
                    <p className="font-dosis text-xs font-bold uppercase tracking-[.14em] text-[#B35629]">{promo.label}</p>
                    <div className="mt-1 flex items-start justify-between gap-5">
                      <div>
                        <h3 className="font-serif text-3xl leading-none text-[#16110E] sm:text-4xl">{promo.name}</h3>
                        {promo.subtitle && <p className="mt-1.5 font-brush text-2xl leading-none text-[#B35629]">{promo.subtitle}</p>}
                      </div>
                      <p className="shrink-0 text-right font-serif text-3xl leading-none tabular-nums text-[#B35629] sm:text-4xl">
                        <span className="mb-1 block font-sans text-sm text-[#8c7b6b] line-through">{money(promo.regularPrice)}</span>
                        {money(promo.price)}
                      </p>
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-[#6B5D52]">{promo.description}</p>
                    <button type="button" onClick={() => setOpenProductId(promo.id)} aria-haspopup="dialog"
                      className="tap mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#B35629] px-5 font-sans text-base font-semibold text-white after:absolute after:inset-0 after:rounded-[1.6rem] after:content-[''] hover:bg-[#9E4A22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3E9D6]">
                      {lastAddedId === promo.id ? "Agregado ✓" : "Agregar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-4 sm:mt-14 sm:px-6">
          <section id="adicionales" aria-labelledby="additional-products-title" className="scroll-mt-32 rounded-3xl border border-[#8f5a39]/25 bg-[#16110E] px-3 py-8 shadow-[0_24px_60px_rgba(52,24,10,.18)] sm:px-7 sm:py-10">
            <div className="max-w-2xl">
              <h2 id="additional-products-title" className="font-serif text-4xl leading-none text-[#F3E9D6] sm:text-5xl">Agrégale algo más</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#cdb197]">Cada adicional se agrega como un producto independiente a tu carrito.</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
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

      <BurgerSheet product={SHEET_PRODUCTS.find((product) => product.id === openProductId) ?? null} onClose={closeSheet} onAdd={addFromSheet} />
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

const CATEGORY_LINKS = [
  { id: "hamburguesas", label: "Hamburguesas", count: BURGERS_DATA.length },
  { id: "combos", label: "Combos", count: PROMOS.length },
  { id: "adicionales", label: "Adicionales", count: ADDITIONAL_PRODUCTS.length },
];

/* Pestañas fijas bajo la cabecera: la de la sección que se está viendo queda marcada mientras bajas. */
function MenuCategoryNav() {
  const [active, setActive] = useState(CATEGORY_LINKS[0].id);

  useEffect(() => {
    if (typeof window.IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-40% 0px -55% 0px" });
    CATEGORY_LINKS.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Categorías del menú" className="menu-category-nav sticky top-[4.5rem] z-30 border-b border-[#16110E]/10 bg-[#F3E9D6] lg:top-20">
      <div className="mx-auto flex max-w-6xl px-4 py-2.5 sm:px-6">
        <ul className="grid w-full grid-cols-3 gap-1 rounded-full bg-[#16110E]/[.07] p-1 sm:inline-grid sm:w-auto">
          {CATEGORY_LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <a href={`#${link.id}`} aria-current={isActive ? "true" : undefined} onClick={() => setActive(link.id)}
                  className={`tap flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-dosis text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629] ${isActive ? "bg-[#16110E] text-[#F3E9D6]" : "text-[#3b2417] hover:bg-[#16110E]/[.08]"}`}>
                  {link.label}
                  <span className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums ${isActive ? "bg-[#E0793E] text-[#16110E]" : "bg-[#16110E]/10 text-[#3b2417]"}`}>{link.count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* El video de la cocina va detrás de las burgers; se descarga recién cuando la sección se acerca a la pantalla. */
function MenuBackdropVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const pick = () => setSrc(window.matchMedia("(max-width: 767px)").matches ? "/bravos-menu-fondo-cel.mp4" : "/bravos-menu-fondo.mp4");
    if (typeof window.IntersectionObserver !== "function") { pick(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      pick();
      observer.disconnect();
    }, { rootMargin: "400px 0px" });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return <video ref={videoRef} src={src ?? undefined} autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="builder-video pointer-events-none absolute inset-0 h-full w-full object-cover" />;
}
