/**
 * Magnitud del evento — actualizado tras content drop 0003:
 *   26 simposios oficiales (incluye el nuevo "Mejora tu Vida con LC")
 *   15 talleres (algunos por confirmar)
 *   130+ conferencistas (~115 en DB, copy mantiene el "+" público)
 *   89 empresas expositoras confirmadas
 */
const STATS: { value: string; label: string; accent: "turquoise" | "purple" | "pink" | "gold" }[] = [
  { value: "26", label: "Simposios académicos", accent: "turquoise" },
  { value: "15", label: "Talleres por confirmar", accent: "gold" },
  { value: "130+", label: "Conferencistas", accent: "purple" },
  { value: "89", label: "Empresas expositoras", accent: "pink" },
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
