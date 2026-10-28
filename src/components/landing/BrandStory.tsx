import Image from "next/image";

export function BrandStory() {
  return (
    <section
      aria-labelledby="bravos-story-title"
      className="relative overflow-hidden bg-[var(--bravos-charcoal)] px-4 py-16 text-[var(--bravos-cream)] sm:px-6 sm:py-20 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_24%_50%,rgba(179,86,41,.26),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-[15rem] sm:max-w-xs lg:max-w-md">
          <Image
            src="/brand/bravos-escudo.png"
            alt="Escudo de Bravos Grill & Smoke"
            width={1043}
            height={937}
            sizes="(min-width: 1024px) 448px, (min-width: 640px) 320px, 240px"
            loading="lazy"
            className="h-auto w-full drop-shadow-[0_20px_45px_rgba(0,0,0,.5)]"
          />
        </div>

        <div className="max-w-xl">
          <h2 id="bravos-story-title" className="font-brush text-[2.75rem] leading-[1.02] sm:text-6xl xl:text-7xl">
            Cuando el hambre ruge, el León pide carne
          </h2>
          <p className="mt-6 text-base leading-7 text-[#e6dac6] sm:text-lg sm:leading-8">
            Bravos es una cocina de Arequipa que trabaja solo para delivery. Sellamos la carne en plancha bien caliente, le ponemos queso fundido y salsa de la casa, y te la mandamos a la puerta. Doble carne si el hambre ruge, combos si viene la manchita.
          </p>
          <a href="#armar-orden" className="bravos-button tap mt-8">Armar mi pedido</a>
        </div>
      </div>
    </section>
  );
}
