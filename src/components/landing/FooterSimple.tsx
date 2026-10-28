import Image from "next/image";
import Link from "next/link";
import { BRAVOS_WHATSAPP_NUMBER } from "@/src/data/contact";

const INSTAGRAM_URL = "https://www.instagram.com/bravosgrillsmoke";
const WHATSAPP_URL = `https://wa.me/${BRAVOS_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Bravos, quiero hacer un pedido")}`;

export function FooterSimple() {
  return (
    <footer id="contacto" className="bravos-footer px-4 pb-28 pt-14 sm:px-6 sm:pt-20 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 border-b border-[rgba(243,233,214,.15)] pb-14 sm:mb-16 sm:pb-16">
          <h2 className="font-brush text-[clamp(2.75rem,9vw,7rem)] leading-[1] text-[var(--bravos-cream)]">La plancha está lista</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#d9cdb9] sm:text-lg">Arma tu pedido y nos llega por WhatsApp. Pagas con Yape o Plin.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#armar-orden" className="bravos-button tap">Armar mi pedido</Link>
          </div>
        </div>
        <div className="grid gap-7 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_.8fr]">
          <div>
            <Link
              href="/#inicio"
              aria-label="Bravos Grill & Smoke, volver al inicio"
              className="inline-flex"
            >
              <Image src="/brand/bravos-escudo.png" alt="" width={1043} height={937} sizes="144px" className="h-32 w-auto" />
            </Link>
            <p className="mt-5 font-serif text-2xl leading-none text-[var(--bravos-fire)]">Al León hay que darle carne</p>
            <p className="mt-3 text-sm leading-relaxed text-[#d9cdb9]">
              Cocina solo para delivery en Arequipa
            </p>
          </div>

          <div className="lg:order-3">
            <h3 className="font-dosis text-base font-semibold text-[var(--bravos-fire)]">Pedidos</h3>
            <ul className="mt-2 text-sm">
              <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bravos-footer-link">WhatsApp <span aria-hidden="true">↗</span></a></li>
            </ul>
          </div>

          <nav aria-label="Navegación del pie de página" className="lg:order-2">
            <h3 className="font-dosis text-base font-semibold text-[var(--bravos-fire)]">Navegación</h3>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 text-sm md:grid-cols-1">
              <li><Link href="/#inicio" className="bravos-footer-link">Inicio</Link></li>
              <li><Link href="/menu" className="bravos-footer-link">Menú</Link></li>
              <li><Link href="/#combos" className="bravos-footer-link">Para la Manchita</Link></li>
              <li><Link href="/#armar-orden" className="bravos-footer-link">Arma tu pedido</Link></li>
            </ul>
          </nav>

          <div className="lg:order-4">
            <h3 className="font-dosis text-base font-semibold text-[var(--bravos-fire)]">Social</h3>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Bravos"
              className="bravos-footer-link mt-2 text-sm"
            >
              <InstagramIcon /> @bravosgrillsmoke <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="bravos-footer-legal mt-8 border-t pt-5">
          <p className="text-xs leading-relaxed">
            © {new Date().getFullYear()} Bravos Grill &amp; Smoke · Arequipa, Perú
          </p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.8" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}
