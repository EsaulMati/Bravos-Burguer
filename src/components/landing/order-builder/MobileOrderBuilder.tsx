"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ADDONS_DATA, BURGERS_DATA, calculateOrderPrice } from "@/src/data/featured-products";
import type { OrderDraft } from "@/src/types/landing";
import { DrinkSelector, SauceSelector } from "../SelectionControls";

interface Props { order: OrderDraft; onUpdateOrder: (changes: Partial<OrderDraft>) => void; onAddToCart: () => void; cartFeedback: string }

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function MobileOrderBuilder({ order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; pointerId: number } | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const reduceMotion = useReducedMotion();
  const burgerIndex = Math.max(0, BURGERS_DATA.findIndex((item) => item.id === order.burgerId));
  const burger = BURGERS_DATA[burgerIndex] ?? BURGERS_DATA[0];
  const fries = ADDONS_DATA.find((item) => item.id === "fries");
  const drink = ADDONS_DATA.find((item) => item.id === "drink");
  const total = calculateOrderPrice(order);

  // El video del armador solo se descarga cuando la sección se acerca, igual que en escritorio.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldLoadVideo) return;
    if (typeof window.IntersectionObserver !== "function") {
      const fallbackTimer = window.setTimeout(() => setShouldLoadVideo(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShouldLoadVideo(true); observer.disconnect(); }
    }, { rootMargin: "400px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

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
    <section ref={sectionRef} id="armar-orden" aria-labelledby="mobile-builder-title" className="mobile-builder relative min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#16110E]">
      {shouldLoadVideo && <video src="/bravos-mobile-arma-tu-pedido.mp4.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="builder-video pointer-events-none absolute inset-0 h-full w-full object-cover" />}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,5,.58)_0%,rgba(12,8,5,.05)_25%,rgba(12,8,5,.04)_62%,rgba(12,8,5,.84)_100%)]" />
      {/* Al tocar "Arma tu pedido" la sección ocupa justo la pantalla bajo la cabecera; abajo queda libre el botón del carrito. */}
      <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-lg flex-col justify-center px-4 pb-20 pt-4">
        <div className="text-center"><h2 id="mobile-builder-title" className="font-brush text-[clamp(2.1rem,9vw,2.5rem)] leading-none text-[#F3E9D6]">Arma tu pedido</h2></div>
        <div className="mobile-builder-product-stage relative mt-1 h-[clamp(14.5rem,35svh,20rem)] shrink-0 select-none touch-pan-y" onPointerDown={(event) => { touchStart.current = { x: event.clientX, pointerId: event.pointerId }; try { event.currentTarget.setPointerCapture(event.pointerId); } catch {} }} onPointerUp={(event) => { finishSwipe(event.clientX); try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch {} }} onPointerCancel={(event) => { touchStart.current = null; try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch {} }}>
          <AnimatePresence initial={false}>
            <motion.div key={burger.id} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateX(24px) scale(.96)" }} animate={{ opacity: 1, transform: "translateX(0px) scale(1)" }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateX(-24px) scale(.96)", transition: { duration: .15, ease: EASE_OUT } }} transition={{ duration: .25, ease: EASE_OUT }} className="absolute left-[4%] right-[4%] top-[3%] z-20 h-[86%]">
              <Image src={burger.cutoutImage ?? burger.image} alt={burger.name} fill sizes="70vw" className="object-contain drop-shadow-[0_22px_18px_rgba(20,7,2,.58)]" />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {order.friesEnabled && fries?.cutoutImage && <motion.div key="fries" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }} transition={{ duration: .2, ease: EASE_OUT }} className="absolute bottom-[10%] left-[3%] z-30 h-[60%] w-[60%]"><Image src={fries.cutoutImage} alt="Papas" fill sizes="60vw" className="object-contain drop-shadow-[0_18px_13px_rgba(20,7,2,.5)]" /></motion.div>}
            {order.drinkEnabled && drink?.cutoutImage && <motion.div key="drink" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }} transition={{ duration: .2, ease: EASE_OUT }} className="absolute bottom-[11%] right-[2%] z-10 h-[74%] w-[57%]"><Image src={drink.cutoutImage} alt="Gaseosa" fill sizes="57vw" className="object-contain drop-shadow-[0_18px_13px_rgba(20,7,2,.5)]" /></motion.div>}
          </AnimatePresence>
        </div>
        <div className="mt-0 rounded-2xl border border-white/10 bg-[#160e09]/95 p-3 text-white shadow-2xl">
          <div role="group" aria-label="Elige tu burger" className="grid grid-cols-2 gap-2">
            {BURGERS_DATA.map((item) => {
              const active = item.id === burger.id;
              return <button key={item.id} type="button" aria-pressed={active} onClick={() => onUpdateOrder({ burgerId: item.id })} className={`tap min-h-14 rounded-xl px-3 py-2 text-left ${active ? "bg-[#f3dfbf] text-[#2a170d]" : "bg-white/[.06] text-[#f0d9bd]"}`}><span className="block font-serif text-xl leading-none">{item.name}</span><span className="mt-1 block font-dosis text-sm font-bold">S/ {item.price}</span></button>;
            })}
          </div>
          <div className="mt-2 flex gap-2"><Toggle active={order.friesEnabled} label={`Papas S/ ${fries?.price}`} onClick={() => onUpdateOrder({ friesEnabled: !order.friesEnabled, friesQuantity: 1, sauce: null })} /><Toggle active={order.drinkEnabled} label={`Gaseosa S/ ${drink?.price}`} onClick={() => onUpdateOrder({ drinkEnabled: !order.drinkEnabled, drinkQuantity: 1, drink: null })} /></div>
          {order.friesEnabled && <div className="mt-2"><SauceSelector hideLabel value={order.sauce} onChange={(sauce) => onUpdateOrder({ sauce })} /></div>}
          {order.drinkEnabled && <div className="mt-2"><DrinkSelector hideLabel value={order.drink} onChange={(drink) => onUpdateOrder({ drink })} /></div>}
          <div className="mt-3 flex items-center justify-between"><span className="font-dosis text-base font-semibold text-[#d9bf9c]">Total</span><output aria-live="polite" className="font-serif text-3xl leading-none tabular-nums">S/ {total?.toFixed(0)}</output></div>
          <button type="button" onClick={onAddToCart} className="tap bravos-fill mt-2 min-h-12 w-full rounded-full bg-[#B35629] px-6 font-sans text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e]">Agregar al carrito</button>
          {cartFeedback && <p aria-live="polite" className="pt-1.5 text-center text-xs text-[#b8d9b4]">{cartFeedback}</p>}
        </div>
      </div>
    </section>
  );
}

function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`tap min-h-11 flex-1 rounded-full border px-3 font-dosis text-sm font-bold ${active ? "border-[#e99a54] bg-[#f2dfc2] text-[#2a170d]" : "border-white/20 bg-white/[.06] text-[#f0d9bd]"}`}>{active ? "" : "+ "}{label}</button>;
}
