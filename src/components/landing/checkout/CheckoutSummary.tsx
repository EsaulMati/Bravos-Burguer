import { ADDONS_DATA, BURGERS_DATA } from "@/src/data/featured-products";
import { calculateCartItemSubtotal, calculateCartTotal, isCatalogCartItem } from "@/src/lib/cart";
import type { CartItem } from "@/src/types/landing";

interface CheckoutSummaryProps {
  items: CartItem[];
  onOpenCart: () => void;
}

export function CheckoutSummary({ items, onOpenCart }: CheckoutSummaryProps) {
  const cartTotal = calculateCartTotal(items);
  const friesAddon = ADDONS_DATA.find((addon) => addon.id === "fries");
  const drinkAddon = ADDONS_DATA.find((addon) => addon.id === "drink");

  return (
    <aside className="min-w-0 rounded-3xl border border-white/10 bg-[#17171a] p-5 lg:sticky lg:top-24 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
            Resumen final
          </p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white">Tu pedido Bravos</h3>
        </div>
        <button
          type="button"
          onClick={onOpenCart}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/10 px-3 font-dosis text-sm font-bold text-[#d4d4d8] hover:border-[#f97316]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]"
        >
          Editar
        </button>
      </div>

      <ol className="mt-6 space-y-4" aria-label="Órdenes que se prepararán">
        {items.map((item, index) => {
          if (isCatalogCartItem(item)) {
            const subtotal = calculateCartItemSubtotal(item);
            return (
              <li key={item.id} className="rounded-2xl bg-[#101012] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-dosis text-xs font-bold uppercase tracking-wider text-[#71717a]">Producto {index + 1}</p>
                    <p className="mt-1 font-semibold text-white">{item.quantity} × {item.name}</p>
                  </div>
                  <span className="shrink-0 font-dosis font-bold tabular-nums text-white">
                    {subtotal !== null ? `S/ ${subtotal.toFixed(2)}` : "Por confirmar"}
                  </span>
                </div>
              </li>
            );
          }

          const burger = BURGERS_DATA.find((product) => product.id === item.burgerId);
          if (!burger) return null;
          const subtotal = calculateCartItemSubtotal(item);

          return (
            <li key={item.id} className="rounded-2xl bg-[#101012] p-4">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="font-dosis text-xs font-bold uppercase tracking-wider text-[#71717a]">
                    Orden {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {item.burgerQuantity} × {burger.name}
                  </p>
                </div>
                <span className="self-end font-dosis font-bold tabular-nums text-white sm:self-auto">
                  {subtotal !== null ? `S/ ${subtotal.toFixed(2)}` : "Por confirmar"}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[#a1a1aa]">
                {item.friesEnabled && friesAddon && (
                  <li>{item.friesQuantity} × {friesAddon.name}</li>
                )}
                {item.drinkEnabled && drinkAddon && (
                  <li>{item.drinkQuantity} × {drinkAddon.name}</li>
                )}
              </ul>
              {item.notes && (
                <p className="mt-3 break-words border-t border-white/5 pt-3 text-xs leading-relaxed text-[#d4d4d8]">
                  <span className="font-bold text-[#f59e0b]">Indicaciones:</span> {item.notes}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <dl className="mt-6 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <dt className="font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
            Total
          </dt>
          <dd className="font-dosis text-3xl font-bold tabular-nums text-white">
            {cartTotal !== null ? `S/ ${cartTotal.toFixed(2)}` : "Por confirmar"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
