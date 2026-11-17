"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/src/lib/schedule";

/**
 * Estado del local (abierto o cerrado) que se actualiza cada minuto.
 * Devuelve null hasta montar: las páginas son estáticas y la hora real solo se conoce en el navegador.
 */
export function useStoreStatus(): StoreStatus | null {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 60_000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);

  return status;
}
