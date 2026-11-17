"use client";

import { SAUCES } from "@/src/lib/cart";
import type { SauceName, SauceSelection } from "@/src/types/landing";

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
