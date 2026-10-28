export function TrustPills() {
  const pillars = [
    {
      title: "Preparación al Momento",
      description: "Cada hamburguesa se prepara al instante tras tu pedido.",
      tag: "FRESCO",
    },
    {
      title: "Fuego & Sellado",
      description: "Carne a plancha caliente para concentrar sabor y conservar la jugosidad.",
      tag: "PLANCHA",
    },
    {
      title: "Dark Kitchen en Arequipa",
      description: "Diseñado para llegar en su punto perfecto directamente a tu hogar.",
      tag: "DELIVERY",
    },
  ];

  return (
    <section id="filosofia" className="border-y border-white/5 bg-[#121215]/50 px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#211A15] p-5 transition-colors duration-200 hover:border-[#E0793E]/30"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-dosis font-bold text-xs uppercase px-2.5 py-0.5 rounded bg-white/5 text-[#E0793E] border border-white/10 group-hover:border-[#E0793E]/30 transition-colors">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-[#E0793E] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#A39A8E] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
