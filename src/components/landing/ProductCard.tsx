"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductItem } from "@/src/types/landing";

interface ProductCardProps {
  product: ProductItem;
  categoryLabel: string;
  isSelected: boolean;
  onSelectBurger: (id: string) => void;
}

export function ProductCard({
  product,
  categoryLabel,
  isSelected,
  onSelectBurger,
}: ProductCardProps) {
  const router = useRouter();
  const formattedPrice =
    product.price !== null ? `S/ ${product.price.toFixed(2)}` : "Consultar";
  const isBurger = product.category === "burgers";

  const handleSelectBurger = () => {
    onSelectBurger(product.id);
    router.push("/#armar-orden");
  };

  return (
    <article className={`group relative flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl bg-[#17171a] transition-colors duration-200 ${
      isSelected
        ? "border border-[#f97316]/80 shadow-xl shadow-black/30"
        : "border border-white/10 hover:border-[#f97316]/40"
    }`}>
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#101012]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-contain object-center p-5 sm:p-6"
        />
        {/* Subtle Dark Vignette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#17171a] to-transparent" />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#0c0c0e]/80 backdrop-blur-md border border-[#f97316]/40 text-xs font-dosis font-bold uppercase tracking-wider text-[#f97316]">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <p className="mb-2 font-dosis text-xs font-bold uppercase tracking-[0.14em] text-[#f59e0b]">
            {categoryLabel}
          </p>
          <h3 className="font-sans font-bold text-xl text-white group-hover:text-[#f97316] transition-colors">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed">
            {product.description}
          </p>

          {/* Ingredient Pills (if present) */}
          {product.highlightIngredients && product.highlightIngredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.highlightIngredients.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] font-dosis font-medium text-[#d4d4d8]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/5 pt-3">
          <div>
            <span className="block text-[11px] font-dosis uppercase tracking-wider text-[#71717a]">
              Precio
            </span>
            <span className="font-dosis font-bold text-2xl text-[#fafafa]">
              {formattedPrice}
            </span>
          </div>

          {isBurger ? (
            <button
              type="button"
              onClick={handleSelectBurger}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Hamburguesa seleccionada" : "Elegir"}: ${product.name}`}
              className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 font-dosis text-sm font-bold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17171a] ${
                isSelected
                  ? "border-[#f97316] bg-[#f97316] text-white"
                  : "border-[#f97316]/40 bg-[#f97316]/10 text-[#fb923c] hover:bg-[#f97316] hover:text-white"
              }`}
            >
              {isSelected ? "Seleccionada" : "Armar combo"}
            </button>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-dosis text-sm font-bold tracking-wide text-[#d4d4d8]">
              Disponible
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
