"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ADDONS_DATA, BURGERS_DATA } from "@/src/data/featured-products";
import {
  calculateCartItemSubtotal,
  calculateCartTotal,
  CART_QUANTITY_LIMIT,
  formatSauceSelection,
  isCatalogCartItem,
  getCartItemImage,
  getCartItemCount,
} from "@/src/lib/cart";
import type { CartItem } from "@/src/types/landing";

interface CartDrawerProps {
  items: CartItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onUpdateItem: (id: string, changes: Partial<CartItem>) => void;
  onRemoveItem: (id: string) => void;
  onContinue: () => void;
}

const DRAWER_EASE = [0.32, 0.72, 0, 1] as const;

export function CartDrawer({
  items,
  isOpen,
  onOpen,
  onClose,
  onUpdateItem,
  onRemoveItem,
  onContinue,
}: CartDrawerProps) {
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previousCount = useRef(0);
  const reduceMotion = useReducedMotion();
  const cartTotal = calculateCartTotal(items);
  const itemCount = getCartItemCount(items);

  // Saltito del contador cuando algo cae al carrito, justo donde el cliente va a tocar para pagar.
  useEffect(() => {
    if (itemCount > previousCount.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      badgeRef.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.35 }, { transform: "scale(1)" }],
        { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }
    previousCount.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const openButton = openButtonRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openButton?.focus();
    };
  }, [isOpen, onClose]);

  const goTo = (id: string) => {
    onClose();
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
  };

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={onOpen}
        aria-label={`Abrir carrito, ${itemCount} ${itemCount === 1 ? "producto" : "productos"}${itemCount > 0 && cartTotal !== null ? `, total ${formatMoney(cartTotal)}` : ""}`}
        className="cart-launcher tap fixed z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[#F3E9D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]"
      >
        <span className="relative grid size-9 place-items-center rounded-full bg-[#B35629] text-white">
          <CartIcon />
          <span ref={badgeRef} className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#F3E9D6] px-1 text-[.6875rem] font-bold tabular-nums text-[#16110E]">
            {itemCount}
          </span>
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-[.6875rem] font-medium uppercase tracking-[.12em] text-[#bca58c]">Tu pedido</span>
          <span className="mt-1 text-[.9375rem] font-semibold tabular-nums">{itemCount > 0 && cartTotal !== null ? formatMoney(cartTotal) : "Vacío"}</span>
        </span>
      </button>

      <AnimatePresence>
      {isOpen && (
        <motion.div key="cart-drawer" className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: .25, ease: DRAWER_EASE } }}
            transition={{ duration: .4, ease: DRAWER_EASE }}
            className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-[2px]"
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: "0%" }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: .2 } } : { x: "100%", transition: { duration: .25, ease: DRAWER_EASE } }}
            transition={{ duration: reduceMotion ? .2 : .4, ease: DRAWER_EASE }}
            className="cart-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-[#120d0a] shadow-[-24px_0_60px_rgba(0,0,0,.45)]"
          >
            <header className="flex items-center gap-3 border-b border-white/[.07] px-5 py-4">
              <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} sizes="44px" className="h-10 w-auto" />
              <div className="min-w-0 flex-1">
                <h2 id="cart-title" className="font-brush text-2xl leading-none text-[#F3E9D6]">Tu pedido</h2>
                <p className="mt-1 text-xs text-[#a39a8e]">
                  {itemCount === 0 ? "Todavía no agregas nada" : `${itemCount} ${itemCount === 1 ? "producto" : "productos"} · Delivery en Arequipa`}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="tap inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[.05] text-[#E2D8C6] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {items.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 text-center">
                  <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} sizes="120px" className="h-24 w-auto opacity-25 grayscale" />
                  <h3 className="mt-6 font-brush text-3xl leading-none text-[#F3E9D6]">La plancha está lista</h3>
                  <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[#A39A8E]">
                    Arma tu burger o elige un combo para la manchita y aparecerá aquí.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    <button type="button" onClick={() => goTo("armar-orden")} className="tap bravos-fill min-h-11 rounded-full bg-[#B35629] px-5 text-sm font-semibold text-white">Arma tu pedido</button>
                    <button type="button" onClick={() => goTo("combos")} className="tap bravos-fill min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold text-[#F3E9D6]">Para la manchita</button>
                  </div>
                </div>
              ) : (
                <ol className="space-y-3" aria-label="Productos en el carrito">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, transition: { duration: .2 } }}
                        transition={{ duration: .25, ease: [0.23, 1, 0.32, 1] }}
                        className="min-w-0 rounded-2xl border border-white/[.06] bg-[#1b130e] p-3"
                      >
                        <CartLine item={item} onUpdate={(changes) => onUpdateItem(item.id, changes)} onRemove={() => onRemoveItem(item.id)} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-white/[.07] bg-[#0f0b08] px-5 pb-5 pt-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#bca58c]"><dt>Subtotal</dt><dd className="tabular-nums text-[#E2D8C6]">{cartTotal !== null ? formatMoney(cartTotal) : "Por confirmar"}</dd></div>
                  <div className="flex justify-between text-[#bca58c]"><dt>Delivery</dt><dd className="text-[#E2D8C6]">Lo coordinamos por WhatsApp</dd></div>
                </dl>
                <div className="mt-3 flex items-end justify-between border-t border-dashed border-white/10 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-[.14em] text-[#a39a8e]">Total</span>
                  <output className="font-serif text-4xl leading-none tabular-nums text-white" aria-live="polite">
                    {cartTotal !== null ? formatMoney(cartTotal) : "Por confirmar"}
                  </output>
                </div>
                <button
                  type="button"
                  onClick={onContinue}
                  className="tap bravos-fill group mt-4 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-full bg-[#B35629] px-6 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0b08]"
                >
                  Completar pedido
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <p className="mt-2.5 text-center text-xs leading-relaxed text-[#8c8278]">Dejas tus datos, nos llega por WhatsApp y pagas con Yape o Plin.</p>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

interface CartLineProps {
  item: CartItem;
  onUpdate: (changes: Partial<CartItem>) => void;
  onRemove: () => void;
}

/* Una línea del carrito: foto, nombre, detalle en una línea y cantidad con precio abajo. */
function CartLine({ item, onUpdate, onRemove }: CartLineProps) {
  const thumbnail = getCartItemImage(item);
  const subtotal = calculateCartItemSubtotal(item);

  if (isCatalogCartItem(item)) {
    const details = [item.sauce && `Salsa: ${formatSauceSelection(item.sauce)}`, item.drink && `Gaseosa: ${item.drink}`].filter(Boolean).join(" · ");
    return (
      <LineLayout thumbnail={thumbnail} name={item.name} details={details} onRemove={onRemove}
        footer={<><MiniStepper label={item.name} value={item.quantity} onChange={(quantity) => onUpdate({ quantity })} /><Price value={subtotal} /></>} />
    );
  }

  const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
  const friesAddon = ADDONS_DATA.find((addon) => addon.id === "fries");
  const drinkAddon = ADDONS_DATA.find((addon) => addon.id === "drink");
  if (!burger) return null;
  const details = [
    item.friesEnabled ? `Con papas${item.sauce ? ` (${formatSauceSelection(item.sauce)})` : ""}` : "Sin papas",
    item.drinkEnabled ? `con ${item.drink ?? "gaseosa"}` : null,
  ].filter(Boolean).join(" · ");

  // Sin extras: cantidad y precio en una fila. Con papas o gaseosa: cada cosa con su nombre y su cantidad.
  const hasExtras = item.friesEnabled || item.drinkEnabled;
  return (
    <LineLayout
      thumbnail={thumbnail}
      name={burger.name}
      details={details}
      notes={item.notes}
      onRemove={onRemove}
      extras={hasExtras && (
        <div className="mt-2.5 space-y-1.5 border-t border-white/[.06] pt-2.5">
          <ExtraRow name={burger.name} value={item.burgerQuantity} onChange={(burgerQuantity) => onUpdate({ burgerQuantity })} />
          {item.friesEnabled && friesAddon && <ExtraRow name="Papas" value={item.friesQuantity} onChange={(friesQuantity) => onUpdate({ friesQuantity })} />}
          {item.drinkEnabled && drinkAddon && <ExtraRow name={item.drink ?? "Gaseosa"} value={item.drinkQuantity} onChange={(drinkQuantity) => onUpdate({ drinkQuantity })} />}
        </div>
      )}
      footer={hasExtras
        ? <><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#8c8278]">Subtotal</span><Price value={subtotal} /></>
        : <><MiniStepper label={burger.name} value={item.burgerQuantity} onChange={(burgerQuantity) => onUpdate({ burgerQuantity })} /><Price value={subtotal} /></>}
    />
  );
}

function LineLayout({ thumbnail, name, details, notes, extras, footer, onRemove }: { thumbnail: string | null; name: string; details: string; notes?: string; extras?: React.ReactNode; footer: React.ReactNode; onRemove: () => void }) {
  return (
    <>
      <div className="flex gap-3">
        {thumbnail
          ? <Image src={thumbnail} alt="" width={160} height={160} className="size-[4.5rem] shrink-0 rounded-xl bg-[#2a1d15] object-cover" />
          : <div aria-hidden="true" className="size-[4.5rem] shrink-0 rounded-xl bg-[#2a1d15]" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 font-serif text-xl leading-tight text-[#F3E9D6]">{name}</h3>
            <button type="button" onClick={onRemove} aria-label={`Quitar ${name} del carrito`}
              className="tap -mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#8c8278] hover:bg-red-500/10 hover:text-[#fca5a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
            </button>
          </div>
          {details && <p className="mt-1 text-[.8125rem] leading-snug text-[#bca58c]">{details}</p>}
          {notes?.trim() && <p className="mt-1 break-words text-[.8125rem] italic leading-snug text-[#8c8278]">“{notes.trim()}”</p>}
        </div>
      </div>
      {extras}
      <div className="mt-3 flex items-center justify-between gap-3">{footer}</div>
    </>
  );
}

function ExtraRow({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[.8125rem] text-[#E2D8C6]">
      <span>{name}</span>
      <MiniStepper small label={name} value={value} onChange={onChange} />
    </div>
  );
}

function MiniStepper({ label, value, onChange, small = false }: { label: string; value: number; onChange: (value: number) => void; small?: boolean }) {
  const size = small ? "size-8 text-base" : "size-9 text-lg";
  return (
    <div className="inline-flex items-center rounded-full bg-white/[.05] p-0.5">
      <button type="button" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))} aria-label={`Quitar uno de ${label}`}
        className={`tap inline-flex ${size} items-center justify-center rounded-full text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:text-[#5C524A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]`}>−</button>
      <output aria-label={`Cantidad de ${label}: ${value}`} className={`min-w-7 text-center font-semibold tabular-nums text-white ${small ? "text-sm" : "text-base"}`}>{value}</output>
      <button type="button" disabled={value >= CART_QUANTITY_LIMIT} onClick={() => onChange(Math.min(CART_QUANTITY_LIMIT, value + 1))} aria-label={`Agregar uno de ${label}`}
        className={`tap inline-flex ${size} items-center justify-center rounded-full text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:text-[#5C524A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]`}>+</button>
    </div>
  );
}

function Price({ value }: { value: number | null }) {
  return <output className="text-lg font-semibold tabular-nums text-[#F3E9D6]">{value !== null ? formatMoney(value) : "Por confirmar"}</output>;
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.6 9.1a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L20 7H6" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}

function formatMoney(value: number) {
  return `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;
}
