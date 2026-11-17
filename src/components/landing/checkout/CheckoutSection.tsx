"use client";

import { useEffect, useRef, useState } from "react";
import { BRAVOS_WHATSAPP_COUNTRY_CODE, BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";
import { CHECKOUT_STORAGE_KEY, INITIAL_CHECKOUT_DRAFT, buildMapsUrl, normalizeCheckout, normalizePeruvianPhone, serializeCheckout, validateCheckout } from "@/src/lib/checkout";
import { createOrderCode, getStoreStatus } from "@/src/lib/schedule";
import { StoreStatusBadge } from "@/src/components/StoreStatusBadge";
import { useStoreStatus } from "@/src/hooks/useStoreStatus";
import Link from "next/link";
import { buildOrderMessage, buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/src/lib/order-message";
import { CART_STORAGE_KEY, calculateCartTotal, isCatalogCartItem } from "@/src/lib/cart";
import type { CartItem, CheckoutDraft, CheckoutErrors, PaymentMethod } from "@/src/types/landing";
import { CheckoutSummary } from "./CheckoutSummary";
import { Toast, useToast } from "@/src/components/feedback/Toast";
import { BURGERS_DATA } from "@/src/data/featured-products";
import { removedFromCartMessage } from "@/src/lib/cart-copy";

export function CheckoutSection({ items, onOpenCart, onRemoveItem }: { items: CartItem[]; onOpenCart: () => void; onRemoveItem: (id: string) => void }) {
  const [draft, setDraft] = useState<CheckoutDraft>(INITIAL_CHECKOUT_DRAFT);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [transactionActive, setTransactionActive] = useState(false);
  const confirmingRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const number = normalizeWhatsAppNumber(BRAVOS_WHATSAPP_NUMBER, BRAVOS_WHATSAPP_COUNTRY_CODE);
  const { toast, showToast } = useToast();
  const storeStatus = useStoreStatus();

  useEffect(() => { const timer = window.setTimeout(() => { try { const stored = window.localStorage.getItem(CHECKOUT_STORAGE_KEY); setDraft(stored ? normalizeCheckout(JSON.parse(stored)) : INITIAL_CHECKOUT_DRAFT); } catch { setDraft(INITIAL_CHECKOUT_DRAFT); } setIsHydrated(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (!isHydrated) return; try { window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(serializeCheckout(draft))); } catch { /* memoria */ } }, [draft, isHydrated]);
  useEffect(() => {
    if (!isConfirming) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isConfirming]);
  // Primero se ve la animación completa (tarjeta, POS y check) y recién después se abre WhatsApp en esta misma pestaña.
  // El pedido ya va escrito en WhatsApp, así que el carrito se vacía: si el cliente vuelve atrás, empieza de cero.
  useEffect(() => {
    if (!isConfirming) return;
    // Un respiro para que la tarjeta se pinte en su estado inicial y luego arranca la animación.
    const startTimer = window.setTimeout(() => setTransactionActive(true), 60);
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      const url = pendingUrlRef.current;
      pendingUrlRef.current = null;
      const stop = (message: string) => { confirmingRef.current = false; setTransactionActive(false); setIsConfirming(false); setFeedback(message); };
      if (!url) { stop("No pudimos iniciar WhatsApp. Tu carrito sigue guardado."); return; }
      try {
        // Se vacía en el almacenamiento y no en React: así esta página no redirige a la portada mientras abre WhatsApp.
        // Al volver, el carrito se lee de nuevo y ya está vacío. La animación queda en pantalla hasta que WhatsApp carga.
        try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [], updatedAt: Date.now() })); } catch { /* sin almacenamiento */ }
        window.location.assign(url);
      } catch {
        stop("No pudimos abrir WhatsApp. Inténtalo otra vez.");
      }
    }, TRANSACTION_DURATION_MS);
    return () => window.clearTimeout(startTimer);
  }, [isConfirming]);
  useEffect(() => () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
  }, []);

  const updateDraft = (changes: Partial<CheckoutDraft>) => { setDraft((current) => ({ ...current, ...changes })); setFeedback(""); setErrors((current) => { const next = { ...current }; Object.keys(changes).forEach((key) => delete next[key as keyof CheckoutDraft]); return next; }); };
  const removeCheckoutItem = (item: CartItem) => {
    const name = isCatalogCartItem(item)
      ? item.name
      : BURGERS_DATA.find((product) => product.id === item.burgerId)?.name ?? "Producto";
    onRemoveItem(item.id);
    showToast(removedFromCartMessage(name), "error");
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmingRef.current) return;
    if (items.length === 0) { showToast("Tu carrito está vacío", "error"); return; }
    const validation = validateCheckout(draft); setErrors(validation); setFeedback("");
    const firstError = Object.keys(validation)[0] as keyof CheckoutDraft | undefined;
    if (firstError) { showToast("Completa los datos de tu pedido", "error"); (firstError === "paymentMethod" ? document.querySelector<HTMLInputElement>('input[name="payment"]') : document.getElementById(`checkout-${firstError}`))?.focus(); return; }
    const normalizedDraft = { ...draft, customerName: draft.customerName.trim(), phone: normalizePeruvianPhone(draft.phone), address: draft.address.trim(), reference: draft.reference.trim() };
    // Fuera de horario el pedido igual se envía: el mensaje avisa a la cocina que se atiende al abrir.
    // La hora se revisa al enviar, no al cargar: alguien puede dejar la página abierta hasta después del cierre.
    const store = getStoreStatus();
    const url = number ? buildWhatsAppUrl(number, buildOrderMessage({ items }, normalizedDraft, { ...createOrderCode(), reopens: store.open ? undefined : store.reopens })) : null;
    if (!url) { setFeedback("No pudimos preparar tu pedido para WhatsApp."); return; }
    confirmingRef.current = true;
    pendingUrlRef.current = url;
    setDraft(normalizedDraft);
    setFeedback("");
    setTransactionActive(false);
    setIsConfirming(true);
  };

  const total = calculateCartTotal(items);
  const nameOk = draft.customerName.trim().length >= 2;
  const phoneOk = /^9\d{8}$/.test(draft.phone);

  return <section id="checkout" aria-labelledby="checkout-title" className="checkout-page px-4 pb-20 sm:px-6"><Toast toast={toast} /><div className="mx-auto max-w-5xl">
    <CheckoutSteps onOpenCart={onOpenCart} />
    <header className="mt-6 max-w-xl">
      <h1 id="checkout-title" className="font-brush text-[2.6rem] leading-none text-[#F3E9D6] sm:text-6xl">Último paso</h1>
      <p className="mt-3 text-[.9375rem] leading-relaxed text-[#A39A8E] sm:text-base">Déjanos tus datos y la dirección. Abrimos WhatsApp con tu pedido ya escrito y tú solo le das enviar.</p>
      <StoreStatusBadge className="mt-4" />
    </header>
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <CheckoutSummary items={items} onOpenCart={onOpenCart} onRemoveItem={removeCheckoutItem} />
      <form onSubmit={handleSubmit} noValidate className="checkout-form min-w-0 lg:order-first">
        <FieldGroup step={1} title="¿A nombre de quién?">
          <div className="grid gap-3 sm:grid-cols-2">
            <FloatingField id="customerName" label="Tu nombre" value={draft.customerName} maxLength={80} error={errors.customerName} valid={nameOk} autoComplete="name" onChange={(customerName) => updateDraft({ customerName })} onBlur={() => updateDraft({ customerName: draft.customerName.trim() })} />
            <FloatingField id="phone" label="Celular" prefix="+51" hint="9 dígitos, empieza en 9" value={draft.phone} maxLength={16} error={errors.phone} valid={phoneOk} inputMode="tel" autoComplete="tel" onChange={(phone) => updateDraft({ phone: normalizePeruvianPhone(phone) })} />
          </div>
        </FieldGroup>
        <FieldGroup step={2} title="¿A dónde te lo llevamos?">
          <div className="grid gap-3">
            <FloatingField id="address" label="Dirección" hint="Calle, número y distrito" value={draft.address} maxLength={160} error={errors.address} valid={draft.address.trim().length >= 5} autoComplete="street-address" onChange={(address) => updateDraft({ address })} />
            <FloatingField id="reference" label="Referencia (opcional)" hint="Por ejemplo: frente al parque, puerta negra" value={draft.reference} maxLength={120} valid={draft.reference.trim().length > 0} onChange={(reference) => updateDraft({ reference })} />
            <LocationPicker value={draft.mapsUrl} onChange={(mapsUrl) => updateDraft({ mapsUrl })} />
          </div>
        </FieldGroup>
        <FieldGroup step={3} title="¿Cómo vas a pagar?">
          <PaymentCards name="payment" value={draft.paymentMethod} error={errors.paymentMethod} options={[{ value: "yape", label: "Yape", description: "App Yape" }, { value: "plin", label: "Plin", description: "App de tu banco" }]} onChange={(paymentMethod) => updateDraft({ paymentMethod: paymentMethod as PaymentMethod })} />
        </FieldGroup>
        {storeStatus && !storeStatus.open && (
          <div role="note" className="mt-8 flex gap-3 rounded-2xl border border-[#E0793E]/35 bg-[#2a1810]/80 p-4 text-sm leading-relaxed text-[#f0d2b8] sm:mt-10">
            <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#E0793E]/15 text-[#E0793E]">
              <svg viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            <p><strong className="font-semibold text-[#F3E9D6]">Ahora estamos cerrados, pero igual puedes enviar tu pedido.</strong> Lo atendemos apenas abramos ({storeStatus.reopens}) y una persona te escribirá por WhatsApp para confirmarlo.</p>
          </div>
        )}
        <button type="submit" disabled={isConfirming} aria-disabled={isConfirming} aria-label={`Enviar pedido por WhatsApp${total !== null ? `, total S/ ${total}` : ""}`} className={`checkout-confirm-button bravos-fill group ${storeStatus && !storeStatus.open ? "mt-4" : "mt-8 sm:mt-10"}`}>
          <WhatsAppIcon />
          <span className="whitespace-nowrap">Enviar pedido</span>
          {total !== null && <span className="checkout-confirm-total">S/ {Number.isInteger(total) ? total : total.toFixed(2)}</span>}
        </button>
        <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-[#8c8278]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-px size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          Aquí no pagas nada. Te confirmamos el delivery por WhatsApp y pagas con Yape o Plin.
        </p>
        <p className="mt-2 text-center text-xs leading-relaxed text-[#6f665d]">
          Al enviar aceptas nuestra <Link href="/privacidad" className="underline underline-offset-2 hover:text-[#E0793E]">política de privacidad</Link>.
        </p>
        <div aria-live="polite" className="min-h-5 text-center">{feedback && <p className="text-xs leading-relaxed text-[#fca5a5]">{feedback}</p>}</div>
      </form>
    </div>
  </div>{isConfirming && <div ref={overlayRef} tabIndex={-1} role="status" aria-live="assertive" aria-label="Enviando tu pedido" className="checkout-transition-overlay"><style>{TRANSACTION_STYLES}</style><div className={`transaction-container${transactionActive ? " transaction-active" : ""}`} dangerouslySetInnerHTML={{ __html: TRANSACTION_MARKUP }} /></div>}</section>;
}

/* Botón para mandar la ubicación exacta del teléfono como enlace de Google Maps (el repartidor la abre con un toque). */
function LocationPicker({ value, onChange }: { value: string; onChange: (mapsUrl: string) => void }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const locate = () => {
    if (!("geolocation" in navigator)) { setState("error"); setMessage("Tu navegador no permite compartir la ubicación. Escribe una referencia clara."); return; }
    setState("loading");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => { onChange(buildMapsUrl(position.coords.latitude, position.coords.longitude)); setState("idle"); },
      (error) => {
        setState("error");
        setMessage(error.code === error.PERMISSION_DENIED
          ? "No diste permiso para usar tu ubicación. Puedes activarlo en tu navegador o escribir una referencia clara."
          : "No pudimos obtener tu ubicación. Inténtalo de nuevo o escribe una referencia clara.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  if (value) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-950/40 px-4 py-3">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-100">Ubicación agregada</p>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300/90 underline underline-offset-2">Ver en Google Maps</a>
        </div>
        <button type="button" onClick={() => onChange("")} className="tap min-h-10 rounded-full px-3 text-xs font-semibold text-[#bca58c] hover:text-[#F3E9D6]">Quitar</button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={locate} disabled={state === "loading"}
        className="tap flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E0793E]/50 bg-[#E0793E]/[.06] px-4 text-sm font-semibold text-[#f0b98c] transition-colors hover:bg-[#E0793E]/[.12] disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
        {state === "loading" ? "Buscando tu ubicación…" : "Compartir mi ubicación (Google Maps)"}
      </button>
      <p aria-live="polite" className={`mt-1.5 pl-1 text-xs ${state === "error" ? "text-[#fca5a5]" : "text-[#6f665d]"}`}>
        {state === "error" ? message : "Opcional: así el repartidor llega directo."}
      </p>
    </div>
  );
}

/** Lo que dura la animación del pago antes de abrir WhatsApp: la tarjeta sube, el POS baja y aparece el check. */
const TRANSACTION_DURATION_MS = 1900;

const TRANSACTION_MARKUP = `<div class="left-side"><div class="card"><div class="card-line"></div><div class="buttons"></div></div><div class="post"><div class="post-line"></div><div class="screen"><div class="confirmation">&#10003;</div></div><div class="numbers"></div><div class="numbers-line2"></div></div></div><div class="right-side"><div class="new"><strong>Enviando tu pedido...</strong><small>Abriendo WhatsApp...</small></div><svg viewBox="0 0 451.846 451.847" aria-hidden="true" class="arrow"><path fill="currentColor" d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"></path></svg></div>`;

const TRANSACTION_STYLES = `
.transaction-container{background-color:#ffffff;display:flex;width:min(calc(100vw - 24px),460px);height:120px;position:relative;border-radius:6px;transition:.3s ease-in-out}
.transaction-container.transaction-active{transform:scale(1.03);width:220px}
.transaction-container.transaction-active .left-side{width:100%}
.left-side{background-color:#5de2a3;width:130px;height:120px;border-radius:4px;position:relative;display:flex;justify-content:center;align-items:center;transition:.3s;flex-shrink:0;overflow:hidden}
.right-side{width:calc(100% - 130px);display:flex;align-items:center;overflow:hidden;justify-content:space-between;white-space:nowrap;transition:.3s}
.arrow{width:20px;height:20px;margin-right:20px;flex-shrink:0;color:#cfcfcf}
.new{font-size:23px;font-family:"Lexend Deca",Arial,sans-serif;margin-left:20px;color:#111}
.new strong{display:block;font:inherit}.new small{display:block;margin-top:4px;font-size:11px;color:#757375}
.card{width:70px;height:46px;background-color:#c7ffbc;border-radius:6px;position:absolute;display:flex;z-index:10;flex-direction:column;align-items:center;box-shadow:9px 9px 9px -2px rgba(77,200,143,.72)}
.card-line{width:65px;height:13px;background-color:#80ea69;border-radius:2px;margin-top:7px}
.buttons{width:8px;height:8px;background-color:#379e1f;box-shadow:0 -10px 0 0 #26850e,0 10px 0 0 #56be3e;border-radius:50%;transform:rotate(90deg);margin:10px 0 0 -30px}
.transaction-container.transaction-active .card{animation:slide-top 1.2s cubic-bezier(.645,.045,.355,1) both}
.transaction-container.transaction-active .post{animation:slide-post 1s cubic-bezier(.165,.84,.44,1) both}
@keyframes slide-top{0%{transform:translateY(0)}50%{transform:translateY(-70px) rotate(90deg)}60%{transform:translateY(-70px) rotate(90deg)}100%{transform:translateY(-8px) rotate(90deg)}}
.post{width:63px;height:75px;background-color:#dddde0;position:absolute;z-index:11;bottom:10px;top:120px;border-radius:6px;overflow:hidden}
.post-line{width:47px;height:9px;background-color:#545354;position:absolute;border-radius:0 0 3px 3px;right:8px;top:8px}.post-line:before{content:"";position:absolute;width:47px;height:9px;background-color:#757375;top:-8px}
.screen{width:47px;height:23px;background-color:#ffffff;position:absolute;top:22px;right:8px;border-radius:3px}
.numbers{width:12px;height:12px;background-color:#838183;box-shadow:0 -18px 0 0 #838183,0 18px 0 0 #838183;border-radius:2px;position:absolute;transform:rotate(90deg);left:25px;top:52px}
.numbers-line2{width:12px;height:12px;background-color:#aaa9ab;box-shadow:0 -18px 0 0 #aaa9ab,0 18px 0 0 #aaa9ab;border-radius:2px;position:absolute;transform:rotate(90deg);left:25px;top:68px}
@keyframes slide-post{50%{transform:translateY(0)}100%{transform:translateY(-70px)}}
.confirmation{position:absolute;font-size:16px;font-family:"Lexend Deca",Arial,sans-serif;width:100%;left:0;top:0;color:#4b953b;text-align:center}
.transaction-container.transaction-active .confirmation{animation:fade-in-fwd .3s 1s backwards}
@keyframes fade-in-fwd{0%{opacity:0;transform:translateY(-5px)}100%{opacity:1;transform:translateY(0)}}
@media(max-width:390px){.new{font-size:clamp(17px,5vw,20px);margin-left:14px}.new small{font-size:10px}.arrow{margin-right:12px}}
@media(prefers-reduced-motion:reduce){.transaction-container{transition-duration:.01ms}.transaction-container.transaction-active .card{animation-duration:.35s!important}.transaction-container.transaction-active .post{animation-duration:.35s!important}.transaction-container.transaction-active .confirmation{animation-duration:.2s!important;animation-delay:.35s!important}}
`;

/* Pasos arriba del formulario: el carrito ya está listo, ahora tus datos y luego WhatsApp. */
function CheckoutSteps({ onOpenCart }: { onOpenCart: () => void }) {
  const steps = ["Carrito", "Tus datos", "WhatsApp"];
  return <ol aria-label="Pasos del pedido" className="flex items-center gap-2 text-[.8125rem] font-medium sm:gap-3">
    {steps.map((step, index) => {
      const done = index === 0;
      const current = index === 1;
      const dot = <span aria-hidden="true" className={`grid size-6 place-items-center rounded-full text-[.6875rem] font-bold ${done ? "bg-[#E0793E] text-[#16110E]" : current ? "bg-[#F3E9D6] text-[#16110E]" : "border border-white/20 text-[#8c8278]"}`}>{done ? "✓" : index + 1}</span>;
      return <li key={step} className="flex items-center gap-2 sm:gap-3" aria-current={current ? "step" : undefined}>
        {done
          ? <button type="button" onClick={onOpenCart} className="tap inline-flex min-h-9 items-center gap-2 rounded-full pr-1 text-[#E0793E] hover:text-[#F3E9D6]">{dot}{step}</button>
          : <span className={`inline-flex items-center gap-2 ${current ? "text-[#F3E9D6]" : "text-[#8c8278]"}`}>{dot}{step}</span>}
        {index < steps.length - 1 && <span aria-hidden="true" className={`h-px w-5 sm:w-10 ${done ? "bg-[#E0793E]" : "bg-white/15"}`} />}
      </li>;
    })}
  </ol>;
}

function FieldGroup({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return <fieldset className="min-w-0 border-0 p-0 [&+&]:mt-7">
    <legend className="mb-3 flex items-center gap-2.5 text-base font-semibold text-[#F3E9D6]"><span aria-hidden="true" className="font-brush text-lg leading-none text-[#E0793E]">{step}.</span>{title}</legend>
    {children}
  </fieldset>;
}

/* Campo con la etiqueta adentro: sube cuando escribes, y un check verde aparece cuando el dato ya está bien. */
function FloatingField({ id, label, value, error, valid, prefix, hint, maxLength, inputMode, autoComplete, onChange, onBlur }: { id: keyof CheckoutDraft; label: string; value: string; error?: string; valid: boolean; prefix?: string; hint?: string; maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoComplete?: string; onChange: (value: string) => void; onBlur?: () => void }) {
  const inputId = `checkout-${id}`;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return <div>
    <div className={`checkout-field group relative rounded-2xl border bg-white/[.035] transition-colors focus-within:border-[#E0793E] focus-within:bg-white/[.06] ${error ? "border-[#f87171]/70" : "border-white/10 hover:border-white/20"}`}>
      {prefix && <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-4 text-base text-[#8c8278] opacity-0 transition-opacity group-focus-within:opacity-100 group-has-[input:not(:placeholder-shown)]:opacity-100">{prefix}</span>}
      <input id={inputId} value={value} maxLength={maxLength} inputMode={inputMode} autoComplete={autoComplete} placeholder=" " onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={describedBy}
        className={`peer block h-[3.75rem] w-full rounded-2xl bg-transparent pb-2 pr-11 pt-6 text-base text-[#F3E9D6] outline-none ${prefix ? "pl-[3.25rem]" : "pl-4"}`} />
      <label htmlFor={inputId} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[.9375rem] text-[#8c8278] transition-all duration-200 ease-[var(--ease-out)] peer-focus:top-[1.15rem] peer-focus:text-xs peer-focus:text-[#E0793E] peer-[:not(:placeholder-shown)]:top-[1.15rem] peer-[:not(:placeholder-shown)]:text-xs">{label}</label>
      <span aria-hidden="true" className={`absolute right-3.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-[#22c55e]/15 text-[#4ade80] transition-[opacity,scale] duration-300 ease-[var(--ease-out)] ${valid ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
      </span>
    </div>
    {error ? <p id={`${inputId}-error`} role="alert" className="mt-1.5 pl-1 text-xs text-[#fca5a5]">{error}</p> : hint ? <p id={`${inputId}-hint`} className="mt-1.5 pl-1 text-xs text-[#6f665d]">{hint}</p> : null}
  </div>;
}

function PaymentCards({ name, value, options, error, onChange }: { name: string; value: string; options: { value: string; label: string; description: string }[]; error?: string; onChange: (value: string) => void }) {
  return <div>
    <div role="radiogroup" aria-label="Método de pago" aria-invalid={Boolean(error)} className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const active = value === option.value;
        return <label key={option.value} className={`checkout-pay tap relative flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 focus-within:ring-2 focus-within:ring-[#E0793E] ${active ? "border-[#E0793E] bg-[#E0793E]/[.09]" : error ? "border-[#f87171]/60 bg-white/[.035]" : "border-white/10 bg-white/[.035] hover:border-white/25"}`}>
          <input type="radio" name={name} value={option.value} checked={active} onChange={() => onChange(option.value)} className="sr-only" />
          <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${active ? "border-[#E0793E]" : "border-white/25"}`}><span className={`size-2.5 rounded-full bg-[#E0793E] transition-[scale] duration-200 ease-[var(--ease-out)] ${active ? "scale-100" : "scale-0"}`} /></span>
          <span className="min-w-0"><span className="block text-base font-semibold text-[#F3E9D6]">{option.label}</span><span className="block truncate text-xs text-[#8c8278]">{option.description}</span></span>
        </label>;
      })}
    </div>
    {error && <p role="alert" className="mt-1.5 pl-1 text-xs text-[#fca5a5]">{error}</p>}
  </div>;
}

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor"><path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.1 22l5.33-1.4a9.84 9.84 0 0 0 4.6 1.17h.01c5.44 0 9.86-4.42 9.86-9.86A9.84 9.84 0 0 0 12.04 2Zm0 18.07h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.16.83.84-3.08-.2-.32a8.17 8.17 0 0 1-1.25-4.31c0-4.52 3.68-8.2 8.21-8.2a8.2 8.2 0 0 1 8.2 8.21c0 4.52-3.68 8.2-8.15 8.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" /></svg>;
}
