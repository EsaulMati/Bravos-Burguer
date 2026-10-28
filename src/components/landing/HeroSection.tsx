"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { useScrollFrames, type FrameSet } from "@/src/hooks/useScrollFrames";

// Despiece de El León (public/hero): 60 cuadros por versión; el 000 es la hamburguesa armada.
const FRAME_COUNT = 60;
const frameSrc = (set: FrameSet, index: number) => `/hero/${set}/${String(index).padStart(3, "0")}.webp`;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  // El CSS lee --p para el sello y el aviso de bajar; así el scroll no vuelve a renderizar React.
  const onProgress = useCallback((p: number) => {
    sectionRef.current?.style.setProperty("--p", p.toFixed(3));
    if (cueRef.current) cueRef.current.style.opacity = String(Math.max(0, 1 - p * 6));
  }, []);
  // Con movimiento reducido el canvas se oculta y queda la foto del primer cuadro.
  useScrollFrames({ sectionRef, canvasRef, count: FRAME_COUNT, src: frameSrc, stillIndex: null, onProgress });

  return (
    <section ref={sectionRef} id="inicio" className="bravos-hero">
      <div className="bravos-hero-sticky">
        <div aria-hidden="true" className="bravos-hero-media">
          <div className="bravos-hero-frame absolute inset-0">
            <picture>
              <source media="(max-width: 767px), (max-aspect-ratio: 1/1)" srcSet={frameSrc("cel", 0)} />
              {/* Primer cuadro de la secuencia; el canvas dibuja encima los siguientes. */}
              <img src={frameSrc("web", 0)} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full" />
            </picture>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>
          {/* Sello: aparece y se encierra en un trazo a mano mientras El León se abre. */}
          <div className="bravos-hero-stamp">
            <svg viewBox="0 0 200 200" fill="none" className="absolute inset-0 h-full w-full overflow-visible">
              <path pathLength={1} d="M150 30C118 6 52 12 26 58S20 162 84 180s132-14 102-104C172 38 126 22 92 26" />
            </svg>
            <span className="font-dosis text-[.6875rem] font-bold uppercase tracking-[.12em] text-[#E0793E]">El de la casa</span>
            <span className="font-brush text-[1.4em] leading-none text-[#F3E9D6]">El León</span>
          </div>
        </div>
        <div aria-hidden="true" className="bravos-hero-shade pointer-events-none absolute inset-0" />
        <div className="bravos-hero-content">
          <h1 className="bravos-hero-title text-[#F3E9D6]">
            <span className="block font-dosis text-[1.05rem] font-bold leading-tight text-[#E0793E] drop-shadow-[0_2px_10px_rgba(0,0,0,.85)] md:text-xl">Delivery en Arequipa</span>
            <span className="mt-2 block text-balance font-brush text-[2.3rem] leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,.6)] sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.25rem]">
              Hamburguesas{" "}
              {/* La coma va pegada a "bravas" para que no salte sola a la línea siguiente. */}
              <span className="whitespace-nowrap">
                <span className="bravos-hero-mark">
                  bravas
                  <svg aria-hidden="true" viewBox="0 0 300 24" preserveAspectRatio="none" fill="none">
                    <path pathLength={1} d="M4 15C70 6 160 4 296 9M24 20c86-6 170-7 252-3" />
                  </svg>
                </span>
                ,
              </span>{" "}
              directo a tu puerta
            </span>
          </h1>
          <div className="bravos-hero-actions">
            <p className="max-w-[22rem] text-[.9375rem] leading-relaxed text-[#f0dfc8] drop-shadow-[0_2px_12px_rgba(0,0,0,.8)] md:max-w-md md:text-lg">
              La Gordita y El León, con doble carne, recién salidos de la plancha. Armas tu pedido aquí, lo mandas por WhatsApp y pagas con Yape o Plin.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
              <a href="#armar-orden" className="bravos-button tap">Armar mi pedido</a>
              <Link href="/menu" className="bravos-button bravos-button--ghost tap">Ver menú y precios</Link>
            </div>
          </div>
        </div>
        <div ref={cueRef} aria-hidden="true" className="bravos-hero-cue">
          <span>Baja y mira cómo se arma</span>
          <svg viewBox="0 0 140 48" fill="none">
            <path pathLength={1} d="M4 40C34 44 72 40 98 26S126 6 132 4M114 4l18 0-6 16" />
          </svg>
        </div>
      </div>
    </section>
  );
}
