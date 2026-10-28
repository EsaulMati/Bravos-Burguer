import type { Metadata } from "next";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { MenuCatalogExperience } from "@/src/components/menu/MenuCatalogExperience";
import { OPEN_GRAPH_BASE, SHARE_IMAGE } from "@/src/data/seo";

export const metadata: Metadata = {
  title: { absolute: "Menú de hamburguesas y precios en Arequipa | Bravos" },
  description: "La Gordita desde S/ 20, El León con doble carne desde S/ 25, combos Ya Pagaron para la manchita, papas y gaseosas. Arma tu pedido y envíalo por WhatsApp.",
  alternates: { canonical: "/menu" },
  openGraph: { ...OPEN_GRAPH_BASE, url: "/menu", title: "Menú de hamburguesas y precios en Arequipa | Bravos" },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE.url] },
};

export default function MenuPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#16110E]">
      <Navbar />
      <main className="flex-1">
        <header className="menu-page-hero px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-brush text-[3.25rem] leading-[1] text-[#F3E9D6] sm:text-7xl lg:text-8xl">
              El menú
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#d9cdb9] sm:text-lg">
              Hamburguesas a la plancha, combos para compartir y sus yapas. Precios en soles. Pides por WhatsApp y pagas con Yape o Plin.
            </p>
          </div>
        </header>

        <MenuCatalogExperience />
      </main>
      <FooterSimple />
    </div>
  );
}
