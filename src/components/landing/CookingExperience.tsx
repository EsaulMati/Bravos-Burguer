"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useMobileViewport } from "@/src/hooks/useMobileViewport";
import { MobileCookingExperience } from "./MobileCookingExperience";

const RAW_IMAGE = "/bravos-fondo-parrilla-cocina-cruda.webp";
const COOKED_IMAGE = "/bravos-fondo-parrilla-cocina-cocida.webp";
const INITIAL_TEMPERATURE = 25;
const FINAL_TEMPERATURE = 160;

export function CookingExperience() {
  const isMobile = useMobileViewport();
  return isMobile ? <MobileCookingExperience /> : <DesktopCookingExperience />;
}

function DesktopCookingExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [temperature, setTemperature] = useState(
    reduceMotion ? FINAL_TEMPERATURE : INITIAL_TEMPERATURE
  );
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawOpacity = useTransform(scrollYProgress, [0, 0.6, 0.85, 1], [1, 1, 0, 0]);
  const cookedOpacity = useTransform(scrollYProgress, [0, 0.6, 0.85, 1], [0, 0, 1, 1]);
  const thermometerFill = useTransform(scrollYProgress, [0, 1], [0.08, 1]);
  const finalCopyOpacity = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!reduceMotion) {
      const next = progress >= 0.999
        ? FINAL_TEMPERATURE
        : Math.min(FINAL_TEMPERATURE - 1, Math.round(INITIAL_TEMPERATURE + 134 * progress));
      setTemperature(next);
    }
  });

  const displayedTemperature = reduceMotion ? FINAL_TEMPERATURE : temperature;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cooking-experience-title"
      className={`cooking-scroll-section ${reduceMotion ? "cooking-scroll-section--reduced" : ""}`}
    >
      <div className="cooking-sticky-scene">
        <div className="absolute inset-0 bg-[#0a0705]">
          <motion.div
            className="absolute inset-0 will-change-[opacity]"
            style={{ opacity: reduceMotion ? 0 : rawOpacity }}
          >
            <Image
              src={RAW_IMAGE}
              alt="Cuatro carnes crudas sobre la parrilla de Bravos"
              fill
              sizes="100vw"
              className="cooking-scene-image"
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 will-change-[opacity]"
            style={{ opacity: reduceMotion ? 1 : cookedOpacity }}
          >
            <Image
              src={COOKED_IMAGE}
              alt=""
              fill
              sizes="100vw"
              className="cooking-scene-image"
            />
          </motion.div>
        </div>

        <div className="cooking-scene-shade" aria-hidden="true" />

        <div className="absolute inset-x-0 top-[14%] z-10 mx-auto max-w-7xl px-5 sm:top-[16%] sm:px-8 lg:px-12">
          <motion.p
            id="cooking-experience-title"
            className="absolute left-5 top-0 max-w-[12ch] font-serif text-4xl font-bold leading-[0.95] text-[#fff1df] drop-shadow-[0_3px_18px_rgba(0,0,0,.75)] sm:left-8 sm:text-6xl lg:left-12 lg:text-7xl"
            style={{ opacity: reduceMotion ? 1 : finalCopyOpacity }}
          >
            Listas para ser Bravos a lo bravo.
          </motion.p>
        </div>

        <div className="cooking-thermometer" aria-label={`Temperatura visual: ${displayedTemperature} grados Celsius`}>
          <div className="cooking-temperature" aria-hidden="true">
            <span>{displayedTemperature}</span>
            <span className="text-[.45em] align-top">°C</span>
          </div>
          <div className="cooking-thermometer-body" aria-hidden="true">
            <span className="cooking-thermometer-mark cooking-thermometer-mark--one" />
            <span className="cooking-thermometer-mark cooking-thermometer-mark--two" />
            <span className="cooking-thermometer-mark cooking-thermometer-mark--three" />
            <motion.span
              className="cooking-thermometer-fill"
              style={{ scaleY: reduceMotion ? 1 : thermometerFill }}
            />
          </div>
          <div className="cooking-thermometer-bulb" aria-hidden="true" />
          <span className="mt-4 text-[.58rem] font-semibold uppercase tracking-[.2em] text-[#e2c4a4]">
            Temperatura visual
          </span>
        </div>
      </div>
    </section>
  );
}
