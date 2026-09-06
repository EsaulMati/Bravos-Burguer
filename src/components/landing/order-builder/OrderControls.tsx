"use client";

import { calculateOrderPrice } from "@/src/data/featured-products";
import type { ComboAddon, OrderDraft, ProductItem } from "@/src/types/landing";
import { QuantityControl } from "./QuantityControl";
import { DrinkSelector, SauceSelector } from "../SelectionControls";

const MAX = 10;
interface Props { burgers: ProductItem[]; addons: ComboAddon[]; order: OrderDraft; onUpdateOrder: (changes: Partial<OrderDraft>) => void; onAddToCart: () => void; cartFeedback: string }

export function OrderControls({ burgers, addons, order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
  const burger = burgers.find((item) => item.id === order.burgerId) ?? burgers[0];
  const fries = addons.find((item) => item.id === "fries");
  const drink = addons.find((item) => item.id === "drink");
  const total = calculateOrderPrice(order);
  return (
    <div className="builder-panel min-w-0 rounded-2xl bg-[#1b120d]/92 p-4 text-[#fff4df] shadow-[0_26px_70px_rgba(0,0,0,.32)] backdrop-blur-md sm:p-5">
      <ChoiceSet legend="Carne" items={burgers.map((item) => ({ id: item.id, label: item.name, price: item.price, active: item.id === order.burgerId }))} onChoose={(id) => onUpdateOrder({ burgerId: id })} />
      <ChoiceSet legend="Acompaña" items={[{ id: "no", label: "Sin papas", price: null, active: !order.friesEnabled }, { id: "yes", label: "Con papas", price: fries?.price ?? null, active: order.friesEnabled }]} onChoose={(id) => onUpdateOrder({ friesEnabled: id === "yes", friesQuantity: 1, sauce: null })} additive />
      {order.friesEnabled && <div className="border-b border-white/10 py-3"><SauceSelector value={order.sauce} onChange={(sauce) => onUpdateOrder({ sauce })} /></div>}
      <ChoiceSet legend="Bebida" items={[{ id: "no", label: "Sin gaseosa", price: null, active: !order.drinkEnabled }, { id: "yes", label: "Gaseosa", price: drink?.price ?? null, active: order.drinkEnabled }]} onChoose={(id) => onUpdateOrder({ drinkEnabled: id === "yes", drinkQuantity: 1, drink: null })} additive />
      {order.drinkEnabled && <div className="border-b border-white/10 py-3"><DrinkSelector value={order.drink} onChange={(drink) => onUpdateOrder({ drink })} /></div>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <CompactQuantity label="Burgers" value={order.burgerQuantity} onChange={(burgerQuantity) => onUpdateOrder({ burgerQuantity })} />
        {order.friesEnabled && <CompactQuantity label="Papas" value={order.friesQuantity} onChange={(friesQuantity) => onUpdateOrder({ friesQuantity })} />}
        {order.drinkEnabled && <CompactQuantity label="Gaseosas" value={order.drinkQuantity} onChange={(drinkQuantity) => onUpdateOrder({ drinkQuantity })} />}
      </div>
      <details className="mt-3"><summary className="min-h-11 cursor-pointer py-3 font-dosis text-xs font-bold uppercase tracking-[.12em] text-[#bca58c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d17835]">Indicaciones opcionales</summary><textarea id="order-notes" value={order.notes} maxLength={200} rows={2} onChange={(event) => onUpdateOrder({ notes: event.target.value })} placeholder="Sin cebolla, salsa aparte…" className="min-h-16 w-full resize-y rounded-xl bg-[#0f0b08]/75 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-[#806f60] focus:ring-2 focus:ring-[#d17835]" /></details>
      <div className="mt-3 flex items-end justify-between gap-4 border-t border-[#d6a66f]/20 pt-3"><div><p className="font-dosis text-xs font-bold uppercase tracking-[.14em] text-[#b89e82]">Total</p><output aria-live="polite" className="font-dosis text-4xl font-bold tabular-nums text-[#fff7e8]">{total === null ? "Por confirmar" : `S/ ${total.toFixed(0)}`}</output></div><span className="max-w-36 text-right text-xs text-[#aa927b]">{burger.name}</span></div>
      <button type="button" onClick={onAddToCart} className="mt-3 min-h-12 w-full rounded-full bg-[#c96325] px-6 font-dosis text-lg font-bold text-white transition-colors hover:bg-[#e07731] active:bg-[#a84c18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b120d]">Agregar al carrito</button>
      <div aria-live="polite" className="min-h-5 pt-1.5 text-center text-xs text-[#b8d9b4]">{cartFeedback}</div>
    </div>
  );
}

function ChoiceSet({ legend, items, onChoose }: { legend: string; items: { id: string; label: string; price: number | null; active: boolean }[]; onChoose: (id: string) => void; additive?: boolean }) {
  return <fieldset className="border-b border-white/10 py-2.5 first:pt-0"><legend className="mb-1.5 font-dosis text-xs font-bold uppercase tracking-[.16em] text-[#c7ab88]">{legend}</legend><div className="grid grid-cols-2 gap-2">{items.map((item) => <button key={item.id} type="button" aria-pressed={item.active} onClick={() => onChoose(item.id)} className={`relative min-h-11 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1924d] ${item.active ? "bg-[#f3dfbf] text-[#2c190e]" : "bg-white/[.055] text-[#e7d6c0] hover:bg-white/10"}`}><span>{item.label}</span>{item.active && <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute right-2.5 top-2.5 size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8" /></svg>}</button>)}</div></fieldset>;
}

function CompactQuantity({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><span className="mb-1 block text-[11px] text-[#b9a28c]">{label}</span><QuantityControl label={label} value={value} max={MAX} onChange={onChange} /></div>;
}
