import Link from "next/link";
import { listExhibitors, listExhibitorCategories } from "@/lib/queries/exhibitors";
import type { ExhibitorWithCategory } from "@/lib/types";

/**
 * Empresas — las 89 expositoras agrupadas por categoría
 * (Laboratorios, Monturas, Equipos, etc.). Categorías sin items se
 * omiten. Las empresas sin categoría caen al final en "Otros".
 * Cada tarjeta enlaza al detalle /empresas/[slug].
 */
export default async function EmpresasPage() {
  const [exhibitors, categories]: [ExhibitorWithCategory[], Awaited<ReturnType<typeof listExhibitorCategories>>] = await Promise.all([
    listExhibitors().catch(() => [] as ExhibitorWithCategory[]),
    listExhibitorCategories().catch(() => []),
  ]);

  const byCat = new Map<string, ExhibitorWithCategory[]>();
  const uncategorized: ExhibitorWithCategory[] = [];
  for (const e of exhibitors) {
    if (e.category_id) {
      const arr = byCat.get(e.category_id) ?? [];
      arr.push(e);
      byCat.set(e.category_id, arr);
    } else {
      uncategorized.push(e);
    }
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Empresas</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          {exhibitors.length} empresas confirmadas en el Salón de Negocios.
        </p>
      </header>

      {exhibitors.length === 0 && (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Estamos cargando la lista de empresas.
        </div>
      )}

      {categories.map((cat) => {
        const items = byCat.get(cat.id);
        if (!items || items.length === 0) return null;
        return <CategoryBlock key={cat.id} title={cat.name} items={items} />;
      })}

      {uncategorized.length > 0 && (
        <CategoryBlock title="Otros" items={uncategorized} />
      )}
    </main>
  );
}

function CategoryBlock({
  title,
  items,
}: {
  title: string;
  items: { id: string; slug: string; name: string; booth_number: string | null; country: string | null; is_sponsor: boolean; sponsor_tier: string | null }[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
          {title}
        </h2>
        <span className="text-xs text-franja-text-muted">{items.length}</span>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {items.map((e) => (
          <li key={e.id}>
            <Link
              href={`/empresas/${e.slug}`}
              className="block rounded-2xl border border-franja-border bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
            >
              <p className="text-sm font-medium text-franja-text-primary truncate">{e.name}</p>
              <p className="mt-1 text-xs text-franja-text-muted">
                Stand {e.booth_number ?? "—"}
                {e.country ? ` · ${e.country}` : ""}
              </p>
              {e.is_sponsor && e.sponsor_tier && (
                <span className="mt-2 inline-block rounded-full bg-franja-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-franja-gold">
                  {e.sponsor_tier}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
