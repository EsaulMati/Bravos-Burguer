"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ADDONS_DATA } from "@/src/data/featured-products";
import { CART_QUANTITY_LIMIT, DRINK_NAMES } from "@/src/lib/cart";
import { SAUCE_CHOICES, isSauceActive, sauceChoiceLabel, toggleSauce } from "@/src/components/landing/SelectionControls";
import type { DrinkCounts, DrinkSelection, SauceSelection } from "@/src/types/landing";

const friesPrice = ADDONS_DATA.find((addon) => addon.id === "fries")?.price ?? 0;
const drinkPrice = ADDONS_DATA.find((addon) => addon.id === "drink")?.price ?? 0;
const EASE = [0.32, 0.72, 0, 1] as const;

const money = (value: number) => `S/ ${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)}`;

/** Lo que el panel necesita mostrar: sirve igual para una burger que para un combo. */
export interface SheetProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  /** Texto chico sobre el nombre, por ejemplo "Combo". */
  label?: string;
  /** Precio tachado junto al precio, cuando hay ahorro. */
  regularPrice?: number;
  /** Las burgers sueltas ofrecen gaseosa y papas extra; los combos solo piden la salsa. */
  withExtras: boolean;
  /** Gaseosas que trae el combo (sin costo extra): el cliente las reparte con + y −. */
  drinkCount?: number;
  /** Frase corta debajo del nombre. */
  subtitle?: string;
}

export interface SheetSelection { sauce: SauceSelection; drink: DrinkSelection; drinkCounts: DrinkCounts; extraFries: boolean; notes: string; quantity: number }

interface Props {
  product: SheetProduct | null;
  onClose: () => void;
  /** Devuelve true si el producto entró al carrito; así el panel se cierra solo. */
  onAdd: (product: SheetProduct, selection: SheetSelection) => boolean;
}

/* Panel del producto, al estilo de las apps de delivery: foto arriba, opciones por grupos y el botón con el total fijo abajo.
   En celular sube desde abajo; en computadora aparece al centro. El fondo queda borroso detrás. */
export function BurgerSheet({ product, onClose, onAdd }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {product && (
        <motion.div key="burger-sheet" className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
          <motion.button type="button" aria-label="Cerrar" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .2 } }} transition={{ duration: .3 }}
            className="absolute inset-0 h-full w-full bg-[#0c0806]/55 backdrop-blur-md" />
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%", transition: { duration: .25, ease: EASE } }}
            transition={{ duration: .4, ease: EASE }}
            className="relative w-full md:max-w-lg"
          >
            <SheetBody key={product.id} product={product} onClose={onClose} onAdd={onAdd} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ product, onClose, onAdd }: { product: SheetProduct; onClose: () => void; onAdd: Props["onAdd"] }) {
  const [sauce, setSauce] = useState<SauceSelection>(null);
  const [drink, setDrink] = useState<DrinkSelection>(null);
  const [drinkCounts, setDrinkCounts] = useState<DrinkCounts>({});
  const [extraFries, setExtraFries] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sauceError, setSauceError] = useState(false);
  const [drinkError, setDrinkError] = useState(false);
  const drinkRef = useRef<HTMLFieldSetElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sauceRef = useRef<HTMLFieldSetElement>(null);

  // En un combo con gaseosa incluida, elegirla no suma nada al precio.
  const unit = product.price + (product.withExtras && extraFries ? friesPrice : 0) + (product.withExtras && drink ? drinkPrice : 0);
  const drinkTotal = DRINK_NAMES.reduce((sum, name) => sum + (drinkCounts[name] ?? 0), 0);
  const drinksMissing = (product.drinkCount ?? 0) - drinkTotal;
  const ready = Boolean(sauce) && drinksMissing === 0;

  // Mientras el panel está abierto: sin scroll detrás, Escape cierra y Tab no se sale del panel.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  const submit = () => {
    if (!sauce) {
      setSauceError(true);
      sauceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (drinksMissing > 0) {
      setDrinkError(true);
      drinkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const added = onAdd(product, { sauce, drink, drinkCounts, extraFries, notes: notes.trim(), quantity });
    if (added) onClose();
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="burger-sheet-title"
      className="flex max-h-[92svh] flex-col overflow-hidden rounded-t-[1.75rem] bg-[#FBF6EE] text-[#16110E] shadow-[0_-20px_60px_rgba(0,0,0,.35)] md:max-h-[88vh] md:rounded-[1.75rem]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-[16/10] w-full bg-[#1c120d]">
          <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 767px) 100vw, 512px" className="object-cover" priority />
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar"
            className="tap absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-[#FBF6EE] text-[#16110E] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 md:hidden" />
        </div>

        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.label && <p className="mb-1 font-dosis text-xs font-bold uppercase tracking-[.14em] text-[#B35629]">{product.label}</p>}
              <h2 id="burger-sheet-title" className="font-serif text-3xl leading-none">{product.name}</h2>
              {product.subtitle && <p className="mt-1.5 font-brush text-xl leading-none text-[#B35629]">{product.subtitle}</p>}
            </div>
            <p className="shrink-0 text-right font-serif text-3xl leading-none tabular-nums text-[#B35629]">
              {product.regularPrice && <span className="mb-1 block font-sans text-sm text-[#8c7b6b] line-through">{money(product.regularPrice)}</span>}
              {money(product.price)}
            </p>
          </div>
          <p className="mt-2 text-[.9375rem] leading-relaxed text-[#6B5D52]">{product.description}</p>
        </div>

        <OptionGroup ref={sauceRef} title="Elige tu salsa" hint={product.withExtras ? "Para tus papas · puedes elegir varias" : "Para las papas del combo · puedes elegir varias"} required error={sauceError ? "Elige una salsa para continuar" : undefined}>
          {SAUCE_CHOICES.map((option) => (
            <OptionRow key={option} type="checkbox" name="salsa" label={sauceChoiceLabel(option)} checked={isSauceActive(sauce, option)}
              onChange={() => { setSauce((current) => toggleSauce(current, option)); setSauceError(false); }} />
          ))}
        </OptionGroup>

        {product.drinkCount && (
          <OptionGroup ref={drinkRef} title="Elige tus gaseosas" required
            hint={drinksMissing > 0 ? `Incluidas en el combo · te ${drinksMissing === 1 ? "falta 1" : `faltan ${drinksMissing}`}` : "Incluidas en el combo · listo"}
            error={drinkError ? `Elige ${product.drinkCount} gaseosas para continuar` : undefined}>
            {DRINK_NAMES.map((name) => (
              <CountRow key={name} label={name} value={drinkCounts[name] ?? 0} canAdd={drinksMissing > 0}
                onChange={(next) => { setDrinkCounts((current) => ({ ...current, [name]: next })); setDrinkError(false); }} />
            ))}
          </OptionGroup>
        )}

        {product.withExtras && <>
        <OptionGroup title="¿Algo para tomar?" hint="Elige 1">
          {DRINK_NAMES.map((option) => (
            <OptionRow key={option} type="radio" name="gaseosa" label={option} price={drinkPrice} checked={drink === option}
              onChange={() => setDrink((current) => (current === option ? null : option))} />
          ))}
        </OptionGroup>

        <OptionGroup title="Extras" hint="Opcional">
          <OptionRow type="checkbox" name="extras" label="Papas extra" price={friesPrice} checked={extraFries} onChange={() => setExtraFries((current) => !current)} />
        </OptionGroup>
        </>}

        <div className="px-5 pb-6 pt-2">
          <label htmlFor="burger-sheet-notes" className="font-dosis text-base font-semibold">Indicaciones <span className="font-normal text-[#8c7b6b]">· opcional</span></label>
          <textarea id="burger-sheet-notes" value={notes} maxLength={200} rows={2} onChange={(event) => setNotes(event.target.value)} placeholder="Sin cebolla, salsa aparte…"
            className="mt-2 w-full resize-none rounded-xl border border-[#16110E]/15 bg-white px-4 py-3 text-[.9375rem] outline-none placeholder:text-[#a8988a] focus:border-[#B35629] focus:ring-2 focus:ring-[#B35629]/25" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-[#16110E]/10 bg-[#FBF6EE] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="inline-flex items-center rounded-full border border-[#16110E]/15 bg-white p-1">
          <button type="button" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label={`Quitar uno de ${product.name}`}
            className="tap grid size-10 place-items-center rounded-full text-xl font-bold disabled:text-[#16110E]/25">−</button>
          <output aria-label={`Cantidad: ${quantity}`} className="min-w-8 text-center text-lg font-semibold tabular-nums">{quantity}</output>
          <button type="button" disabled={quantity >= CART_QUANTITY_LIMIT} onClick={() => setQuantity((current) => Math.min(CART_QUANTITY_LIMIT, current + 1))} aria-label={`Agregar uno de ${product.name}`}
            className="tap grid size-10 place-items-center rounded-full text-xl font-bold disabled:text-[#16110E]/25">+</button>
        </div>
        <button type="button" onClick={submit}
          className={`tap flex min-h-12 flex-1 items-center justify-between gap-3 rounded-full px-5 font-sans text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629] focus-visible:ring-offset-2 ${ready ? "bg-[#B35629] hover:bg-[#9E4A22]" : "bg-[#B35629]/55"}`}>
          <span>Agregar</span>
          <span className="tabular-nums">{money(unit * quantity)}</span>
        </button>
      </div>
    </div>
  );
}

function OptionGroup({ ref, title, hint, required = false, error, children }: { ref?: React.Ref<HTMLFieldSetElement>; title: string; hint: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <fieldset ref={ref} className="border-0 p-0">
      <legend className="w-full">
        <span className={`flex w-full items-center justify-between gap-3 px-5 py-3 transition-colors ${error ? "bg-[#fde3d8]" : "bg-[#F1E7D8]"}`}>
          <span>
            <span className="block font-dosis text-lg font-semibold leading-tight">{title}</span>
            <span className={`block text-xs ${error ? "font-semibold text-[#b3261e]" : "text-[#8c7b6b]"}`}>{error ?? hint}</span>
          </span>
          {required && <span className={`shrink-0 rounded-md px-2 py-1 text-[.6875rem] font-bold uppercase tracking-[.06em] ${error ? "bg-[#b3261e] text-white" : "bg-[#16110E] text-[#F3E9D6]"}`}>Obligatorio</span>}
        </span>
      </legend>
      <div className="divide-y divide-[#16110E]/[.08] px-5">{children}</div>
    </fieldset>
  );
}

function OptionRow({ type, name, label, price, checked, onChange }: { type: "checkbox" | "radio"; name: string; label: string; price?: number; checked: boolean; onChange: () => void }) {
  const round = type === "radio";
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
      <span className="flex-1 text-[.9375rem]">{label}</span>
      {price !== undefined && <span className="text-sm text-[#6B5D52] tabular-nums">+{money(price)}</span>}
      {/* Las gaseosas se desmarcan tocando otra vez: el click va directo para que un radio también pueda apagarse. */}
      <input type={type === "radio" ? "checkbox" : type} role={round ? "radio" : undefined} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#B35629] peer-focus-visible:ring-offset-2 ${round ? "rounded-full" : "rounded-md"} ${checked ? "border-[#B35629] bg-[#B35629] text-white" : "border-[#16110E]/30 bg-white"}`}>
        {checked && (round
          ? <span className="size-2.5 rounded-full bg-white" />
          : <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>)}
      </span>
    </label>
  );
}

/* Fila con contador: para repartir las gaseosas del combo (2 Coca-Cola, 2 Inca Kola o una de cada una). */
function CountRow({ label, value, canAdd, onChange }: { label: string; value: number; canAdd: boolean; onChange: (value: number) => void }) {
  return (
    <div className="flex min-h-14 items-center gap-3 py-2">
      <span className="flex-1 text-[.9375rem]">{label}</span>
      <div className="inline-flex items-center rounded-full border border-[#16110E]/15 bg-white p-0.5">
        <button type="button" disabled={value <= 0} onClick={() => onChange(value - 1)} aria-label={`Quitar una ${label}`}
          className="tap grid size-9 place-items-center rounded-full text-lg font-bold text-[#B35629] disabled:text-[#16110E]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629]">−</button>
        <output aria-label={`${label}: ${value}`} className="min-w-7 text-center font-semibold tabular-nums">{value}</output>
        <button type="button" disabled={!canAdd} onClick={() => onChange(value + 1)} aria-label={`Agregar una ${label}`}
          className="tap grid size-9 place-items-center rounded-full text-lg font-bold text-[#B35629] disabled:text-[#16110E]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B35629]">+</button>
      </div>
    </div>
  );
}
