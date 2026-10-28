/** Imagen para compartir (WhatsApp, Facebook, X). */
export const SHARE_IMAGE = {
  url: "/og-bravos.jpg",
  width: 1200,
  height: 630,
  alt: "Hamburguesa El León de Bravos Grill & Smoke sobre la plancha",
};

/** Datos comunes de openGraph. Cada página que redefine openGraph debe repetirlos: Next no los hereda del layout. */
export const OPEN_GRAPH_BASE = {
  type: "website" as const,
  locale: "es_PE",
  siteName: "Bravos Grill & Smoke",
  images: [SHARE_IMAGE],
};
