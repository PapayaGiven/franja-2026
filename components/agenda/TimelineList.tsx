import type { SymposiumWithRefs } from "@/lib/types";
import { SessionCard } from "./SessionCard";
import { formatClock } from "@/lib/utils/time";

/**
 * Groups sessions by start_time and renders each cluster under a
 * sticky time header — the "time gutter" the brief asks for, adapted
 * for narrow mobile widths (header above, cards below).
 */
export function TimelineList({
  sessions,
}: {
  sessions: SymposiumWithRefs[];
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-franja-text-muted text-center py-12 leading-relaxed">
        Ningún simposio coincide con los filtros.
        <br />
        Intenta limpiar la búsqueda o el área.
      </p>
    );
  }

  // Stable insertion-order grouping by HH:mm — sessions arrive sorted
  // ascending so the Map keys come out chronologically.
  const groups = new Map<string, SymposiumWithRefs[]>();
  for (const s of sessions) {
    const key = s.start_time.slice(0, 5);
    const bucket = groups.get(key) ?? [];
    bucket.push(s);
    groups.set(key, bucket);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([time, items]) => (
        <section key={time} aria-label={`Sesiones a las ${formatClock(time)}`}>
          <div className="sticky top-0 z-10 -mx-4 mb-2 bg-franja-bg/85 backdrop-blur-md px-4 py-1.5">
            <h3 className="text-xs tracking-[0.18em] uppercase text-franja-turquoise font-medium tabular-nums">
              {formatClock(time)}
            </h3>
          </div>
          <div className="space-y-2">
            {items.map((s) => (
              <SessionCard key={s.id} symposium={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
