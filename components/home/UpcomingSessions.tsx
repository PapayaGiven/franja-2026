import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SymposiumWithRefs } from "@/lib/types";
import { SessionCard } from "@/components/agenda/SessionCard";

/**
 * "Próximas conferencias" preview on Inicio.
 *
 * The event runs July 9–10 2026. While we're still before the start
 * date this just shows the first few sessions chronologically as a
 * preview. Once the event begins we'll switch to "starts within X min"
 * logic backed by the favorites banner (Phase E).
 */
export function UpcomingSessions({
  sessions,
}: {
  sessions: SymposiumWithRefs[];
}) {
  if (!sessions.length) return null;

  return (
    <section aria-label="Próximas conferencias" className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-white">Próximas conferencias</h2>
        <Link
          href="/agenda"
          className="text-xs text-franja-turquoise inline-flex items-center gap-1 hover:underline"
        >
          Ver agenda completa
          <ArrowRight size={12} />
        </Link>
      </header>
      <div className="space-y-2">
        {sessions.map((s) => (
          <SessionCard key={s.id} symposium={s} />
        ))}
      </div>
    </section>
  );
}
