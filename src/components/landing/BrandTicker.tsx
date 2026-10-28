// Frases sin precios: los precios viven en el menú y en el carrito, donde se pueden comparar.
const PHRASES = [
  "Solo delivery en Arequipa",
  "El León y La Gordita, a la plancha",
  "Pides por WhatsApp",
  "Pagas con Yape o Plin",
  "Combos para la manchita",
  "Al León hay que darle carne",
];

function TickerRun({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <p className="bravos-ticker-run" aria-hidden={duplicate || undefined}>
      {PHRASES.map((phrase) => (
        <span key={phrase} className="inline-flex items-center gap-6">
          {phrase}
          <span aria-hidden="true" className="text-[#16110E]">✦</span>
        </span>
      ))}
    </p>
  );
}

export function BrandTicker() {
  return (
    <div className="bravos-ticker" role="region" aria-label="Así funciona Bravos">
      <div className="bravos-ticker-track">
        <TickerRun />
        <TickerRun duplicate />
      </div>
    </div>
  );
}
