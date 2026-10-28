"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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
  const reduceMotion = useReducedMotion();
  // Entra y sale por el mismo borde superior; la salida es más rápida que la entrada.
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-100%" };
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
          aria-live={toast.tone === "error" ? "assertive" : "polite"}
          initial={hidden}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ ...hidden, transition: { duration: .2, ease: [0.23, 1, 0.32, 1] } }}
          transition={{ duration: .4, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[60] w-[min(calc(100vw_-_2rem),26rem)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-center text-sm font-bold shadow-2xl ${toast.tone === "error" ? "border-red-300/45 bg-red-950 text-red-100" : "border-emerald-300/40 bg-emerald-950 text-emerald-100"}`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
