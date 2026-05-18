import { listExhibitors } from "@/lib/queries/exhibitors";

/**
 * Empresas — placeholder list of expositores. Full Salón de Negocios
 * UI (filters, sponsor tiers, map link) lives in a follow-up commit;
 * this exists now so the bottom nav has somewhere to land and so the
 * 89 exhibitor rows seeded by migration 0003 are at least visible.
 */
export default async function EmpresasPage() {
  const exhibitors = await listExhibitors();

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Empresas
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          {exhibitors.length} empresas confirmadas en el Salón de Negocios.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {exhibitors.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-franja-border bg-white/5 p-4 backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-franja-text-primary">{e.name}</p>
            <p className="mt-1 text-xs text-franja-text-muted">
              Stand {e.booth_number ?? "—"}
              {e.country ? ` · ${e.country}` : ""}
            </p>
            {e.is_sponsor && e.sponsor_tier && (
              <span className="mt-2 inline-block rounded-full bg-franja-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-franja-gold">
                {e.sponsor_tier}
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
