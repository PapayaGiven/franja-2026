import Link from "next/link";
import { CalendarDays, Map } from "lucide-react";

export default function AgendaMapaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-franja-border bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-sm font-medium text-franja-turquoise">
          FRANJA 2026
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Agenda y mapa
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/65">
          Consulta la programación académica del evento y ubica los espacios
          principales de FRANJA 2026 en Corferias.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/agenda"
          className="rounded-2xl border border-franja-border bg-white/5 p-5 transition hover:bg-white/10 hover:border-franja-border-strong active:scale-[0.98]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3DCDD0]/15 text-franja-turquoise">
            <CalendarDays size={22} strokeWidth={1.75} />
          </span>

          <h2 className="mt-5 text-xl font-semibold text-white">
            Agenda del evento
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Revisa horarios, salones, simposios, conferencias y actividades
            programadas.
          </p>
        </Link>

        <Link
          href="/mapa"
          className="rounded-2xl border border-franja-border bg-white/5 p-5 transition hover:bg-white/10 hover:border-franja-border-strong active:scale-[0.98]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0C75E]/15 text-franja-gold">
            <Map size={22} strokeWidth={1.75} />
          </span>

          <h2 className="mt-5 text-xl font-semibold text-white">
            Mapa del evento
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Consulta el mapa de ubicación de FRANJA 2026, salones, zonas y
            espacios principales.
          </p>
        </Link>
      </section>
    </div>
  );
}