"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const slides = [
  { title: "Fuego, plancha caliente y sabor contundente", copy: "Cada hamburguesa nace del fuego exacto y la pasión por la cocina artesanal." },
  { title: "Hamburguesas con carácter real", copy: "Carne jugosa sellada al instante, queso fundido y pan tostado en su punto." },
  { title: "Tu orden, como a ti te gusta", copy: "Elige tu burger, suma papas y una cola helada." },
];

export function HeroSection() {
  const [phase, setPhase] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => { if (reduce) return; const timer = window.setInterval(() => setPhase((value) => (value + 1) % slides.length), 8000); return () => window.clearInterval(timer); }, [reduce]);
  const slide = slides[phase];
  return (
    <section id="inicio" className="relative flex min-h-[42rem] h-[100svh] items-center overflow-hidden bg-[#15100c]">
      <video src="/bravos-hero.mp4" poster="/bravos-hero-poster.webp" autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,8,6,.55)_0%,rgba(12,8,6,.18)_42%,transparent_72%)] max-md:bg-[linear-gradient(180deg,rgba(12,8,6,.12)_20%,rgba(12,8,6,.68)_82%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-24 sm:px-8 lg:px-12">
        <div className="flex min-h-80 max-w-2xl items-center">
          <AnimatePresence mode="wait"><motion.div key={phase} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduce ? 0 : .65, ease: "easeOut" }}>
            <h1 className="text-balance font-serif text-4xl font-bold leading-[.98] tracking-[-.025em] text-[#fff5e4] sm:text-6xl lg:text-[5.5rem]">{slide.title}</h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#f0dfc8] sm:text-base">{slide.copy}</p>
            <a href="#menu" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#bd5a22] px-7 font-dosis text-lg font-bold text-white transition-colors hover:bg-[#dc7130] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24150d]">Ver menú y precios</a>
          </motion.div></AnimatePresence>
        </div>
      </div>
      <a href="#menu" aria-label="Ir al menú" className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-3 text-[#f2d3aa] transition-transform hover:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b06d]"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 9 6 6 6-6" /></svg></a>
    </section>
  );
}
