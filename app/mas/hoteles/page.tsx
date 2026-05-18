import { Hotel as HotelIcon } from "lucide-react";

/**
 * Hoteles — placeholder hasta que el admin cargue las recomendaciones
 * (tarifa preferencial + minutos a pie de Corferias).
 */
export default function HotelesPage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Hoteles</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Recomendaciones de alojamiento alrededor de Corferias.
        </p>
      </header>

      <div className="rounded-2xl border border-franja-border bg-white/5 p-8 text-center backdrop-blur-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-franja-pink/15 text-franja-pink">
          <HotelIcon size={26} strokeWidth={1.5} />
        </span>
        <p className="text-sm text-franja-text-secondary">Próximamente</p>
        <p className="mt-1 text-xs text-franja-text-muted">
          Estamos cerrando convenios con tarifa preferencial.
        </p>
      </div>
    </main>
  );
}
