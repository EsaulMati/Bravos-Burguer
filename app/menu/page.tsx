import type { Metadata } from "next";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { Navbar } from "@/src/components/landing/Navbar";
import { MenuCatalogExperience } from "@/src/components/menu/MenuCatalogExperience";
import { OPEN_GRAPH_BASE, SHARE_IMAGE } from "@/src/data/seo";
import { StoreStatusBadge } from "@/src/components/StoreStatusBadge";

export const metadata: Metadata = {
  title: { absolute: "Menú de hamburguesas y precios en Arequipa | Bravos" },
  description: "La Gordita a S/ 20 y El León con doble carne a S/ 25, siempre con papas. Súmale gaseosa o papas extra y envía tu pedido por WhatsApp.",
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
              Dos hamburguesas a la plancha, siempre con papas. Precios en soles. Pides por WhatsApp y pagas con Yape o Plin.
            </p>
            <StoreStatusBadge className="mt-5" />
          </div>
        </header>

        <MenuCatalogExperience />
      </main>
      <FooterSimple />
    </div>
  );
}
