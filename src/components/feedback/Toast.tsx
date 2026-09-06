"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastTone = "error" | "success";
interface ToastState { id: number; message: string; tone: ToastTone }

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const showToast = useCallback((message: string, tone: ToastTone) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, tone });
    timerRef.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  return { toast, showToast };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return <div key={toast.id} role={toast.tone === "error" ? "alert" : "status"} aria-live={toast.tone === "error" ? "assertive" : "polite"} className={`fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[120] w-[min(calc(100vw_-_2rem),26rem)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-center text-sm font-bold shadow-2xl backdrop-blur-md ${toast.tone === "error" ? "border-red-300/45 bg-red-950/95 text-red-100" : "border-emerald-300/40 bg-emerald-950/95 text-emerald-100"}`}>{toast.message}</div>;
}
