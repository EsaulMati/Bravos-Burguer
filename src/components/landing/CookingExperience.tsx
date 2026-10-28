"use client";

import { useCallback, useRef } from "react";
import { useScrollFrames, type FrameSet } from "@/src/hooks/useScrollFrames";

// Plancha (public/plancha): 60 cuadros por versión; la carne pasa de cruda a sellada y el queso se derrite al final.
const FRAME_COUNT = 60;
const LAST_FRAME = FRAME_COUNT - 1;
const frameSrc = (set: FrameSet, index: number) => `/plancha/${set}/${String(index).padStart(3, "0")}.webp`;
const INITIAL_TEMPERATURE = 25;
const FINAL_TEMPERATURE = 160;

const temperatureFor = (progress: number) => progress >= 0.999
  ? FINAL_TEMPERATURE
  : Math.min(FINAL_TEMPERATURE - 1, Math.round(INITIAL_TEMPERATURE + (FINAL_TEMPERATURE - INITIAL_TEMPERATURE) * progress));

export function CookingExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const temperatureRef = useRef<HTMLSpanElement>(null);
  const thermometerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  // El termómetro sube junto con la cocción; se escribe directo en el DOM para no renderizar en cada cuadro.
  const onProgress = useCallback((progress: number) => {
    const temperature = temperatureFor(progress);
    if (temperatureRef.current) temperatureRef.current.textContent = String(temperature);
    thermometerRef.current?.setAttribute("aria-label", `Temperatura de la plancha: ${temperature} grados Celsius`);
    if (fillRef.current) fillRef.current.style.transform = `scaleY(${(0.08 + 0.92 * progress).toFixed(3)})`;
  }, []);
  // Con movimiento reducido se muestra directo la carne lista con queso.
  useScrollFrames({ sectionRef, canvasRef, count: FRAME_COUNT, src: frameSrc, fit: "cover", stillIndex: LAST_FRAME, lazy: true, onProgress });

  return (
    <section ref={sectionRef} aria-labelledby="cooking-experience-title" className="cooking-scroll-section">
      <div className="cooking-sticky-scene">
        <div className="absolute inset-0 bg-[#0a0705]">
          <picture>
            <source media="(max-width: 767px), (max-aspect-ratio: 1/1)" srcSet={frameSrc("cel", 0)} />
            {/* Primer cuadro mientras carga la secuencia; el canvas dibuja encima. */}
            <img src={frameSrc("web", 0)} alt="Carne de res sellándose en la plancha de Bravos" loading="lazy" decoding="async" className="cooking-scene-image absolute inset-0 h-full w-full" />
          </picture>
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        </div>

        <div className="cooking-scene-shade" aria-hidden="true" />

        <div className="absolute inset-x-0 top-[12%] z-10 mx-auto max-w-7xl px-5 sm:top-[16%] sm:px-8 lg:px-12">
          <h2 id="cooking-experience-title" className="max-w-[11ch] font-brush text-[2.1rem] leading-[1] text-[#F3E9D6] drop-shadow-[0_3px_18px_rgba(0,0,0,.75)] sm:max-w-[13ch] sm:text-5xl lg:text-6xl">
            Directo de la plancha a tu puerta.
          </h2>
        </div>

        <div ref={thermometerRef} className="cooking-thermometer" aria-label={`Temperatura de la plancha: ${INITIAL_TEMPERATURE} grados Celsius`}>
          <div className="cooking-temperature" aria-hidden="true">
            <span ref={temperatureRef} className="bravos-cooking-temperature">{INITIAL_TEMPERATURE}</span>
            <span className="text-[.45em] align-top">°C</span>
          </div>
          <div className="cooking-thermometer-body" aria-hidden="true">
            <span className="cooking-thermometer-mark cooking-thermometer-mark--one" />
            <span className="cooking-thermometer-mark cooking-thermometer-mark--two" />
            <span className="cooking-thermometer-mark cooking-thermometer-mark--three" />
            <span ref={fillRef} className="cooking-thermometer-fill" style={{ transform: "scaleY(.08)" }} />
          </div>
          <div className="cooking-thermometer-bulb" aria-hidden="true" />
          <span className="mt-4 font-dosis text-sm font-bold uppercase tracking-[.12em] text-[#e2c4a4]">
            Plancha
          </span>
        </div>
      </div>
    </section>
  );
}
