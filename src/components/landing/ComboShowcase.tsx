"use client";
import Image from "next/image";
import { useState } from "react";
import { SHARE_COMBOS } from "@/src/data/featured-products";
import { SauceSelector } from "./SelectionControls";
import type { SauceSelection } from "@/src/types/landing";

interface Props { quantities: Record<string, number>; onQuantityChange: (id: string, quantity: number) => void; onAddCombo: (id: string, sauce: SauceSelection) => boolean }

export function ComboShowcase({ quantities, onQuantityChange, onAddCombo }: Props) {
  const [sauces, setSauces] = useState<Record<string, SauceSelection>>({ "ya-pagaron-x3": null, "ya-pagaron-x4": null });
  return <section id="combos" aria-labelledby="combos-title" className="combo-stage relative scroll-mt-24 overflow-hidden px-4 py-14 sm:px-6 sm:py-16">
    <Image src="/bravos-mobile-para-la-manchita.png.jpeg" alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center md:hidden" />
    <Image src="/Burger_advertising_set_design_2K_202608312000.jpeg" alt="" fill sizes="100vw" className="pointer-events-none hidden object-cover object-[center_82%] md:block" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,10,7,.38),rgba(16,10,7,.03)_45%,rgba(16,10,7,.62))]" />
    <div className="relative mx-auto max-w-6xl">
      <div className="max-w-xl"><h2 id="combos-title" className="font-serif text-4xl font-bold leading-none text-[#fff4df] sm:text-6xl">Para la Manchita</h2><p className="mt-4 max-w-md text-sm text-[#f4ddbd] sm:text-base">Cuando llegan todos, la mesa se sirve en grande.</p></div>
      <div className="mt-8 grid items-end gap-8 md:grid-cols-2 md:gap-10">{SHARE_COMBOS.map((combo, index) => <article key={combo.id} className="relative flex min-h-[72svh] flex-col justify-end md:min-h-[24rem]">
        <div className={`absolute inset-x-0 bottom-52 top-0 ${index === 0 ? "md:-right-10" : "md:-left-10"}`}><Image src={combo.image} alt={combo.name} fill sizes="(max-width: 767px) 92vw, 50vw" className="object-contain object-bottom drop-shadow-[0_28px_24px_rgba(28,12,4,.58)]" /></div>
        <div className="relative z-10 border-t border-[#e9b66b]/40 bg-[#170e09]/72 p-4 text-[#fff4df] backdrop-blur-sm md:bg-transparent md:p-0 md:pt-4 md:backdrop-blur-none">
          <div className="flex items-end justify-between gap-4"><div><h3 className="font-serif text-2xl font-bold sm:text-3xl">{combo.name}</h3><p className="mt-1 text-sm text-[#ead4b5]">{combo.description}</p></div><span className="shrink-0 font-dosis text-2xl font-bold text-[#f4b35d]">S/ {combo.price}</span></div>
          <div className="mt-4"><SauceSelector value={sauces[combo.id]} onChange={(sauce) => setSauces((current) => ({ ...current, [combo.id]: sauce }))} /></div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><div className="inline-flex min-h-11 items-center rounded-full bg-[#1c120d]/85 p-1 ring-1 ring-[#e9b66b]/30"><button type="button" aria-label={`Disminuir cantidad de ${combo.name}`} onClick={() => onQuantityChange(combo.id, Math.max(1, (quantities[combo.id] ?? 1) - 1))} className="grid size-11 place-items-center rounded-full">−</button><span className="min-w-8 text-center font-dosis text-lg font-bold">{quantities[combo.id] ?? 1}</span><button type="button" aria-label={`Aumentar cantidad de ${combo.name}`} onClick={() => onQuantityChange(combo.id, Math.min(10, (quantities[combo.id] ?? 1) + 1))} className="grid size-11 place-items-center rounded-full">+</button></div><button type="button" onClick={() => { if (onAddCombo(combo.id, sauces[combo.id])) setSauces((current) => ({ ...current, [combo.id]: null })); }} className="min-h-11 rounded-full bg-[#c96325] px-5 font-dosis font-bold text-white">Añadir</button></div>
        </div>
      </article>)}</div>
    </div>
  </section>;
}
