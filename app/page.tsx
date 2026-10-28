import type { Metadata } from "next";
import { Navbar } from "@/src/components/landing/Navbar";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { BrandTicker } from "@/src/components/landing/BrandTicker";
import { CatalogExperience } from "@/src/components/landing/CatalogExperience";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";
import { SHARE_IMAGE } from "@/src/data/seo";

const title = "Hamburguesas con delivery en Arequipa | Bravos Grill & Smoke";
const description = "Hamburguesas a la plancha con delivery en Arequipa desde S/ 20. Arma tu pedido, envíalo por WhatsApp y paga con Yape o Plin. Al León hay que darle carne.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title, description, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
};

// Ficha del negocio para Google. Solo datos confirmados; horario y zonas se agregan cuando el dueño los pase.
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://bravossburguer.pro/#restaurant",
  name: "Bravos Grill & Smoke",
  url: "https://bravossburguer.pro/",
  logo: "https://bravossburguer.pro/brand/bravos-icono-512.png",
  image: "https://bravossburguer.pro/og-bravos.jpg",
  telephone: `+${BRAVOS_WHATSAPP_NUMBER}`,
  servesCuisine: ["Hamburguesas"],
  address: { "@type": "PostalAddress", addressLocality: "Arequipa", addressRegion: "Arequipa", addressCountry: "PE" },
  hasMenu: "https://bravossburguer.pro/menu",
  acceptsReservations: false,
  paymentAccepted: "Yape, Plin",
  currenciesAccepted: "PEN",
  sameAs: ["https://www.instagram.com/bravosgrillsmoke"],
};

export default function Home() {
  return <div className="flex min-h-screen flex-col bg-[#16110E]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }} /><Navbar /><main className="flex flex-1 flex-col"><HeroSection /><BrandTicker /><CatalogExperience /></main><FooterSimple /></div>;
}
