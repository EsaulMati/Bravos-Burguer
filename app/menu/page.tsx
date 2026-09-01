import type { Metadata } from "next";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { MenuCatalogExperience } from "@/src/components/menu/MenuCatalogExperience";

export const metadata: Metadata = {
  title: "Menú Bravos | Bravos Burger",
  description: "El menú completo de Bravos Burger: hamburguesas, combos y empanadas.",
};

export default function MenuPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#130d09]">
      <Navbar />
      <main className="flex-1">
        <header className="menu-page-hero px-4 pb-9 pt-24 sm:px-6 sm:pb-12 sm:pt-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-dosis text-xs font-bold uppercase tracking-[0.34em] text-[#d99a5b]">
              Premium Grill &amp; Smoke
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-none text-[#f6eadb] sm:text-7xl">
              Menú Bravos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#c8b39d] sm:text-base">
              Los de la casa, sus yapas y todo lo que prende la mesa.
            </p>
          </div>
        </header>

        <MenuCatalogExperience />
      </main>
      <FooterSimple />
    </div>
  );
}
