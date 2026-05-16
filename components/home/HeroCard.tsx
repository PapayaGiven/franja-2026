/**
 * Hero card — top of Inicio. Brand gradient per Section 3 of the brief.
 * Event name, tagline, date/location strip. Plain server-rendered.
 */
export function HeroCard() {
  return (
    <section className="bg-franja-gradient rounded-2xl p-6 space-y-3 shadow-lg shadow-franja-purple/20">
      <p className="text-[10px] tracking-[0.18em] uppercase text-white/80">
        9 + 10 julio · Corferias · Bogotá
      </p>
      <h1 className="text-2xl font-medium text-white leading-tight">
        FRANJA 2026
      </h1>
      <p className="text-sm text-white/85 leading-relaxed max-w-xs">
        Estilo de vida, visión, moda y negocios.
      </p>
    </section>
  );
}
