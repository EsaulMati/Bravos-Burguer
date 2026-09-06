"use client";

import { useEffect, useRef, useState } from "react";
import { BRAVOS_WHATSAPP_COUNTRY_CODE, BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";
import { CHECKOUT_STORAGE_KEY, INITIAL_CHECKOUT_DRAFT, normalizeCheckout, normalizePeruvianPhone, serializeCheckout, validateCheckout } from "@/src/lib/checkout";
import { buildOrderMessage, buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/src/lib/order-message";
import { isCatalogCartItem } from "@/src/lib/cart";
import type { CartItem, CheckoutDraft, CheckoutErrors, PaymentMethod } from "@/src/types/landing";
import { CheckoutSummary } from "./CheckoutSummary";
import { Toast, useToast } from "@/src/components/feedback/Toast";
import { BURGERS_DATA } from "@/src/data/featured-products";
import { removedFromCartMessage } from "@/src/lib/cart-copy";

export function CheckoutSection({ items, onOpenCart, onRemoveItem, onOrderConfirmed }: { items: CartItem[]; onOpenCart: () => void; onRemoveItem: (id: string) => void; onOrderConfirmed: () => void }) {
  const [draft, setDraft] = useState<CheckoutDraft>(INITIAL_CHECKOUT_DRAFT);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [transactionActive, setTransactionActive] = useState(false);
  const confirmingRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const pendingWindowRef = useRef<Window | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const pendingNavigationModeRef = useRef<"mobile" | "desktop" | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const number = normalizeWhatsAppNumber(BRAVOS_WHATSAPP_NUMBER, BRAVOS_WHATSAPP_COUNTRY_CODE);
  const { toast, showToast } = useToast();

  useEffect(() => { const timer = window.setTimeout(() => { try { const stored = window.localStorage.getItem(CHECKOUT_STORAGE_KEY); setDraft(stored ? normalizeCheckout(JSON.parse(stored)) : INITIAL_CHECKOUT_DRAFT); } catch { setDraft(INITIAL_CHECKOUT_DRAFT); } setIsHydrated(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (!isHydrated) return; try { window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(serializeCheckout(draft))); } catch { /* memoria */ } }, [draft, isHydrated]);
  useEffect(() => {
    if (!isConfirming) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isConfirming]);
  useEffect(() => {
    if (!isConfirming) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setTransactionActive(true);
        transitionTimerRef.current = window.setTimeout(() => {
          transitionTimerRef.current = null;
          const whatsappWindow = pendingWindowRef.current;
          const url = pendingUrlRef.current;
          const navigationMode = pendingNavigationModeRef.current;
          if (!url || !navigationMode || (navigationMode === "desktop" && (!whatsappWindow || whatsappWindow.closed))) {
            confirmingRef.current = false;
            pendingWindowRef.current = null;
            pendingUrlRef.current = null;
            pendingNavigationModeRef.current = null;
            setTransactionActive(false);
            setIsConfirming(false);
            setFeedback(navigationMode === "desktop" ? "La ventana de WhatsApp se cerró antes de enviar el pedido. Tu carrito sigue guardado." : "No pudimos iniciar WhatsApp. Tu carrito sigue guardado.");
            return;
          }
          try {
            if (navigationMode === "mobile") {
              window.location.assign(url);
            } else {
              whatsappWindow!.location.href = url;
            }
            pendingWindowRef.current = null;
            pendingUrlRef.current = null;
            pendingNavigationModeRef.current = null;
            onOrderConfirmed();
          } catch {
            pendingWindowRef.current = null;
            pendingUrlRef.current = null;
            pendingNavigationModeRef.current = null;
            setFeedback("No pudimos abrir WhatsApp. Tu carrito sigue guardado.");
          } finally {
            confirmingRef.current = false;
            setTransactionActive(false);
            setIsConfirming(false);
          }
        }, 1500);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [isConfirming, onOrderConfirmed]);
  useEffect(() => () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    if (pendingWindowRef.current && !pendingWindowRef.current.closed) pendingWindowRef.current.close();
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
    const normalizedDraft = { ...draft, customerName: draft.customerName.trim(), phone: normalizePeruvianPhone(draft.phone) };
    const url = number ? buildWhatsAppUrl(number, buildOrderMessage({ items }, normalizedDraft)) : null;
    if (!url) { setFeedback("No pudimos preparar tu pedido para WhatsApp."); return; }
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) {
      const whatsappWindow = window.open("", "_blank");
      if (!whatsappWindow) { setFeedback("No pudimos abrir WhatsApp. Permite las ventanas emergentes e inténtalo nuevamente."); return; }
      renderWhatsAppTransition(whatsappWindow);
      try { whatsappWindow.opener = null; } catch { /* La referencia controlada sigue siendo válida. */ }
      pendingWindowRef.current = whatsappWindow;
    }
    confirmingRef.current = true;
    pendingUrlRef.current = url;
    pendingNavigationModeRef.current = isMobile ? "mobile" : "desktop";
    setDraft(normalizedDraft);
    setFeedback("");
    setTransactionActive(false);
    setIsConfirming(true);
  };

  return <section id="checkout" aria-labelledby="checkout-title" className="scroll-mt-20 border-t border-white/5 bg-[#0f0f12] px-4 py-16 sm:px-6 sm:py-20"><Toast toast={toast} /><div className="mx-auto max-w-6xl"><div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10"><p className="font-dosis text-xs font-bold uppercase tracking-[0.16em] text-[#f97316]">Último vistazo</p><h2 id="checkout-title" className="mt-3 font-serif text-3xl font-bold text-white sm:text-5xl">Prepara los datos de tu pedido</h2><p className="mt-4 text-sm leading-relaxed text-[#a1a1aa] sm:text-base">Completa la información necesaria. El mensaje se abrirá en WhatsApp para que lo confirmes.</p></div><div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-8"><form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-6 rounded-3xl border border-white/10 bg-[#17171a] p-5 shadow-2xl shadow-black/20 sm:p-8"><FormSection title="Tus datos"><div className="grid gap-4 sm:grid-cols-2"><TextField id="customerName" label="Nombre" value={draft.customerName} maxLength={80} error={errors.customerName} autoComplete="name" onChange={(customerName) => updateDraft({ customerName })} onBlur={() => updateDraft({ customerName: draft.customerName.trim() })} /><TextField id="phone" label="Celular" value={draft.phone} maxLength={11} error={errors.phone} inputMode="tel" autoComplete="tel" placeholder="999 999 999" onChange={(phone) => updateDraft({ phone: normalizePeruvianPhone(phone) })} /></div></FormSection><FormSection title="Método de pago"><OptionGroup name="payment" value={draft.paymentMethod} options={[{ value: "yape", label: "Yape", description: "Quedará indicado en tu pedido." }, { value: "plin", label: "Plin", description: "Quedará indicado en tu pedido." }]} error={errors.paymentMethod} onChange={(paymentMethod) => updateDraft({ paymentMethod: paymentMethod as PaymentMethod })} /></FormSection><button type="submit" disabled={isConfirming} aria-disabled={isConfirming} className="checkout-confirm-button"><span>Confirmar pedido</span></button><div aria-live="polite" className="min-h-5 text-center">{feedback && <p className="text-xs leading-relaxed text-[#bbf7d0]">{feedback}</p>}</div></form><CheckoutSummary items={items} onOpenCart={onOpenCart} onRemoveItem={removeCheckoutItem} /></div></div>{isConfirming && <div ref={overlayRef} tabIndex={-1} role="status" aria-live="assertive" aria-label="Enviando tu pedido" className="checkout-transition-overlay"><style>{TRANSACTION_STYLES}</style><div className={`transaction-container${transactionActive ? " transaction-active" : ""}`} dangerouslySetInnerHTML={{ __html: TRANSACTION_MARKUP }} /></div>}</section>;
}

function renderWhatsAppTransition(target: Window) {
  try {
    target.document.open();
    target.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bravos Burger</title><style>${TRANSACTION_WINDOW_STYLES}${TRANSACTION_STYLES}</style></head><body><main id="transaction" class="transaction-container" role="status" aria-label="Enviando tu pedido">${TRANSACTION_MARKUP}</main></body></html>`);
    target.document.close();
    target.requestAnimationFrame(() => {
      target.requestAnimationFrame(() => target.document.getElementById("transaction")?.classList.add("transaction-active"));
    });
  } catch { /* El overlay de la página original permanece como respaldo visual. */ }
}

const TRANSACTION_MARKUP = `<div class="left-side"><div class="card"><div class="card-line"></div><div class="buttons"></div></div><div class="post"><div class="post-line"></div><div class="screen"><div class="confirmation">&#10003;</div></div><div class="numbers"></div><div class="numbers-line2"></div></div></div><div class="right-side"><div class="new"><strong>Enviando tu pedido...</strong><small>Abriendo WhatsApp...</small></div><svg viewBox="0 0 451.846 451.847" aria-hidden="true" class="arrow"><path fill="currentColor" d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"></path></svg></div>`;

const TRANSACTION_WINDOW_STYLES = `*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#111;padding:12px;font-family:"Lexend Deca",Arial,sans-serif}`;

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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset className="min-w-0 space-y-4 border-b border-white/10 pb-6"><legend className="font-serif text-xl font-bold text-white">{title}</legend>{children}</fieldset>; }
function TextField({ id, label, value, error, maxLength, inputMode, autoComplete, placeholder, onChange, onBlur }: { id: keyof CheckoutDraft; label: string; value: string; error?: string; maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoComplete?: string; placeholder?: string; onChange: (value: string) => void; onBlur?: () => void }) { const inputId = `checkout-${id}`; return <div><label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-white">{label}</label><input id={inputId} value={value} maxLength={maxLength} inputMode={inputMode} autoComplete={autoComplete} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#101012] px-4 text-base text-white placeholder:text-[#71717a] focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 sm:text-sm" />{error && <p id={`${inputId}-error`} role="alert" className="mt-2 text-xs text-[#fca5a5]">{error}</p>}</div>; }
function OptionGroup({ name, value, options, error, onChange }: { name: string; value: string; options: { value: string; label: string; description: string }[]; error?: string; onChange: (value: string) => void }) { return <div><div role="radiogroup" aria-label="Método de pago" aria-invalid={Boolean(error)} className="grid gap-3 sm:grid-cols-3">{options.map((option) => <label key={option.value} className={`relative flex min-h-24 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#f97316] ${value === option.value ? "border-[#f97316] bg-[#f97316]/10" : "border-white/10 bg-[#101012] hover:border-white/20"}`}><input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="mt-1 size-4 shrink-0 accent-[#f97316]" /><span><span className="block font-semibold text-white">{option.label}</span><span className="mt-1 block text-xs leading-relaxed text-[#a1a1aa]">{option.description}</span></span></label>)}</div>{error && <p role="alert" className="mt-2 text-xs text-[#fca5a5]">{error}</p>}</div>; }
