"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SHARE_COMBOS } from "@/src/data/featured-products";
import { Chip, SAUCE_CHOICES, isSauceActive, sauceChoiceLabel, toggleSauce } from "./SelectionControls";
import { QuantityControl } from "./order-builder/QuantityControl";
import type { SauceSelection } from "@/src/types/landing";

interface Props { quantities: Record<string, number>; onQuantityChange: (id: string, quantity: number) => void; onAddCombo: (id: string, sauce: SauceSelection) => boolean }
type Combo = (typeof SHARE_COMBOS)[number];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/* Para la manchita: igual que "Arma tu pedido", ocupa una pantalla bajo la cabecera y todo se ve sin bajar.
   En celular se ve un combo a la vez (se cambia con las pestañas x3 / x4). */
export function ComboShowcase({ quantities, onQuantityChange, onAddCombo }: Props) {
  const [active, setActive] = useState<string>(SHARE_COMBOS[0].id);
  return (
    <section id="combos" aria-labelledby="combos-title" className="combo-stage combo-screen bravos-section-cream relative flex flex-col justify-center overflow-hidden px-4 sm:px-6">
      <div className="relative mx-auto w-full max-w-6xl py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2 id="combos-title" className="font-brush text-[2.6rem] leading-[1] sm:text-5xl lg:text-[4rem]">Para la manchita</h2>
          <p className="max-w-sm text-[.9375rem] leading-relaxed text-[#6B5D52] md:text-right md:text-base">Combos con papas para compartir. ¿Vienen todos? Ya pagaron.</p>
        </div>
        <div role="tablist" aria-label="Elige el combo" className="mt-4 grid grid-cols-2 gap-1.5 rounded-full bg-[#16110E]/[.07] p-1 md:hidden">
          {SHARE_COMBOS.map((combo) => (
            <button key={combo.id} type="button" role="tab" aria-selected={active === combo.id} aria-controls={`combo-${combo.id}`} onClick={() => setActive(combo.id)}
              className={`tap min-h-11 rounded-full text-sm font-semibold transition-colors ${active === combo.id ? "bg-[#16110E] text-[#F3E9D6]" : "text-[#3b2417]"}`}>
              {combo.name.replace("Ya Pagaron ", "Para ")}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-10 md:mt-6 md:grid-cols-2 lg:gap-14">
          {SHARE_COMBOS.map((combo) => (
            <ComboCard key={combo.id} combo={combo} hiddenOnMobile={active !== combo.id} quantity={quantities[combo.id] ?? 1} onQuantityChange={(quantity) => onQuantityChange(combo.id, quantity)} onAdd={(sauce) => onAddCombo(combo.id, sauce)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComboCard({ combo, hiddenOnMobile, quantity, onQuantityChange, onAdd }: { combo: Combo; hiddenOnMobile: boolean; quantity: number; onQuantityChange: (quantity: number) => void; onAdd: (sauce: SauceSelection) => boolean }) {
  const [picking, setPicking] = useState(false);
  const [sauce, setSauce] = useState<SauceSelection>(null);
  const [added, setAdded] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);
  // Con AnimatePresence mode="wait" el panel de salsas aparece recién cuando sale el botón:
  // el foco se pone al montarse el panel, no al cambiar el estado.
  const focusFirstSauce = useCallback((node: HTMLDivElement | null) => {
    if (node) window.requestAnimationFrame(() => node.querySelector<HTMLButtonElement>("[aria-pressed]")?.focus());
  }, []);

  const confirm = () => {
    if (!sauce || !onAdd(sauce)) return;
    setPicking(false);
    setSauce(null);
    setAdded(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAdded(false), 1600);
    window.requestAnimationFrame(() => addRef.current?.focus());
  };
  // MotionProvider (reducedMotion="user") ya quita el desplazamiento a quien pide menos movimiento.
  const swap = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

  return (
    <article id={`combo-${combo.id}`} role="tabpanel" aria-label={combo.name} className={`min-w-0 ${hiddenOnMobile ? "max-md:hidden" : ""}`}>
      <div className="combo-photo relative"><Image src={combo.image} alt={combo.name} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 44vw, 544px" className="object-contain drop-shadow-[0_24px_20px_rgba(22,17,14,.28)]" /></div>
      <div className="combo-details mt-3 border-t-2 pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-3xl leading-none sm:text-[2.1rem]">{combo.name}</h3>
          <span className="shrink-0 font-serif text-4xl leading-none text-[#B35629]">S/ {combo.price}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6B5D52]">{combo.description}</p>
        <div className="mt-3 min-h-[3.25rem]" onKeyDown={(event) => { if (event.key === "Escape" && picking) { setPicking(false); addRef.current?.focus(); } }}>
          <AnimatePresence mode="wait" initial={false}>
            {picking ? (
              <motion.div key="pick" ref={focusFirstSauce} {...swap} transition={{ duration: .18, ease: EASE_OUT }}>
                <div className="flex items-center justify-between gap-2">
                  <span id={`salsa-${combo.id}`} className="font-dosis text-xs font-bold uppercase tracking-[.1em] text-[#704126]">Salsas para las papas · elige una o varias</span>
                  <button type="button" aria-label="Cancelar" onClick={() => { setPicking(false); setSauce(null); addRef.current?.focus(); }} className="tap -my-2 inline-flex size-9 items-center justify-center rounded-full text-lg text-[#6B5D52] hover:bg-[#16110E]/[.07]">×</button>
                </div>
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div role="group" aria-labelledby={`salsa-${combo.id}`} className="flex flex-1 flex-wrap gap-1.5">
                    {SAUCE_CHOICES.map((option) => (
                      <Chip key={option} light multiple active={isSauceActive(sauce, option)} onClick={() => setSauce((current) => toggleSauce(current, option))}>{sauceChoiceLabel(option)}</Chip>
                    ))}
                  </div>
                  <button type="button" disabled={!sauce} onClick={confirm} className="combo-add bravos-fill min-h-11 shrink-0 rounded-full px-5 font-sans text-[.9375rem] font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9">
                    Agregar
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="add" {...swap} transition={{ duration: .18, ease: EASE_OUT }} className="flex items-center gap-3">
                <QuantityControl light label={combo.name} value={quantity} onChange={onQuantityChange} />
                <button ref={addRef} type="button" aria-haspopup="true" aria-expanded={picking} onClick={() => setPicking(true)} className="combo-add bravos-fill min-h-12 flex-1 rounded-full font-sans font-semibold">
                  {added ? "Agregado al carrito ✓" : "Agregar al carrito"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}
