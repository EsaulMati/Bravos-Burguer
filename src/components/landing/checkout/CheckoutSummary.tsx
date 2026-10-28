"use client";

import { useState } from "react";
import Image from "next/image";
import { BURGERS_DATA } from "@/src/data/featured-products";
import { calculateCartItemSubtotal, calculateCartTotal, formatSauceSelection, getCartItemCount, getCartItemImage, isCatalogCartItem } from "@/src/lib/cart";
import type { CartItem } from "@/src/types/landing";

interface CheckoutSummaryProps {
  items: CartItem[];
  onOpenCart: () => void;
  onRemoveItem: (item: CartItem) => void;
}

/* Resumen del pedido. En celular va arriba y cerrado (solo cantidad y total); en computadora queda fijo a la derecha. */
export function CheckoutSummary({ items, onOpenCart, onRemoveItem }: CheckoutSummaryProps) {
  const [open, setOpen] = useState(false);
  const cartTotal = calculateCartTotal(items);
  const count = getCartItemCount(items);

  return (
    <aside aria-labelledby="checkout-summary-title" className="min-w-0 rounded-[1.75rem] border border-white/[.07] bg-[#1b130e] lg:sticky lg:top-28">
      <div className="flex items-center gap-3 px-5 pb-1 pt-4 lg:px-6 lg:pt-5">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h2 id="checkout-summary-title" className="font-brush text-xl leading-none text-[#F3E9D6]">Tu pedido</h2>
          <span className="text-sm text-[#8c8278]">{count} {count === 1 ? "producto" : "productos"}</span>
        </div>
        <button type="button" onClick={onOpenCart} className="tap inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#E0793E] hover:bg-[#E0793E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          Editar
        </button>
      </div>

      <button type="button" aria-expanded={open} aria-controls="checkout-summary-list" onClick={() => setOpen((value) => !value)} className="tap flex min-h-11 w-full items-center gap-2 px-5 text-left text-sm text-[#bca58c] lg:hidden">
        {open ? "Ocultar detalle" : "Ver detalle"}
        <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      <ol id="checkout-summary-list" aria-label="Productos del pedido" className={`space-y-3 px-5 pt-1 lg:block lg:px-6 lg:pt-4 ${open ? "block" : "hidden"}`}>
        {items.map((item) => {
          const subtotal = calculateCartItemSubtotal(item);
          if (isCatalogCartItem(item)) {
            const details = [item.sauce && `Salsa: ${formatSauceSelection(item.sauce)}`, item.drink && item.drink].filter(Boolean).join(" · ");
            return <SummaryLine key={item.id} image={getCartItemImage(item)} title={`${item.quantity} × ${item.name}`} details={details} subtotal={subtotal} onRemove={() => onRemoveItem(item)} removeLabel={item.name} />;
          }
          const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
          if (!burger) return null;
          const details = [
            item.friesEnabled ? `${item.friesQuantity} papas${item.sauce ? ` (${formatSauceSelection(item.sauce)})` : ""}` : null,
            item.drinkEnabled ? `${item.drinkQuantity} ${item.drink ?? "gaseosa"}` : null,
          ].filter(Boolean).join(" · ");
          return <SummaryLine key={item.id} image={getCartItemImage(item)} title={`${item.burgerQuantity} × ${burger.name}`} details={details} notes={item.notes} subtotal={subtotal} onRemove={() => onRemoveItem(item)} removeLabel={burger.name} />;
        })}
      </ol>

      <dl className="mx-5 mt-2 space-y-1.5 border-t border-dashed border-white/10 py-4 text-sm lg:mx-6 lg:mt-4">
        <div className="flex justify-between text-[#8c8278]"><dt>Delivery</dt><dd className="text-[#bca58c]">Se coordina por WhatsApp</dd></div>
        <div className="flex items-end justify-between pt-1">
          <dt className="text-xs font-semibold uppercase tracking-[.14em] text-[#a39a8e]">Total</dt>
          <dd className="font-serif text-4xl leading-none tabular-nums text-white">{cartTotal !== null ? formatMoney(cartTotal) : "Por confirmar"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function SummaryLine({ image, title, details, notes, subtotal, onRemove, removeLabel }: { image: string | null; title: string; details: string; notes?: string; subtotal: number | null; onRemove: () => void; removeLabel: string }) {
  return (
    <li className="group flex items-start gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#2a1d15]">{image && <Image src={image} alt="" fill sizes="56px" className="object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[.9375rem] font-semibold leading-snug text-[#F3E9D6]">{title}</p>
        {details && <p className="mt-0.5 text-xs leading-snug text-[#8c8278]">{details}</p>}
        {notes?.trim() && <p className="mt-0.5 break-words text-xs italic leading-snug text-[#6f665d]">“{notes.trim()}”</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[.9375rem] font-semibold tabular-nums text-[#F3E9D6]">{subtotal !== null ? formatMoney(subtotal) : "—"}</span>
        <button type="button" onClick={onRemove} aria-label={`Eliminar ${removeLabel} del carrito`} title="Quitar" className="tap -mr-1.5 grid size-8 place-items-center rounded-full text-[#6f665d] hover:bg-red-500/10 hover:text-[#fca5a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></svg>
        </button>
      </div>
    </li>
  );
}

function formatMoney(value: number) {
  return `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;
}
