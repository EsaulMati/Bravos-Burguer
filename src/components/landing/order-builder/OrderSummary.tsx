import type { ComboAddon, OrderDraft, ProductItem } from "@/src/types/landing";

interface OrderSummaryProps {
  order: OrderDraft;
  burger: ProductItem;
  friesAddon?: ComboAddon;
  drinkAddon?: ComboAddon;
  totalPrice: number | null;
}

export function OrderSummary({
  order,
  burger,
  friesAddon,
  drinkAddon,
  totalPrice,
}: OrderSummaryProps) {
  return (
    <div
      id="resumen-orden"
      tabIndex={-1}
      className="rounded-2xl border border-white/5 bg-[#101012] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="font-serif text-xl font-bold text-white">Tu orden</h4>
        <span className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
          Borrador local
        </span>
      </div>

      <ul className="space-y-3" aria-label="Productos incluidos en la orden">
        <SummaryLine quantity={order.burgerQuantity} name={burger.name} />
        {order.friesEnabled && friesAddon && (
          <SummaryLine quantity={order.friesQuantity} name={friesAddon.name} />
        )}
        {order.drinkEnabled && drinkAddon && (
          <SummaryLine quantity={order.drinkQuantity} name={drinkAddon.name} />
        )}
      </ul>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
        <span className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
          Total
        </span>
        <output
          aria-live="polite"
          aria-label={`Total actualizado: ${totalPrice !== null ? `S/ ${totalPrice.toFixed(2)}` : "precio por confirmar"}`}
          className="font-dosis text-3xl font-bold tabular-nums text-white"
        >
          {totalPrice !== null ? `S/ ${totalPrice.toFixed(2)}` : "Por confirmar"}
        </output>
      </div>
    </div>
  );
}

function SummaryLine({ quantity, name }: { quantity: number; name: string }) {
  return (
    <li className="flex min-w-0 items-baseline gap-3 text-sm">
      <span className="shrink-0 font-dosis font-bold tabular-nums text-[#f97316]">
        {quantity} ×
      </span>
      <span className="min-w-0 text-[#d4d4d8]">{name}</span>
    </li>
  );
}
