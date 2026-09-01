"use client";

import { useEffect, useRef, useState } from "react";
import { BURGERS_DATA, ADDONS_DATA } from "@/src/data/featured-products";
import type { OrderDraft } from "@/src/types/landing";
import { FloatingComboPreview } from "./FloatingComboPreview";
import { OrderControls } from "./OrderControls";

interface Props { order: OrderDraft; onUpdateOrder: (changes: Partial<OrderDraft>) => void; onAddToCart: () => void; cartFeedback: string }

export function InteractiveOrderBuilder({ order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const burger = BURGERS_DATA.find((item) => item.id === order.burgerId) ?? BURGERS_DATA[0];
  const fries = ADDONS_DATA.find((item) => item.id === "fries");
  const drink = ADDONS_DATA.find((item) => item.id === "drink");

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

  return (
    <section ref={sectionRef} id="armar-orden" aria-labelledby="order-builder-title" className="relative scroll-mt-16 overflow-hidden bg-[#130d09] pb-8 sm:pb-10 lg:pb-12">
      {shouldLoadVideo && <video src="/Creating_infinite_loop_video_bac…_202608311948.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="builder-video absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,9,6,.32),rgba(15,9,6,.06)_35%,rgba(15,9,6,.4))] lg:bg-[linear-gradient(90deg,rgba(12,8,5,.06)_0%,rgba(12,8,5,.02)_50%,rgba(12,8,5,.7)_72%,rgba(12,8,5,.86)_100%)]" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-12">
        <div className="max-w-xl lg:relative lg:top-[72px] lg:w-[54%]"><h2 id="order-builder-title" className="font-serif text-4xl font-bold leading-none text-[#fff1d7] sm:text-6xl">Arma tu pedido</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-[#ead6b7]">Elige. Míralo en la mesa. Agrégalo al carrito.</p></div>
        <div className="mt-7 grid gap-7 lg:mt-8 lg:grid-cols-[56%_44%] lg:items-center">
          <FloatingComboPreview burger={burger} burgerQuantity={order.burgerQuantity} friesAddon={fries} friesEnabled={order.friesEnabled} friesQuantity={order.friesQuantity} drinkAddon={drink} drinkEnabled={order.drinkEnabled} drinkQuantity={order.drinkQuantity} />
          <OrderControls burgers={BURGERS_DATA} addons={ADDONS_DATA} order={order} onUpdateOrder={onUpdateOrder} onAddToCart={onAddToCart} cartFeedback={cartFeedback} />
        </div>
      </div>
    </section>
  );
}
