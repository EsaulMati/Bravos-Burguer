import Image from "next/image";
import { SHARE_COMBOS } from "@/src/data/featured-products";

interface ComboShowcaseProps {
  quantities: Record<string, number>;
  onQuantityChange: (comboId: string, quantity: number) => void;
  onAddCombo: (comboId: string) => void;
  feedback: Record<string, string>;
}

export function ComboShowcase({ quantities, onQuantityChange, onAddCombo, feedback }: ComboShowcaseProps) {
  return (
    <section id="combos" aria-labelledby="combos-title" className="combo-stage relative overflow-hidden px-4 py-14 sm:px-6 sm:py-16">
      <Image src="/Burger_advertising_set_design_2K_202608312000.jpeg" alt="" fill sizes="100vw" className="object-cover object-[center_82%]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,10,7,.32),rgba(16,10,7,.04)_45%,rgba(16,10,7,.58))]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-xl"><h2 id="combos-title" className="font-serif text-4xl font-bold leading-none text-[#fff4df] sm:text-6xl">Para la manchita</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-[#f4ddbd] sm:text-base">Cuando llegan todos, la mesa se sirve en grande.</p></div>
        <div className="mt-8 grid items-end gap-7 md:grid-cols-2 md:gap-10">
          {SHARE_COMBOS.map((combo, index) => (
            <article key={combo.id} className="relative flex min-h-[20rem] flex-col justify-end md:min-h-[24rem]">
              <div className={`absolute inset-x-0 bottom-14 top-0 ${index === 0 ? "md:-right-10" : "md:-left-10"}`}><Image src={combo.image} alt={combo.name} fill sizes="(max-width: 768px) 96vw, 50vw" className="object-contain object-bottom drop-shadow-[0_28px_24px_rgba(28,12,4,.58)]" /></div>
              <div className="relative border-t border-[#e9b66b]/40 pt-4 text-[#fff4df]"><div className="flex items-end justify-between gap-4"><div><h3 className="font-serif text-2xl font-bold sm:text-3xl">{combo.name}</h3><p className="mt-1 text-sm text-[#ead4b5]">{combo.description}</p></div><span className="shrink-0 font-dosis text-2xl font-bold tabular-nums text-[#f4b35d]">S/ {combo.price}</span></div>
                <div className="mt-4 flex flex-wrap items-center gap-3"><div className="inline-flex min-h-11 items-center rounded-full bg-[#1c120d]/85 p-1 ring-1 ring-[#e9b66b]/30" aria-label={`Cantidad de ${combo.name}`}><button type="button" aria-label={`Disminuir cantidad de ${combo.name}`} onClick={() => onQuantityChange(combo.id, Math.max(1, (quantities[combo.id] ?? 1) - 1))} className="grid size-11 place-items-center rounded-full text-lg text-[#f2d3a5] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e]">−</button><span className="min-w-8 text-center font-dosis text-lg font-bold tabular-nums text-[#fff4df]" aria-live="polite">{quantities[combo.id] ?? 1}</span><button type="button" aria-label={`Aumentar cantidad de ${combo.name}`} onClick={() => onQuantityChange(combo.id, Math.min(10, (quantities[combo.id] ?? 1) + 1))} className="grid size-11 place-items-center rounded-full text-lg text-[#f2d3a5] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e]">+</button></div><button type="button" onClick={() => onAddCombo(combo.id)} className="min-h-11 rounded-full bg-[#c96325] px-5 font-dosis text-base font-bold text-white transition-colors hover:bg-[#e07731] active:bg-[#a84c18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c120d]">Añadir</button></div>
                {feedback[combo.id] && <p aria-live="polite" className="mt-2 text-xs text-[#b8d9b4]">{feedback[combo.id]}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
