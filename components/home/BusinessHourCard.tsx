/**
 * Static schedule strip. Hours come from Section 11 (canonical content).
 * Hardcoded — these are facts about the venue, not editable in admin.
 */
const HOURS: { time: string; label: string }[] = [
  { time: "7:00 a.m.", label: "Inicio de registros" },
  { time: "8:00 a.m.", label: "Ingreso a salones de conferencias" },
  { time: "9:00 a.m.", label: "Salón de Negocios" },
  { time: "10:00 p.m.", label: "Cierre de actividades" },
];

export function BusinessHourCard() {
  return (
    <section
      aria-label="Horarios del evento"
      className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm p-5"
    >
      <h2 className="text-lg font-medium text-white">Horarios del evento</h2>
      <p className="text-xs text-franja-text-muted mt-1">
        Jueves 9 y viernes 10 de julio
      </p>
      <ul className="mt-4 space-y-2">
        {HOURS.map((h) => (
          <li
            key={h.label}
            className="flex items-baseline gap-3 text-sm"
          >
            <span className="text-franja-turquoise font-medium tabular-nums w-20 shrink-0">
              {h.time}
            </span>
            <span className="text-franja-text-secondary leading-relaxed">
              {h.label}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-franja-text-muted mt-4 leading-relaxed">
        Viernes 10 · coctel de cierre a las 10:00 p.m. en las instalaciones del
        evento.
      </p>
    </section>
  );
}
