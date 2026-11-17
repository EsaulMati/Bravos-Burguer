"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PRIVACY_NOTICE_KEY } from "./storage-keys";

/* Aviso de la primera visita. No pide consentimiento porque no hay cookies de seguimiento: solo informa qué se guarda. */
export function PrivacyNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setVisible(window.localStorage.getItem(PRIVACY_NOTICE_KEY) === null); } catch { /* sin almacenamiento: no se muestra */ }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try { window.localStorage.setItem(PRIVACY_NOTICE_KEY, "1"); } catch { /* se oculta igual */ }
    setVisible(false);
  };

  return (
    <div role="region" aria-label="Aviso de privacidad"
      className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[45] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#1b130e]/95 p-4 text-sm text-[#e6d6bf] shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur-md sm:left-5 sm:right-auto sm:bottom-5 sm:mx-0">
      <p className="leading-relaxed">Guardamos tu carrito y tus datos de entrega solo en este dispositivo. <strong className="font-semibold text-[#F3E9D6]">No usamos cookies de publicidad ni de seguimiento.</strong></p>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={dismiss} className="tap min-h-10 rounded-full bg-[#B35629] px-5 text-sm font-semibold text-white hover:bg-[#9E4A22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E]">Entendido</button>
        <Link href="/privacidad" className="text-sm font-semibold text-[#E0793E] underline-offset-4 hover:underline">Más información</Link>
      </div>
    </div>
  );
}
