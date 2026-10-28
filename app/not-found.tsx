import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/src/components/landing/Navbar";
import { FooterSimple } from "@/src/components/landing/FooterSimple";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: true } };

/* 404 con la marca: si alguien entra a un enlace viejo, lo devolvemos al menú en vez de dejarlo en una página en inglés. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#16110E]">
      <Navbar />
      <main className="checkout-page flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
        <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} sizes="160px" className="h-28 w-auto opacity-90 sm:h-36" />
        <p className="mt-8 font-dosis text-sm font-bold uppercase tracking-[.18em] text-[#E0793E]">Error 404</p>
        <h1 className="mt-3 max-w-xl font-brush text-[2.6rem] leading-none text-[#F3E9D6] sm:text-6xl">Esta página se quemó en la plancha</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[#A39A8E]">El enlace no existe o cambió. Tu carrito sigue guardado.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="bravos-button tap">Volver al inicio</Link>
          <Link href="/menu" className="bravos-button bravos-button--ghost tap">Ver el menú</Link>
        </div>
      </main>
      <FooterSimple />
    </div>
  );
}
