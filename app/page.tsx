import type { Metadata } from "next";
import { Navbar } from "@/src/components/landing/Navbar";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { BrandTicker } from "@/src/components/landing/BrandTicker";
import { CatalogExperience } from "@/src/components/landing/CatalogExperience";
import { FooterSimple } from "@/src/components/landing/FooterSimple";
import { BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";
import { OPEN_GRAPH_BASE, SHARE_IMAGE } from "@/src/data/seo";

const title = "Hamburguesas con delivery en Arequipa | Bravos Grill & Smoke";
const description = "Hamburguesas a la plancha con delivery en Arequipa desde S/ 20. Elige tu burger, envía el pedido por WhatsApp y paga con Yape o Plin. Al León hay que darle carne.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH_BASE, url: "/", title, description },
  twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
};

// Ficha del negocio para Google. Solo datos confirmados por el dueño (el horario coincide con src/lib/schedule.ts).
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
  priceRange: "S/ 20 - S/ 56",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday"], opens: "16:30", closes: "23:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday"], opens: "16:30", closes: "01:00" },
  ],
  currenciesAccepted: "PEN",
  sameAs: ["https://www.instagram.com/bravosgrillsmoke"],
};

export default function Home() {
  return <div className="flex min-h-screen flex-col bg-[#16110E]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd).replace(/</g, "\\u003c") }} /><Navbar /><main className="flex flex-1 flex-col"><HeroSection /><BrandTicker /><CatalogExperience /></main><FooterSimple /></div>;
}
