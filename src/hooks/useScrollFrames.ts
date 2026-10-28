"use client";

import { useEffect, useRef, type RefObject } from "react";

export type FrameSet = "web" | "cel";

interface ScrollFramesOptions {
  sectionRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  count: number;
  src: (set: FrameSet, index: number) => string;
  /** "fill": el canvas ya tiene la proporción del cuadro. "cover": recorta al centro, como object-fit: cover. */
  fit?: "fill" | "cover";
  /** Con movimiento reducido no se descarga la secuencia: se dibuja solo este cuadro (o nada, con null). */
  stillIndex?: number | null;
  /** Descarga los cuadros recién cuando la sección se acerca a la pantalla. */
  lazy?: boolean;
  /** Avance de 0 a 1 en cada cuadro dibujado; para tocar el DOM sin volver a renderizar React. */
  onProgress?: (progress: number) => void;
}

/**
 * Secuencia de cuadros que avanza con el scroll (como en la web de Apple): la sección es más alta que la pantalla,
 * su contenido queda fijo con sticky y el canvas dibuja el cuadro que corresponde a cuánto se bajó.
 * Las pantallas verticales (celular y tableta parada) usan el set "cel".
 */
export function useScrollFrames({ sectionRef, canvasRef, count, src, fit = "fill", stillIndex = 0, lazy = false, onProgress }: ScrollFramesOptions) {
  const progressRef = useRef(onProgress);
  useEffect(() => { progressRef.current = onProgress; }, [onProgress]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!section || !canvas || !context) return;
    const vertical = window.matchMedia("(max-width: 767px), (max-aspect-ratio: 1/1)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frames: HTMLImageElement[] = [];
    let drawn = -1;
    let raf = 0;
    let started = !lazy;

    const progress = () => {
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / travel));
    };
    const paint = (image: HTMLImageElement) => {
      if (fit === "fill") {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return;
      }
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    };
    const draw = (force = false) => {
      raf = 0;
      if (!frames.length) return;
      // Con movimiento reducido el avance es el del cuadro fijo (por ejemplo, el termómetro queda lleno si es el último).
      const p = reducedMotion.matches && stillIndex !== null ? stillIndex / Math.max(1, count - 1) : progress();
      progressRef.current?.(p);
      // Mientras bajan los cuadros, muestra el más cercano que ya cargó.
      let index = frames.length === 1 ? 0 : Math.round(p * (frames.length - 1));
      // Un cuadro que no cargó (error de red) queda "complete" pero sin tamaño: dibujarlo lanza un error.
      const ready = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;
      while (index > 0 && !ready(frames[index])) index -= 1;
      if (!ready(frames[index]) || (!force && index === drawn)) return;
      paint(frames[index]);
      drawn = index;
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(() => draw());
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      draw(true);
    };
    const load = () => {
      frames.forEach((frame) => { frame.onload = null; });
      frames = [];
      drawn = -1;
      if (!started) return;
      const set: FrameSet = vertical.matches ? "cel" : "web";
      const indexes = reducedMotion.matches ? (stillIndex === null ? [] : [stillIndex]) : Array.from({ length: count }, (_, index) => index);
      canvas.hidden = indexes.length === 0;
      frames = indexes.map((index) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => (frames.length === 1 ? draw(true) : schedule());
        image.src = src(set, index);
        return image;
      });
      resize();
    };

    let observer: IntersectionObserver | null = null;
    if (lazy && typeof window.IntersectionObserver === "function") {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        started = true;
        observer?.disconnect();
        load();
      }, { rootMargin: "150% 0px" });
      observer.observe(section);
    } else {
      started = true;
    }

    load();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    vertical.addEventListener("change", load);
    reducedMotion.addEventListener("change", load);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      vertical.removeEventListener("change", load);
      reducedMotion.removeEventListener("change", load);
      if (raf) window.cancelAnimationFrame(raf);
      frames.forEach((frame) => { frame.onload = null; });
    };
  }, [sectionRef, canvasRef, count, src, fit, stillIndex, lazy]);
}
