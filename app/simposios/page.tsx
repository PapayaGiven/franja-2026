import Link from "next/link";
import { listCategories } from "@/lib/queries/categories";
import { listSymposiums } from "@/lib/queries/symposiums";
import type { SymposiumWithRefs } from "@/lib/types";

/**
 * Simposios — los 26 simposios oficiales agrupados por categoría
 * (Clínicos · Negocios · Técnicos · Académicos). El color de la pildora
 * del grupo viene de simposio_categories.color (0003).
 *
 * Cada tarjeta enlaza a /agenda/[slug] (página de detalle existente).
 */
export default async function SimposiosPage() {
  const [categories, allSymposiums] = await Promise.all([
    listCategories(),
    listSymposiums(),
  ]);

  // Bucket by category_id. Symposiums sin categoría caen al final.
  const buckets = new Map<string, SymposiumWithRefs[]>();
  const uncategorized: SymposiumWithRefs[] = [];
  for (const s of allSymposiums) {
    if (s.category_id) {
      const arr = buckets.get(s.category_id) ?? [];
      arr.push(s);
      buckets.set(s.category_id, arr);
    } else {
      uncategorized.push(s);
    }
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Simposios
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          26 simposios académicos organizados por categoría.
        </p>
      </header>

      {categories.map((cat) => {
        const items = buckets.get(cat.id) ?? [];
        if (items.length === 0) return null;
        const color = cat.color ?? "#3DCDD0";
        return (
          <section key={cat.id} aria-labelledby={`cat-${cat.slug}`} className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2
                id={`cat-${cat.slug}`}
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color }}
              >
                {cat.name}
              </h2>
              <span className="text-xs text-franja-text-muted">{items.length}</span>
            </div>

            {cat.description && (
              <p className="text-xs text-franja-text-muted leading-snug">{cat.description}</p>
            )}

            <ul className="grid grid-cols-1 gap-3">
              {items.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/agenda/${s.slug}`}
                    className="block rounded-2xl border border-franja-border bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <p className="text-sm font-medium text-franja-text-primary leading-snug">
                      {s.official_name}
                    </p>
                    {s.subtitle && (
                      <p className="mt-1 text-xs text-franja-text-muted leading-snug">
                        {s.subtitle}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {uncategorized.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-franja-text-muted">
            Sin categoría
          </h2>
          <ul className="grid grid-cols-1 gap-3">
            {uncategorized.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/agenda/${s.slug}`}
                  className="block rounded-2xl border border-franja-border bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <p className="text-sm font-medium text-franja-text-primary leading-snug">
                    {s.official_name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
