/**
 * FRANJA 2026 — Inicio (placeholder for Phase A).
 *
 * Phase C will replace this with HeroCard, UpcomingSessions, QuickActions,
 * BusinessHourCard, and LiveAlertCard per the brief. For now it confirms
 * the brand tokens, ambient gradient, font, and layout chrome are all
 * wired up correctly.
 */
export default function InicioPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-[10px] tracking-[0.18em] uppercase text-franja-text-muted">
          9 + 10 julio · Corferias · Bogotá
        </p>
        <h1 className="text-2xl font-medium text-franja-gradient leading-tight">
          FRANJA 2026
        </h1>
        <p className="text-sm text-franja-text-secondary leading-relaxed">
          Estilo de vida, visión, moda y negocios.
        </p>
      </header>

      <section
        aria-label="Estado del build"
        className="rounded-2xl border border-franja-border bg-white/[0.06] p-5 backdrop-blur-sm"
      >
        <p className="text-[10px] tracking-wide uppercase text-franja-turquoise">
          Phase A · Foundation
        </p>
        <p className="mt-2 text-sm text-franja-text-secondary leading-relaxed">
          Scaffold listo: Next.js, Tailwind v4 con brand tokens, Inter, clientes
          de Supabase, layout público y navegación inferior. Pendiente: Phase B
          (migrations + seed) y Phase C (Inicio + Agenda).
        </p>
      </section>
    </div>
  );
}
