"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { MENU_PRODUCTS } from "@/src/data/featured-products";

function ProductRun({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={`bravos-product-run ${duplicate ? "bravos-product-run--duplicate" : ""}`} aria-hidden={duplicate || undefined}>
      {MENU_PRODUCTS.map((item) => (
        <Link href="/menu" aria-label={duplicate ? undefined : `Ver ${item.name} en el menú`} tabIndex={duplicate ? -1 : undefined} key={`${duplicate ? "copy-" : ""}${item.id}`} className={`group bravos-carousel-card bravos-carousel-card--${item.orientation}`}>
          <div className="relative h-full overflow-hidden rounded-[inherit]">
            <Image src={item.image} alt={duplicate ? "" : item.name} fill sizes="(max-width: 639px) 78vw, (max-width: 1023px) 42vw, 24vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-6"><h3 className="font-serif text-base font-bold leading-tight text-white sm:text-2xl">{item.name}</h3></div>
          </div>
        </Link>
      ))}
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

  useEffect(() => {
    if (reducedMotion) return;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = now - previous;
      previous = now;
      if (!dragRef.current && now >= pausedUntilRef.current) applyOffset(offsetRef.current - delta * 0.035);
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current); };
  }, [applyOffset, reducedMotion]);

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

  const pauseThenResume = useCallback(() => {
    clearIdleTimer();
    didDragRef.current = false;
    pausedUntilRef.current = performance.now() + 1200;
    idleTimerRef.current = window.setTimeout(() => { idleTimerRef.current = null; pausedUntilRef.current = 0; }, 1200);
  }, [clearIdleTimer]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearIdleTimer();
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
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    clearIdleTimer();
    applyOffset(offsetRef.current - event.deltaX);
    pauseThenResume();
  };

  return (
    <section id="menu" aria-labelledby="products-title" className="bravos-carousel-section relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="bravos-carousel-line bravos-carousel-line--top" aria-hidden="true" />
      <div className="bravos-carousel-line bravos-carousel-line--bottom" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-dosis text-[.66rem] font-bold uppercase tracking-[0.3em] text-[#c7864d] sm:text-xs">FUEGO, HUMO Y CARÁCTER</p><h2 id="products-title" className="mt-3 max-w-3xl font-serif text-[2.25rem] font-bold leading-none text-[#f5eadc] sm:text-6xl">Lo que manda en Bravos</h2></div><Link href="/menu" className="bravos-carousel-cta">Ver menú completo <span aria-hidden="true">→</span></Link></div>
      </div>
      <div className={`bravos-marquee-shell relative z-10 mt-10 sm:mt-12 ${isDragging ? "is-dragging" : ""}`} onClickCapture={(event) => { if (didDragRef.current) { event.preventDefault(); didDragRef.current = false; } }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <div ref={trackRef} className="bravos-marquee-track"><ProductRun /><ProductRun duplicate /></div>
      </div>
    </section>
  );
}
