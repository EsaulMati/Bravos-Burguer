"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const INITIAL_TEMPERATURE = 25;
const FINAL_TEMPERATURE = 160;
const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function MobileCookingExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = clampProgress(-rect.top / travel);
      setProgress((current) => Math.abs(current - nextProgress) < 0.001 ? current : nextProgress);
    };
    const scheduleMeasure = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };
    const updateMotionPreference = () => {
      setReduceMotion(media.matches);
      scheduleMeasure();
    };

    updateMotionPreference();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    if (typeof media.addEventListener === "function") media.addEventListener("change", updateMotionPreference);
    else if (typeof media.addListener === "function") media.addListener(updateMotionPreference);

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (typeof media.removeEventListener === "function") media.removeEventListener("change", updateMotionPreference);
      else if (typeof media.removeListener === "function") media.removeListener(updateMotionPreference);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const visualProgress = reduceMotion ? 1 : progress;
  const cookingProgress = clampProgress((visualProgress - 0.24) / 0.7);
  const temperature = reduceMotion
    ? FINAL_TEMPERATURE
    : progress >= 0.999
      ? FINAL_TEMPERATURE
      : Math.min(FINAL_TEMPERATURE - 1, Math.round(INITIAL_TEMPERATURE + (FINAL_TEMPERATURE - INITIAL_TEMPERATURE) * progress));
  const copyOpacity = reduceMotion ? 1 : clampProgress((progress - 0.72) / 0.18);

  return (
    <section ref={sectionRef} aria-labelledby="mobile-cooking-title" className={`mobile-cooking-section ${reduceMotion ? "cooking-scroll-section--reduced" : ""}`}>
      <div className="cooking-sticky-scene">
        <div className="pointer-events-none absolute inset-0 bg-[#080604]">
          <div className="absolute inset-0" style={{ opacity: 1 - cookingProgress }}>
            <Image src="/bravos-mobile-parrilla-cruda.png.jpeg" alt="Carnes crudas sobre la parrilla de Bravos" fill sizes="100vw" className="object-cover object-center" />
          </div>
          <div className="absolute inset-0" style={{ opacity: cookingProgress }}>
            <Image src="/bravos-mobile-parrilla-cocida.png.jpeg" alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(5,3,2,.55),transparent_28%,transparent_70%,rgba(5,3,2,.42))]" />
        <h2 id="mobile-cooking-title" style={{ opacity: copyOpacity }} className="pointer-events-none absolute left-5 top-[12%] z-10 max-w-[9ch] font-serif text-4xl font-bold leading-[.94] text-[#fff1df] drop-shadow-[0_3px_18px_rgba(0,0,0,.8)]">Listas para ser Bravos a lo bravo.</h2>
        <div className="mobile-thermometer" aria-label={`Temperatura visual: ${temperature} grados Celsius`}>
          <div className="font-dosis text-2xl font-bold tabular-nums"><span>{temperature}</span><span className="text-[.45em] align-top">°C</span></div>
          <div className="relative mt-2 h-36 w-2 rounded-full border border-[#ffe5c5]/70 bg-black/30"><span className="absolute inset-x-[2px] bottom-[2px] top-[2px] origin-bottom rounded-full bg-gradient-to-t from-[#bd4018] to-[#ffc26f]" style={{ transform: `scaleY(${Math.max(0.08, visualProgress)})` }} /></div>
          <div className="-mt-1 size-5 rounded-full border border-[#ffe5c5]/70 bg-[#d6501c]" />
        </div>
      </div>
    </section>
  );
}
