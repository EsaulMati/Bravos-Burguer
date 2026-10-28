import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Knewave, Rubik } from "next/font/google";
import { MotionProvider } from "@/src/components/MotionProvider";
import { SHARE_IMAGE } from "@/src/data/seo";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-rubik", display: "swap" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow-condensed", display: "swap" });
const knewave = Knewave({ subsets: ["latin"], weight: "400", variable: "--font-knewave", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#16110E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bravossburguer.pro"),
  title: { default: "Bravos Grill & Smoke", template: "%s | Bravos Grill & Smoke" },
  description:
    "Hamburguesas a la plancha con delivery en Arequipa. Arma tu pedido, envíalo por WhatsApp y paga con Yape o Plin. Al León hay que darle carne.",
  icons: {
    icon: [{ url: "/brand/bravos-icono-64.png", type: "image/png" }],
    shortcut: ["/brand/bravos-icono-64.png"],
    apple: [{ url: "/brand/bravos-icono-180.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Bravos Grill & Smoke",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [SHARE_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-PE"
      data-scroll-behavior="smooth"
      className={`${anton.variable} ${rubik.variable} ${barlowCondensed.variable} ${knewave.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#16110E] text-[#F3E9D6] font-sans selection:bg-[#B35629] selection:text-white">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
