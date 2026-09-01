import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Bravos Burger | Hamburguesas y empanadas en Arequipa",
  description:
    "Menú de hamburguesas y empanadas de Bravos Burger en Arequipa. Arma tu orden, guárdala localmente y déjala lista para enviar por WhatsApp.",
  keywords: [
    "hamburguesas Arequipa",
    "dark kitchen Arequipa",
    "Bravos Burger",
    "empanadas artesanales Arequipa",
    "hamburguesas artesanales Arequipa",
  ],
  icons: {
    icon: [{ url: "/bravos-logo.png", type: "image/png" }],
    shortcut: ["/bravos-logo.png"],
    apple: [{ url: "/bravos-logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "Bravos Burger | Hamburguesas y empanadas en Arequipa",
    description:
      "Explora el menú de Bravos Burger y prepara tu orden desde el navegador.",
    type: "website",
    locale: "es_PE",
    siteName: "Bravos Burger",
  },
  twitter: {
    card: "summary",
    title: "Bravos Burger | Hamburguesas y empanadas en Arequipa",
    description:
      "Explora el menú de Bravos Burger y prepara tu orden desde el navegador.",
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
      className="h-full scroll-smooth antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#0c0c0e] text-[#fafafa] font-sans selection:bg-[#f97316] selection:text-white">
        {children}
      </body>
    </html>
  );
}
