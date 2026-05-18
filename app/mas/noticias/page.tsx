import { Newspaper } from "lucide-react";

/**
 * Noticias — placeholder. El admin carga artículos sobre el evento;
 * el batch 0007 traerá el contenido real.
 */
export default function NoticiasPage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Noticias</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Últimas novedades del evento.
        </p>
      </header>

      <div className="rounded-2xl border border-franja-border bg-white/5 p-8 text-center backdrop-blur-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-franja-purple-light/15 text-franja-purple-light">
          <Newspaper size={26} strokeWidth={1.5} />
        </span>
        <p className="text-sm text-franja-text-secondary">Próximamente</p>
        <p className="mt-1 text-xs text-franja-text-muted">
          Las primeras noticias del evento se publican muy pronto.
        </p>
      </div>
    </main>
  );
}
