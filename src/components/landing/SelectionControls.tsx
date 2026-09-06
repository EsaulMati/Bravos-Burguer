"use client";

import Image from "next/image";
import type { DrinkSelection, SauceName, SauceSelection } from "@/src/types/landing";

export function SauceSelector({ value, onChange, light = false }: { value: SauceSelection; onChange: (value: SauceSelection) => void; light?: boolean }) {
  const options = [{ value: "Ranchera" as const, image: "/bravos-salsa-ranchera.png.png" }, { value: "Tártara" as const, image: "/bravos-salsa-tartara.png.png" }, { value: "Ninguna" as const }];
  const toggle = (option: SauceName | "Ninguna") => {
    if (option === "Ninguna") { onChange("Ninguna"); return; }
    const selected = Array.isArray(value) ? value : [];
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
    onChange(next.length > 0 ? next : null);
  };
  return <fieldset className="min-w-0"><legend className={`mb-2 font-dosis text-xs font-bold uppercase tracking-[.12em] ${light ? "text-[#704126]" : "text-[#d9b48e]"}`}>Salsas para las papas</legend><div className="grid grid-cols-3 gap-2">{options.map((option) => { const active = option.value === "Ninguna" ? value === "Ninguna" : Array.isArray(value) && value.includes(option.value); return <button key={option.value} type="button" aria-pressed={active} onClick={() => toggle(option.value)} className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-bold transition-colors ${active ? "border-[#d56c2b] bg-[#d56c2b] text-white" : light ? "border-[#8f5a39]/25 bg-white/35 text-[#4d2b18]" : "border-white/15 bg-black/20 text-[#f0d9bd]"}`}>{option.image && <span className="relative hidden size-7 shrink-0 min-[390px]:block"><Image src={option.image} alt="" fill sizes="28px" className="object-contain" /></span>}<span className="truncate">{option.value}</span></button>; })}</div></fieldset>;
}

export function DrinkSelector({ value, onChange, light = false }: { value: DrinkSelection; onChange: (value: Exclude<DrinkSelection, null>) => void; light?: boolean }) {
  return <fieldset className="min-w-0"><legend className={`mb-2 font-dosis text-xs font-bold uppercase tracking-[.12em] ${light ? "text-[#704126]" : "text-[#d9b48e]"}`}>Elige tu gaseosa</legend><div className="grid grid-cols-2 gap-2">{(["Coca-Cola", "Inca Kola"] as const).map((option) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={`min-h-11 rounded-xl border px-3 text-sm font-bold transition-colors ${value === option ? "border-[#d56c2b] bg-[#d56c2b] text-white" : light ? "border-[#8f5a39]/25 bg-white/35 text-[#4d2b18]" : "border-white/15 bg-black/20 text-[#f0d9bd]"}`}>{option}</button>)}</div></fieldset>;
}
