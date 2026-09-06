"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ADDONS_DATA, BURGERS_DATA, calculateOrderPrice } from "@/src/data/featured-products";
import type { OrderDraft } from "@/src/types/landing";
import { DrinkSelector, SauceSelector } from "../SelectionControls";

interface Props { order: OrderDraft; onUpdateOrder: (changes: Partial<OrderDraft>) => void; onAddToCart: () => void; cartFeedback: string }

export function MobileOrderBuilder({ order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; pointerId: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const burgerIndex = Math.max(0, BURGERS_DATA.findIndex((item) => item.id === order.burgerId));
  const burger = BURGERS_DATA[burgerIndex] ?? BURGERS_DATA[0];
  const fries = ADDONS_DATA.find((item) => item.id === "fries");
  const drink = ADDONS_DATA.find((item) => item.id === "drink");
  const total = calculateOrderPrice(order);

  const selectBurger = (direction: -1 | 1) => {
    const next = (burgerIndex + direction + BURGERS_DATA.length) % BURGERS_DATA.length;
    onUpdateOrder({ burgerId: BURGERS_DATA[next].id });
  };
  const finishSwipe = (clientX: number) => {
    if (touchStart.current === null) return;
    const distance = clientX - touchStart.current.x;
    touchStart.current = null;
    if (Math.abs(distance) >= 42) selectBurger(distance < 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} id="armar-orden" aria-labelledby="mobile-builder-title" className="mobile-builder relative min-h-[100svh] scroll-mt-24 overflow-hidden bg-[#130d09]">
      <video src="/bravos-mobile-arma-tu-pedido.mp4.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,5,.58)_0%,rgba(12,8,5,.05)_25%,rgba(12,8,5,.04)_62%,rgba(12,8,5,.84)_100%)]" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 pb-4 pt-[clamp(3.75rem,8dvh,5rem)]">
        <div className="text-center"><p className="font-dosis text-[.65rem] font-bold uppercase tracking-[.3em] text-[#e2a264]">A tu manera</p><h2 id="mobile-builder-title" className="mt-1 font-serif text-[clamp(2rem,9vw,2.5rem)] font-bold leading-none text-[#fff1d7]">Arma tu pedido</h2></div>
        <div className="mobile-builder-product-stage relative mt-1 h-[clamp(14.5rem,35dvh,20rem)] shrink-0 select-none touch-pan-y" onPointerDown={(event) => { touchStart.current = { x: event.clientX, pointerId: event.pointerId }; try { event.currentTarget.setPointerCapture(event.pointerId); } catch {} }} onPointerUp={(event) => { finishSwipe(event.clientX); try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch {} }} onPointerCancel={(event) => { touchStart.current = null; try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch {} }}>
          <button type="button" onClick={() => selectBurger(-1)} aria-label="Ver hamburguesa anterior" className="absolute left-0 top-[53%] z-40 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#160e09]/60 text-2xl text-white backdrop-blur-sm">‹</button>
          <button type="button" onClick={() => selectBurger(1)} aria-label="Ver hamburguesa siguiente" className="absolute right-0 top-[53%] z-40 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#160e09]/60 text-2xl text-white backdrop-blur-sm">›</button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={burger.id} initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }} transition={{ duration: .2 }} className="absolute left-[4%] right-[4%] top-[3%] z-20 h-[86%]">
              <Image src={burger.cutoutImage ?? burger.image} alt={burger.name} fill sizes="70vw" className="object-contain drop-shadow-[0_22px_18px_rgba(20,7,2,.58)]" />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {order.friesEnabled && fries?.cutoutImage && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="absolute bottom-[10%] left-[3%] z-30 h-[60%] w-[60%]"><Image src={fries.cutoutImage} alt="Papas" fill sizes="60vw" className="object-contain drop-shadow-[0_18px_13px_rgba(20,7,2,.5)]" /></motion.div>}
            {order.drinkEnabled && drink?.cutoutImage && <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="absolute bottom-[11%] right-[2%] z-10 h-[74%] w-[57%]"><Image src={drink.cutoutImage} alt="Gaseosa" fill sizes="57vw" className="object-contain drop-shadow-[0_18px_13px_rgba(20,7,2,.5)]" /></motion.div>}
          </AnimatePresence>
        </div>
        <div className="mt-0 rounded-2xl border border-white/10 bg-[#160e09]/88 p-3 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-end justify-between gap-3"><div><p className="font-serif text-2xl font-bold leading-none">{burger.name}</p><p className="mt-1 text-xs text-[#d7b997]">Desliza o usa las flechas</p></div><output aria-live="polite" className="font-dosis text-3xl font-bold tabular-nums">S/ {total?.toFixed(0)}</output></div>
          <div className="mt-3 flex gap-2"><Toggle active={order.friesEnabled} label="Papas" onClick={() => onUpdateOrder({ friesEnabled: !order.friesEnabled, friesQuantity: 1, sauce: null })} /><Toggle active={order.drinkEnabled} label="Gaseosa" onClick={() => onUpdateOrder({ drinkEnabled: !order.drinkEnabled, drinkQuantity: 1, drink: null })} /></div>
          {order.friesEnabled && <div className="mt-2"><SauceSelector value={order.sauce} onChange={(sauce) => onUpdateOrder({ sauce })} /></div>}
          {order.drinkEnabled && <div className="mt-2"><DrinkSelector value={order.drink} onChange={(drink) => onUpdateOrder({ drink })} /></div>}
          <button type="button" onClick={onAddToCart} className="mt-3 min-h-12 w-full rounded-full bg-[#c96325] px-6 font-dosis text-lg font-bold text-white active:bg-[#a84c18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e]">Añadir pedido</button>
          {cartFeedback && <p aria-live="polite" className="pt-1.5 text-center text-xs text-[#b8d9b4]">{cartFeedback}</p>}
        </div>
      </div>
    </section>
  );
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-11 flex-1 rounded-full border px-4 font-dosis text-sm font-bold transition-colors ${active ? "border-[#e99a54] bg-[#f2dfc2] text-[#2a170d]" : "border-white/20 bg-white/[.06] text-[#f0d9bd]"}`}>{active ? "✓" : "+"} {label}</button>;
}
