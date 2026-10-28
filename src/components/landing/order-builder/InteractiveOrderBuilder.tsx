"use client";

import { useEffect, useRef, useState } from "react";
import { BURGERS_DATA, ADDONS_DATA } from "@/src/data/featured-products";
import type { OrderDraft } from "@/src/types/landing";
import { FloatingComboPreview } from "./FloatingComboPreview";
import { OrderControls } from "./OrderControls";
import { MobileOrderBuilder } from "./MobileOrderBuilder";
import { useMobileViewport } from "@/src/hooks/useMobileViewport";

interface Props { order: OrderDraft; onUpdateOrder: (changes: Partial<OrderDraft>) => void; onAddToCart: () => void; cartFeedback: string }

export function InteractiveOrderBuilder({ order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
  const isMobile = useMobileViewport();
  if (isMobile) return <MobileOrderBuilder order={order} onUpdateOrder={onUpdateOrder} onAddToCart={onAddToCart} cartFeedback={cartFeedback} />;
  return <DesktopOrderBuilder order={order} onUpdateOrder={onUpdateOrder} onAddToCart={onAddToCart} cartFeedback={cartFeedback} />;
}

function DesktopOrderBuilder({ order, onUpdateOrder, onAddToCart, cartFeedback }: Props) {
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
    // Al tocar "Arma tu pedido" la sección llena justo la pantalla bajo la cabecera: título y mesa a la izquierda, opciones a la derecha.
    <section ref={sectionRef} id="armar-orden" aria-labelledby="order-builder-title" className="builder-screen relative flex flex-col justify-center overflow-hidden bg-[#16110E]">
      {shouldLoadVideo && <video src="/Creating_infinite_loop_video_bac…_202608311948.mp4" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" className="builder-video pointer-events-none absolute inset-0 h-full w-full object-cover" />}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,9,6,.32),rgba(15,9,6,.06)_35%,rgba(15,9,6,.4))] lg:bg-[linear-gradient(90deg,rgba(12,8,5,.06)_0%,rgba(12,8,5,.02)_50%,rgba(12,8,5,.7)_72%,rgba(12,8,5,.86)_100%)]" />
      <div className="relative mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[56%_44%] lg:items-center lg:px-10 lg:py-5">
        <div className="flex min-w-0 flex-col">
          <div className="max-w-xl"><h2 id="order-builder-title" className="font-brush text-4xl leading-none text-[#F3E9D6] sm:text-[3.5rem]">Arma tu pedido</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-[#ead6b7]">Elige. Míralo en la mesa. Agrégalo al carrito.</p></div>
          <FloatingComboPreview burger={burger} burgerQuantity={order.burgerQuantity} friesAddon={fries} friesEnabled={order.friesEnabled} friesQuantity={order.friesQuantity} drinkAddon={drink} drinkEnabled={order.drinkEnabled} drinkQuantity={order.drinkQuantity} />
        </div>
        <OrderControls burgers={BURGERS_DATA} addons={ADDONS_DATA} order={order} onUpdateOrder={onUpdateOrder} onAddToCart={onAddToCart} cartFeedback={cartFeedback} />
      </div>
    </section>
  );
}
