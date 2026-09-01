interface QuantityControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantityControl({
  label,
  value,
  min = 1,
  max = 10,
  onChange,
}: QuantityControlProps) {
  return (
    <div className="inline-flex items-center rounded-xl border border-white/10 bg-[#0c0c0e] p-1 shadow-inner shadow-black/30">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Reducir cantidad de ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-lg font-dosis text-xl font-bold text-white transition-colors hover:bg-white/10 active:bg-white/15 disabled:cursor-not-allowed disabled:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
      >
        −
      </button>
      <output
        aria-label={`Cantidad de ${label}: ${value}`}
        className="min-w-9 text-center font-dosis text-lg font-bold tabular-nums text-white"
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar cantidad de ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-lg font-dosis text-xl font-bold text-white transition-colors hover:bg-white/10 active:bg-white/15 disabled:cursor-not-allowed disabled:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
      >
        +
      </button>
    </div>
  );
}
