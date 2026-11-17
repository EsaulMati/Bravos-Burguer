import type { MetadataRoute } from "next";

// El checkout queda fuera a propósito: no aporta a Google y lleva noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://bravossburguer.pro/", changeFrequency: "weekly", priority: 1 },
    { url: "https://bravossburguer.pro/menu", changeFrequency: "weekly", priority: 0.8 },
    { url: "https://bravossburguer.pro/privacidad", changeFrequency: "yearly", priority: 0.2 },
  ];
}
