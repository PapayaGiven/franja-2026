/**
 * Hero card — top of Inicio. Brand gradient per Section 3 of the brief.
 * Event name, tagline, date/location strip. Plain server-rendered.
 */
export function HeroCard() {
  return (
    <section className="bg-franja-gradient rounded-2xl p-6 shadow-lg shadow-franja-purple/20">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/80">
            9 + 10 julio · Corferias · Bogotá
          </p>
          <p className="text-sm text-white/85 leading-relaxed max-w-xs">
            Estilo de vida, visión, moda y negocios.
          </p>
        </div>

        <img
          src="https://assets.unlayer.com/projects/237/1779221268527-Imagen-02%20(1).png"
          alt="FRANJA 2026"
          className="h-16 w-auto object-contain shrink-0"
        />
      </div>
    </section>
  );
}