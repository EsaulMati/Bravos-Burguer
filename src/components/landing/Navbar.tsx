"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/menu", label: "Menú" },
  { href: "/#combos", label: "Para la manchita" },
  { href: "/#armar-orden", label: "Arma tu pedido" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${scrolled ? "border-b border-[#c58a53]/20 bg-[#120d09]/92 py-2 shadow-[0_12px_36px_rgba(0,0,0,.22)] backdrop-blur-md" : "bg-transparent py-3"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Bravos Burger, inicio" onClick={() => setMenuOpen(false)} className="relative block size-14 shrink-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3944d]"><Image src="/bravos-logo.png" alt="Bravos Grill & Smoke" fill priority sizes="56px" className="object-cover" /></Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm font-semibold text-[#eadbc8] md:flex">{links.map((link) => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}</nav>
        <div className="flex items-center gap-2"><Link href="/#armar-orden" onClick={() => setMenuOpen(false)} className="min-h-11 rounded-full bg-[#bd5a22] px-4 py-2.5 font-dosis text-sm font-bold text-white hover:bg-[#d86d2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e] sm:px-5 sm:text-base">Pedir ahora</Link><button type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((open) => !open)} className="inline-flex size-11 items-center justify-center rounded-xl border border-white/15 text-[#f4ddbd] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb36e]"><span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span></button></div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Navegación móvil" className="mx-4 mt-2 grid gap-1 rounded-2xl border border-white/10 bg-[#120d09]/95 p-2 shadow-xl backdrop-blur-md md:hidden sm:mx-6">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="min-h-11 rounded-xl px-4 py-3 text-sm font-semibold text-[#eadbc8] hover:bg-white/10">{link.label}</Link>)}</nav>}
    </header>
  );
}
