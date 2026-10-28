"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { BURGERS_DATA, MENU_SECTIONS } from "@/src/data/featured-products";

// En la portada no van precios: se ven en el menú (/menu) y en "Arma tu pedido".

// Cada tarjeta lleva el nombre de su sección del menú (Con su Yapa, Con Todo…) como etiqueta.
const CAROUSEL_ITEMS = MENU_SECTIONS.flatMap((section) => section.items.map((item) => ({ item, section: section.title })));

function ProductRun({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={`bravos-product-run ${duplicate ? "bravos-product-run--duplicate" : ""}`} aria-hidden={duplicate || undefined}>
      {CAROUSEL_ITEMS.map(({ item, section }) => {
        const Title = duplicate ? "p" : "h3";
        return (
          <Link href={`/menu#${item.id}`} draggable={false} aria-label={duplicate ? undefined : `Ver ${item.name} en el menú`} tabIndex={duplicate ? -1 : undefined} key={`${duplicate ? "copy-" : ""}${item.id}`} className={`group bravos-carousel-card bravos-carousel-card--${item.orientation}`}>
            <div className="relative h-full overflow-hidden rounded-[inherit]">
              <Image src={item.image} alt={duplicate ? "" : item.name} draggable={false} fill sizes={item.orientation === "landscape" ? "(max-width: 767px) 84vw, 500px" : "(max-width: 767px) 64vw, 280px"} className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.05]" />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <span className="bravos-carousel-tag">{section}</span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <Title className="font-serif text-2xl leading-[.95] text-[#F3E9D6] sm:text-[2rem]">{item.name}</Title>
                <span aria-hidden="true" className="bravos-carousel-go">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* Los dos de la casa como póster, al estilo de la campaña El León: nombre gigante detrás del producto. */
function BurgerPosters() {
  return (
    <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-8">
      {BURGERS_DATA.map((burger) => {
        return (
          <article key={burger.id} className="relative isolate flex flex-col items-center text-center">
            <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 select-none font-brush text-[clamp(3.5rem,16.5vw,7.5rem)] leading-[.9] text-[#16110E] md:text-[clamp(3.75rem,7.4vw,7rem)]">{burger.name}</p>
            <div className="relative -mb-6 mt-[clamp(2.5rem,12vw,5rem)] aspect-square w-[min(100%,26rem)] md:mt-[clamp(3rem,6vw,5rem)]">
              <Image src={burger.cutoutImage ?? burger.image} alt={`Hamburguesa ${burger.name}`} fill sizes="(max-width: 767px) 90vw, 416px" className="object-cover drop-shadow-[0_28px_22px_rgba(22,17,14,.35)]" />
            </div>
            <h3 className="sr-only">{burger.name}</h3>
            <p className="max-w-sm text-base leading-relaxed text-[#6B5D52]">{burger.description}</p>
            <p className="mt-2 font-dosis text-base font-semibold uppercase tracking-[.08em] text-[#16110E]">Con papas, con gaseosa o full</p>
          </article>
        );
      })}
    </div>
  );
}

export function FeaturedMenu() {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const pausedUntilRef = useRef(0);
  const dragRef = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);
  const didDragRef = useRef(false);
  const hoverRef = useRef(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const applyOffset = useCallback((nextOffset: number) => {
    const halfWidth = halfWidthRef.current;
    if (halfWidth > 0) {
      while (nextOffset <= -halfWidth) nextOffset += halfWidth;
      while (nextOffset > 0) nextOffset -= halfWidth;
    }
    offsetRef.current = nextOffset;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${nextOffset}px, 0, 0)`;
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => { halfWidthRef.current = track.scrollWidth / 2; applyOffset(offsetRef.current); };
    measure();
    if (typeof window.ResizeObserver === "function") {
      const observer = new ResizeObserver(measure);
      observer.observe(track);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [applyOffset]);

  // El carrusel solo avanza mientras se ve en pantalla: fuera de vista no gasta batería ni CPU.
  useEffect(() => {
    if (reducedMotion) return;
    const shell = shellRef.current;
    let previous = performance.now();
    let running = false;
    const tick = (now: number) => {
      const delta = Math.min(now - previous, 64);
      previous = now;
      if (!dragRef.current && !hoverRef.current && now >= pausedUntilRef.current) applyOffset(offsetRef.current - delta * 0.035);
      frameRef.current = window.requestAnimationFrame(tick);
    };
    const start = () => { if (running) return; running = true; previous = performance.now(); frameRef.current = window.requestAnimationFrame(tick); };
    const stop = () => { running = false; if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current); frameRef.current = null; };
    if (!shell || typeof window.IntersectionObserver !== "function") { start(); return stop; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) start(); else stop(); });
    observer.observe(shell);
    return () => { observer.disconnect(); stop(); };
  }, [applyOffset, reducedMotion]);

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

  const pauseThenResume = useCallback(() => {
    clearIdleTimer();
    pausedUntilRef.current = performance.now() + 1200;
    idleTimerRef.current = window.setTimeout(() => { idleTimerRef.current = null; pausedUntilRef.current = 0; }, 1200);
  }, [clearIdleTimer]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Con movimiento reducido el carrusel es un scroll nativo: no interceptamos el arrastre.
    if (reducedMotion) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearIdleTimer();
    didDragRef.current = false;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startOffset: offsetRef.current };
    setIsDragging(true);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* El drag continúa sin capture en navegadores antiguos. */ }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - drag.startX) > 6) didDragRef.current = true;
    applyOffset(drag.startOffset + event.clientX - drag.startX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* Sin soporte de pointer capture. */ }
    pauseThenResume();
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    clearIdleTimer();
    applyOffset(offsetRef.current - event.deltaX);
    pauseThenResume();
  };

  return (
    <section id="menu" aria-labelledby="products-title" className="bravos-carousel-section bravos-section-cream relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl"><h2 id="products-title" className="font-brush text-[2.9rem] leading-[1] text-[#16110E] sm:text-6xl lg:text-[5.25rem]">Lo que manda en Bravos</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-[#6B5D52] sm:text-lg">Dos hamburguesas a la plancha, con papas, gaseosa o en combo para la manchita.</p></div>
        <BurgerPosters />
        <div className="mt-16 flex flex-col gap-4 border-t-2 border-[#16110E] pt-6 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-serif text-3xl leading-none text-[#16110E] sm:text-4xl">Todo el menú</h3><Link href="/menu" className="bravos-button bravos-button--ghost tap shrink-0 self-start sm:self-auto">Ver menú completo <span aria-hidden="true">→</span></Link></div>
      </div>
      <div ref={shellRef} onPointerEnter={(event) => { if (event.pointerType === "mouse") hoverRef.current = true; }} onPointerLeave={() => { hoverRef.current = false; }} className={`bravos-marquee-shell relative z-10 mt-8 ${isDragging ? "is-dragging" : ""}`} onClickCapture={(event) => { if (didDragRef.current) { event.preventDefault(); didDragRef.current = false; } }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <div ref={trackRef} className="bravos-marquee-track"><ProductRun /><ProductRun duplicate /></div>
      </div>
    </section>
  );
}
