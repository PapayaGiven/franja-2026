/**
 * Magnitud numbers from Section 11 of the brief — hardcoded since the
 * 130+ / 120+ figures are PR copy, not DB-derived. If the actual seeded
 * counts diverge later we can swap to live counts via a server query.
 */
const STATS: { value: string; label: string; accent: "turquoise" | "purple" | "pink" | "gold" }[] = [
  { value: "24", label: "Simposios académicos", accent: "turquoise" },
  { value: "15", label: "Talleres", accent: "gold" },
  { value: "130+", label: "Conferencistas", accent: "purple" },
  { value: "120+", label: "Empresas expositoras", accent: "pink" },
];

const ACCENT: Record<"turquoise" | "purple" | "pink" | "gold", string> = {
  turquoise: "text-franja-turquoise",
  purple: "text-franja-purple-light",
  pink: "text-franja-pink",
  gold: "text-franja-gold",
};

export function StatsGrid() {
  return (
    <section aria-label="Magnitud del evento" className="grid grid-cols-2 gap-3">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm p-4"
        >
          <p className={`text-2xl font-medium ${ACCENT[s.accent]}`}>{s.value}</p>
          <p className="text-xs text-franja-text-muted mt-1 leading-snug">
            {s.label}
          </p>
        </div>
      ))}
    </section>
  );
}
