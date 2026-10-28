"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const links = [
  { href: "/menu", label: "Menú" },
  { href: "/#combos", label: "Para la manchita" },
  { href: "/#armar-orden", label: "Arma tu pedido" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // En la portada, el escudo sube al inicio desde cualquier parte (Next no hace scroll al volver a la misma ruta).
  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (pathname !== "/") return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (window.location.hash) window.history.replaceState(null, "", "/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`bravos-header fixed inset-x-0 top-0 z-50 ${scrolled || menuOpen ? "is-solid" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}>
      <div className="bravos-header-inner mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" aria-label="Bravos Grill & Smoke, inicio" onClick={goHome} className="bravos-brand">
          <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} priority sizes="(min-width: 1024px) 80px, 68px" className="bravos-brand-crest" />
        </Link>
        <nav aria-label="Navegación principal" className="bravos-desktop-nav hidden items-center lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/#armar-orden" onClick={() => setMenuOpen(false)} aria-label="Pedir ahora" className="bravos-order-link tap">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="bravos-order-flame"><path d="M12 2c1 3.5-1.6 5.2-1.6 7.8 0 1.4 1 2.4 2.2 2.4 1.5 0 2.2-1.2 2-2.9 2.3 1.6 3.9 4.2 3.9 6.9A6.5 6.5 0 0 1 12 22.5a6.5 6.5 0 0 1-6.5-6.3C5.5 10 12 7.6 12 2Z" /></svg>
            <span>Pedir<span className="max-sm:hidden"> ahora</span></span>
          </Link>
          <button ref={menuButtonRef} type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((open) => !open)}
            className="bravos-menu-toggle inline-flex size-11 items-center justify-center rounded-lg lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d={menuOpen ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Navegación móvil" className="bravos-mobile-nav grid lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
      </nav>}
    </header>
  );
}
