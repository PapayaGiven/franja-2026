import { Map as MapIcon } from "lucide-react";

/**
 * Mapa — placeholder hasta que carguemos el plano interactivo de
 * Corferias. El PDF llegará en un batch posterior.
 */
export default function MapaPage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Mapa</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Corferias · Bogotá · 9–10 julio 2026
        </p>
      </header>

      <div className="rounded-2xl border border-franja-border bg-white/5 p-8 text-center backdrop-blur-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-franja-turquoise/15 text-franja-turquoise">
          <MapIcon size={26} strokeWidth={1.5} />
        </span>
        <p className="text-sm text-franja-text-secondary">
          El mapa interactivo estará disponible próximamente.
        </p>
        <p className="mt-1 text-xs text-franja-text-muted">
          Mientras tanto, consulta el número de stand en cada empresa.
        </p>
      </div>
    </main>
  );
}
