"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ADDONS_DATA, BURGERS_DATA } from "@/src/data/featured-products";
import {
  calculateCartItemSubtotal,
  calculateCartTotal,
  CART_QUANTITY_LIMIT,
  isCatalogCartItem,
  getCartItemImage,
} from "@/src/lib/cart";
import type { CartItem } from "@/src/types/landing";
import { QuantityControl } from "../order-builder/QuantityControl";

interface CartDrawerProps {
  items: CartItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onUpdateItem: (id: string, changes: Partial<CartItem>) => void;
  onRemoveItem: (id: string) => void;
  onContinue: () => void;
}

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
  const cartTotal = calculateCartTotal(items);

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
      const lastElement = focusableElements.at(-1);

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

  const returnToMenu = () => {
    onClose();
    window.requestAnimationFrame(() => {
      document.getElementById("menu")?.scrollIntoView({ block: "start" });
    });
  };

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={onOpen}
        aria-label={`Abrir carrito, ${items.length} ${items.length === 1 ? "orden" : "órdenes"}`}
        className="cart-launcher fixed bottom-4 right-3 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#21150f]/95 px-3.5 py-2 font-dosis font-bold text-white shadow-[0_12px_32px_rgba(0,0,0,.35)] backdrop-blur-md transition-colors hover:bg-[#342016] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7813d] sm:bottom-6 sm:right-6"
      >
        <CartIcon />
        <span>Carrito</span>
        <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#f97316] px-1.5 text-xs text-white">
          {items.length}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-black/70"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="cart-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-[#c78a53]/20 bg-[#130d09] shadow-2xl shadow-black sm:w-[min(92vw,24rem)]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <p className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
                  {items.length} {items.length === 1 ? "orden" : "órdenes"}
                </p>
                <h2 id="cart-title" className="font-serif text-2xl font-bold text-white">
                  Tu carrito Bravos
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-2xl text-[#d4d4d8] transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
              >
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
              {items.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 text-center">
                  <span className="mb-5 inline-flex size-16 items-center justify-center rounded-full border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316]">
                    <CartIcon />
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    El fuego está listo
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#a1a1aa]">
                    Arma una orden y agrégala aquí para conservarla mientras preparas las siguientes.
                  </p>
                  <button
                    type="button"
                    onClick={returnToMenu}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#f97316] px-6 font-dosis font-bold text-white hover:bg-[#ea580c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0e]"
                  >
                    Ver el menú
                  </button>
                </div>
              ) : (
                <ol className="space-y-4" aria-label="Órdenes en el carrito">
                  {items.map((item, index) => (
                    <CartLine
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={(changes) => onUpdateItem(item.id, changes)}
                      onRemove={() => onRemoveItem(item.id)}
                    />
                  ))}
                </ol>
              )}
            </div>

            <footer className="border-t border-white/10 bg-[#17100c] px-4 py-3 sm:px-5">
              <div className="mb-4 flex items-end justify-between gap-4">
                <span className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
                  Total del carrito
                </span>
                <output className="font-dosis text-3xl font-bold tabular-nums text-white" aria-live="polite">
                  {cartTotal !== null ? `S/ ${cartTotal.toFixed(2)}` : "Por confirmar"}
                </output>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={onContinue}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#f97316] px-6 font-dosis text-lg font-bold text-white hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:bg-[#27272a] disabled:text-[#71717a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101012]"
              >
                Continuar pedido
              </button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

interface CartLineProps {
  item: CartItem;
  index: number;
  onUpdate: (changes: Partial<CartItem>) => void;
  onRemove: () => void;
}

function CartLine({ item, index, onUpdate, onRemove }: CartLineProps) {
  const thumbnail = getCartItemImage(item);
  if (isCatalogCartItem(item)) {
    const subtotal = calculateCartItemSubtotal(item);
    return (
      <li className="min-w-0 rounded-xl bg-[#211711] p-3.5">
        <div className="flex items-start gap-3"><CartThumbnail src={thumbnail} alt={item.name} /><div className="min-w-0 flex-1">
          <div className="min-w-0">
            <p className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
              Producto {index + 1}
            </p>
            <h3 className="mt-0.5 font-serif text-lg font-bold text-white">{item.name}</h3>
          </div>
          </div><button
            type="button"
            onClick={onRemove}
            aria-label={`Eliminar ${item.name}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-3 font-dosis text-sm font-bold text-[#fca5a5] transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Eliminar
          </button>
        </div>
        <div className="mt-3">
          <CartQuantityRow
            name={item.name}
            quantity={item.quantity}
            onChange={(quantity) => onUpdate({ quantity })}
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-2.5">
          <span className="font-dosis text-xs font-bold uppercase tracking-wider text-[#71717a]">Subtotal</span>
          <output className="font-dosis text-xl font-bold tabular-nums text-white">
            {subtotal !== null ? `S/ ${subtotal.toFixed(2)}` : "Por confirmar"}
          </output>
        </div>
      </li>
    );
  }

  const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
  const friesAddon = ADDONS_DATA.find((addon) => addon.id === "fries");
  const drinkAddon = ADDONS_DATA.find((addon) => addon.id === "drink");
  const subtotal = calculateCartItemSubtotal(item);

  if (!burger) return null;

  return (
    <li className="min-w-0 rounded-xl bg-[#211711] p-3.5">
      <div className="flex items-start gap-3"><CartThumbnail src={thumbnail} alt={burger.name} /><div className="min-w-0 flex-1">
          <p className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
            Orden {index + 1}
          </p>
          <h3 className="mt-0.5 font-serif text-lg font-bold text-white">{burger.name}</h3>
        </div><button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar orden ${index + 1}: ${burger.name}`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-3 font-dosis text-sm font-bold text-[#fca5a5] transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          Eliminar
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <CartQuantityRow
          name={burger.name}
          quantity={item.burgerQuantity}
          onChange={(burgerQuantity) => onUpdate({ burgerQuantity })}
        />
        {item.friesEnabled && friesAddon && (
          <CartQuantityRow
            name={friesAddon.name}
            quantity={item.friesQuantity}
            onChange={(friesQuantity) => onUpdate({ friesQuantity })}
          />
        )}
        {item.drinkEnabled && drinkAddon && (
          <CartQuantityRow
            name={drinkAddon.name}
            quantity={item.drinkQuantity}
            onChange={(drinkQuantity) => onUpdate({ drinkQuantity })}
          />
        )}
      </div>

      {item.notes && (
        <div className="mt-3 rounded-lg bg-[#120d0a] px-3 py-2">
          <p className="font-dosis text-xs font-bold uppercase tracking-wider text-[#71717a]">
            Indicaciones
          </p>
          <p className="mt-1 break-words text-sm leading-relaxed text-[#d4d4d8]">{item.notes}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-2.5">
        <span className="font-dosis text-xs font-bold uppercase tracking-wider text-[#71717a]">
          Subtotal
        </span>
        <output className="font-dosis text-xl font-bold tabular-nums text-white">
          {subtotal !== null ? `S/ ${subtotal.toFixed(2)}` : "Por confirmar"}
        </output>
      </div>
    </li>
  );
}

function CartThumbnail({ src, alt }: { src: string | null; alt: string }) {
  return src ? <Image src={src} alt={alt} width={56} height={56} className="size-14 shrink-0 rounded-lg object-cover" /> : <div aria-hidden="true" className="size-14 shrink-0 rounded-lg bg-[#3a2418]" />;
}

function CartQuantityRow({
  name,
  quantity,
  onChange,
}: {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#120d0a] px-2.5 py-2">
      <span className="min-w-0 text-sm text-[#d4d4d8]">{name}</span>
      <div>
        <QuantityControl
          label={`${name} en el carrito`}
          value={quantity}
          max={CART_QUANTITY_LIMIT}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.6 9.1a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L20 7H6" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}
