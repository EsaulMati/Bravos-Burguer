"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

// La frase se enciende palabra por palabra con el scroll; las dos últimas van en Brasa y con trazo a mano.
const WORDS = ["Porque", "al", "León", "hay", "que"];
const ACCENT = ["darle", "carne."];
const TOTAL = WORDS.length + ACCENT.length;

function Word({ progress, index, children }: { progress: MotionValue<number>; index: number; children: string }) {
  const start = (index / TOTAL) * 0.8;
  const opacity = useTransform(progress, [start, start + 0.8 / TOTAL], [0.14, 1]);
  return <motion.span className="bravos-leon-word" style={{ opacity }}>{children}</motion.span>;
}

/* La foto de El León esconde el escudo de Bravos: un círculo sigue al mouse (o al dedo) y lo descubre. */
function LeonReveal() {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let x = 0.5, y = 0.5, radius = 0;
    let targetX = 0.5, targetY = 0.5, targetRadius = 0;
    let raf = 0;
    let hideTimer = 0;

    const paint = () => {
      box.style.setProperty("--rx", `${(x * 100).toFixed(2)}%`);
      box.style.setProperty("--ry", `${(y * 100).toFixed(2)}%`);
      box.style.setProperty("--rr", `${radius.toFixed(1)}px`);
      box.style.setProperty("--ro", radius > 4 ? "1" : "0");
    };
    const tick = () => {
      // El círculo persigue al cursor con un poco de retraso; con movimiento reducido salta directo.
      const ease = reducedMotion.matches ? 1 : 0.2;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      radius += (targetRadius - radius) * (reducedMotion.matches ? 1 : 0.16);
      paint();
      const settled = Math.abs(targetX - x) < 0.001 && Math.abs(targetY - y) < 0.001 && Math.abs(targetRadius - radius) < 0.5;
      raf = settled ? 0 : window.requestAnimationFrame(tick);
    };
    const run = () => {
      if (!raf) raf = window.requestAnimationFrame(tick);
    };
    const aim = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width;
      targetY = (event.clientY - rect.top) / rect.height;
    };
    const fullRadius = () => Math.max(70, Math.min(150, box.clientWidth * 0.17));

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aim(event);
      x = targetX;
      y = targetY;
      targetRadius = fullRadius();
      run();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aim(event);
      run();
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetRadius = 0;
      run();
    };
    // En pantallas táctiles, tocar la foto abre el círculo ahí un momento.
    const onTap = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      aim(event);
      x = targetX;
      y = targetY;
      targetRadius = fullRadius();
      run();
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => { targetRadius = 0; run(); }, 1600);
    };

    box.addEventListener("pointerenter", onEnter);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerdown", onTap);
    return () => {
      box.removeEventListener("pointerenter", onEnter);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onTap);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div ref={boxRef} className="bravos-leon-reveal">
      <Image src="/bravos-el-leon-foto.webp" alt="El León en su plato, en la mesa de Bravos" fill sizes="(max-width: 1023px) calc(100vw - 2rem), 760px" className="object-cover" />
      <div aria-hidden="true" className="bravos-leon-reveal-under">
        <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} sizes="(max-width: 1023px) 70vw, 460px" className="bravos-leon-reveal-crest" />
      </div>
      <div aria-hidden="true" className="bravos-leon-reveal-ring" />
      <p aria-hidden="true" className="bravos-leon-reveal-hint">
        <span className="bravos-leon-reveal-hint--mouse">Pasa el mouse por El León</span>
        <span className="bravos-leon-reveal-hint--touch">Toca a El León</span>
      </p>
    </div>
  );
}

export function LeonSection() {
  const phraseRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: phraseRef, offset: ["start 0.85", "end 0.5"] });
  const underline = useTransform(scrollYProgress, [0.74, 1], [0, 1]);
  // Aparece cuando el trazo ya empezó: así las puntas redondeadas no se ven como dos puntos sueltos.
  const underlineOpacity = useTransform(scrollYProgress, [0.78, 0.82], [0, 1]);

  return (
    <section id="el-leon" aria-labelledby="leon-title" className="bravos-leon bravos-section-cream px-4 py-20 sm:px-6 sm:py-28">
      {/* Foto a la izquierda y la frase a la derecha; el texto chico va debajo de la frase. En celular, frase arriba y foto abajo. */}
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:px-6">
        <div className="order-2 lg:order-1"><LeonReveal /></div>
        <div className="order-1 lg:order-2">
          <h2 id="leon-title" className="font-dosis text-lg font-bold uppercase tracking-[.16em] text-[#B35629] sm:text-xl">¿Por qué El León?</h2>
          <p ref={phraseRef} className="bravos-leon-phrase mt-3 font-brush text-[#16110E]">
            {WORDS.map((word, index) => <Word key={word} progress={scrollYProgress} index={index}>{word}</Word>)}
            <span className="bravos-leon-accent">
              {ACCENT.map((word, index) => <Word key={word} progress={scrollYProgress} index={WORDS.length + index}>{word}</Word>)}
              <svg aria-hidden="true" viewBox="0 0 400 40" preserveAspectRatio="none" fill="none">
                <motion.path style={{ pathLength: underline, opacity: underlineOpacity }} d="M6 26C90 12 220 8 394 16M40 34c110-9 230-11 330-5" />
              </svg>
            </span>
          </p>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[#6B5D52] sm:text-lg">
            Es el que pides cuando el hambre ruge: el de la casa, el que le pone nombre a la frase.
          </p>
          <a href="#armar-orden" className="bravos-button tap mt-6">Quiero El León</a>
        </div>
      </div>
    </section>
  );
}
