import Image from "next/image";
import Link from "next/link";
import { BRAVOS_LOCATION_URL } from "@/src/data/contact";

const INSTAGRAM_URL =
  "https://www.instagram.com/bravosgrillsmoke?igsi=N2t0Zm5zNXNpYmpk";

export function FooterSimple() {
  return (
    <footer id="contacto" className="border-t border-[#c98a51]/20 bg-[#0d0907] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <Link
              href="/"
              aria-label="Bravos Burger, volver al inicio"
              className="relative block size-16 shrink-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68a48]"
            >
              <Image src="/bravos-logo.png" alt="Bravos Grill & Smoke" fill sizes="64px" className="object-cover" />
            </Link>
            <div>
              <p className="font-serif text-2xl font-bold leading-none text-[#fff0dc]">BRAVOS</p>
              <p className="mt-2 text-sm leading-relaxed text-[#c9ad91]">
                Secret Location<br />Dark Kitchen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3" aria-label="Enlaces de Bravos">
            {BRAVOS_LOCATION_URL ? (
              <a
                href={BRAVOS_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ubicación de Bravos"
                className="footer-icon-link"
              >
                <LocationIcon />
              </a>
            ) : (
              <span
                role="img"
                aria-label="Ubicación de Bravos pendiente de configurar"
                className="footer-icon-link cursor-not-allowed opacity-45"
                title="Enlace de ubicación pendiente"
              >
                <LocationIcon />
              </span>
            )}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Bravos"
              className="footer-icon-link"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 border-t border-[#c98a51]/12 pt-5">
          <span className="h-px flex-1 bg-gradient-to-r from-[#a96936]/35 to-transparent" aria-hidden="true" />
          <p className="text-center text-[.68rem] uppercase tracking-[.16em] text-[#806b59]">
            © {new Date().getFullYear()} Bravos Burger · Arequipa, Perú
          </p>
          <span className="h-px flex-1 bg-gradient-to-l from-[#a96936]/35 to-transparent" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
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
