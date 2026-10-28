interface QuantityControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Versión para fondos crema: borde fino y texto carbón en vez del bloque oscuro. */
  light?: boolean;
  onChange: (value: number) => void;
}

export function QuantityControl({
  label,
  value,
  min = 1,
  max = 10,
  light = false,
  onChange,
}: QuantityControlProps) {
  const buttonTone = light
    ? "text-[#16110E] hover:bg-[#16110E]/10 active:bg-[#16110E]/15 disabled:text-[#16110E]/30"
    : "text-white hover:bg-white/10 active:bg-white/15 disabled:text-[#5C524A]";
  return (
    <div className={`inline-flex items-center rounded-xl p-1 ${light ? "border border-[#16110E]/25 bg-transparent" : "border border-white/10 bg-[#16110E] shadow-inner shadow-black/30"}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Reducir cantidad de ${label}`}
        className={`tap inline-flex size-11 items-center justify-center rounded-lg font-dosis text-xl font-bold disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E] ${buttonTone}`}
      >
        −
      </button>
      <output
        aria-label={`Cantidad de ${label}: ${value}`}
        className={`min-w-9 text-center font-dosis text-lg font-bold tabular-nums ${light ? "text-[#16110E]" : "text-white"}`}
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar cantidad de ${label}`}
        className={`tap inline-flex size-11 items-center justify-center rounded-lg font-dosis text-xl font-bold disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0793E] ${buttonTone}`}
      >
        +
      </button>
    </div>
  );
}
