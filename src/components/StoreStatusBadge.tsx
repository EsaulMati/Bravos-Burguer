"use client";

import { useStoreStatus } from "@/src/hooks/useStoreStatus";

/* Pastilla "Abierto hasta la 1:00 a. m." / "Cerrado · abrimos mañana a las 4:30 p. m." con un punto de color. */
export function StoreStatusBadge({ className = "" }: { className?: string }) {
  const status = useStoreStatus();
  if (!status) return <span aria-hidden="true" className={`inline-block h-9 ${className}`} />;
  return (
    <span role="status" className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${status.open ? "border-emerald-400/30 bg-emerald-950/60 text-emerald-200" : "border-[#E0793E]/35 bg-[#2a1810]/80 text-[#f5c9a4]"} ${className}`}>
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${status.open ? "animate-pulse bg-emerald-400" : "bg-[#E0793E]"}`} />
      {status.label}
    </span>
  );
}
