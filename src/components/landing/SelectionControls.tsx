"use client";

import { SAUCES } from "@/src/lib/cart";
import type { DrinkSelection, SauceName, SauceSelection } from "@/src/types/landing";

/* Opciones chicas en una sola fila. Reemplazan los botones grandes que agrandaban el panel. */
/** hideLabel: la etiqueta queda solo para lectores de pantalla, cuando el contexto ya dice qué se elige. */
type Tone = { light?: boolean; hideLabel?: boolean };

/** Salsas para las papas: se pueden marcar varias; "Sin salsa" desmarca las demás. */
export function toggleSauce(current: SauceSelection, option: SauceName | "Ninguna"): SauceSelection {
  if (option === "Ninguna") return current === "Ninguna" ? null : "Ninguna";
  const selected = Array.isArray(current) ? current : [];
  const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
  return next.length > 0 ? SAUCES.filter((sauce) => next.includes(sauce)) : null;
}

export function isSauceActive(current: SauceSelection, option: SauceName | "Ninguna") {
  return option === "Ninguna" ? current === "Ninguna" : Array.isArray(current) && current.includes(option);
}

export const SAUCE_CHOICES = [...SAUCES, "Ninguna"] as const;
export const sauceChoiceLabel = (option: (typeof SAUCE_CHOICES)[number]) => (option === "Ninguna" ? "Sin salsa" : option);

export function SauceSelector({ value, onChange, light = false, hideLabel = false, label = "Salsa" }: Tone & { value: SauceSelection; onChange: (value: SauceSelection) => void; label?: string }) {
  return (
    <ChipRow label={`${label} (puedes elegir varias)`} shortLabel={label} light={light} hideLabel={hideLabel} columns={4} multiple>
      {SAUCE_CHOICES.map((option) => (
        <Chip key={option} multiple light={light} active={isSauceActive(value, option)} onClick={() => onChange(toggleSauce(value, option))}>{sauceChoiceLabel(option)}</Chip>
      ))}
    </ChipRow>
  );
}

export function DrinkSelector({ value, onChange, light = false, hideLabel = false }: Tone & { value: DrinkSelection; onChange: (value: Exclude<DrinkSelection, null>) => void }) {
  return (
    <ChipRow label="Gaseosa" shortLabel="Gaseosa" light={light} hideLabel={hideLabel} columns={2}>
      {(["Coca-Cola", "Inca Kola"] as const).map((option) => (
        <Chip key={option} light={light} active={value === option} onClick={() => onChange(option)}>{option}</Chip>
      ))}
    </ChipRow>
  );
}

function ChipRow({ label, shortLabel, light, hideLabel, columns, multiple = false, children }: { label: string; shortLabel: string; light: boolean; hideLabel: boolean; columns: 2 | 4; multiple?: boolean; children: React.ReactNode }) {
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
      {!hideLabel && <span aria-hidden="true" className={`shrink-0 font-dosis sm:w-14 text-xs font-bold uppercase tracking-[.1em] ${light ? "text-[#704126]" : "text-[#bca58c]"}`}>{shortLabel}</span>}
      <div className={`grid min-w-0 flex-1 gap-1.5 ${columns === 4 ? "grid-cols-4" : "grid-cols-2"}`}>{children}</div>
    </div>
  );
}

export function Chip({ active, light, multiple = false, onClick, children, className = "" }: { active: boolean; light: boolean; multiple?: boolean; onClick: () => void; children: string; className?: string }) {
  const idle = light ? "bg-[#16110E]/[.06] text-[#3b2417] hover:bg-[#16110E]/[.11]" : "bg-white/[.06] text-[#e7d6c0] hover:bg-white/[.11]";
  // Varias a la vez se anuncian como botones que se presionan; una sola, como radio.
  const state = multiple ? { "aria-pressed": active } : { role: "radio", "aria-checked": active };
  return (
    <button type="button" {...state} onClick={onClick}
      className={`tap bravos-chip min-w-0 truncate rounded-full px-1.5 text-[.8125rem] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E] ${active ? "bg-[#B35629] text-white" : idle} ${className}`}>
      {children}
    </button>
  );
}
