"use client";

import { useState } from "react";
import { STORED_DATA_KEYS } from "./storage-keys";

export function ClearStoredDataButton() {
  const [cleared, setCleared] = useState(false);
  const clear = () => {
    try { STORED_DATA_KEYS.forEach((key) => window.localStorage.removeItem(key)); } catch { /* sin almacenamiento: no hay nada guardado */ }
    setCleared(true);
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" onClick={clear} className="bravos-button bravos-button--ghost tap">Borrar mis datos guardados</button>
      <p role="status" className="text-sm text-emerald-300">{cleared ? "Listo, se borraron de este dispositivo." : ""}</p>
    </div>
  );
}
