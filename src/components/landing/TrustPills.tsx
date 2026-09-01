export function TrustPills() {
  const pillars = [
    {
      title: "Preparación al Momento",
      description: "Cada hamburguesa y empanada se prepara al instante tras tu pedido.",
      tag: "FRESCO",
    },
    {
      title: "Fuego & Sellado",
      description: "Carne a plancha caliente para concentrar sabor y conservar la jugosidad.",
      tag: "PLANCHA",
    },
    {
      title: "Empanadas de Casa",
      description: "Rellenos cocidos con paciencia y horneados hasta lograr el punto justo.",
      tag: "HORNO",
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
              className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#17171a] p-5 transition-colors duration-200 hover:border-[#f97316]/30"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-dosis font-bold text-xs uppercase px-2.5 py-0.5 rounded bg-white/5 text-[#f59e0b] border border-white/10 group-hover:border-[#f59e0b]/30 transition-colors">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-[#f97316] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
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
