import Link from "next/link";
import { listCategories } from "@/lib/queries/categories";
import { listSimposiosByCategory } from "@/lib/queries/symposiums";
import type { SimposioCategory, SymposiumWithRefs } from "@/lib/types";

/**
 * Simposios — los 26 simposios oficiales agrupados por las 4 categorías
 * (Clínicos · Negocios · Técnicos · Académicos). El color de la pildora
 * del grupo viene de simposio_categories.color (migración 0003).
 *
 * Toda fetch va envuelta en try/catch: si la migración 0003 no está
 * aplicada en un entorno (o RLS bloquea), la página renderiza un estado
 * vacío amigable en lugar de devolver 500.
 */
async function safeCategories(): Promise<SimposioCategory[]> {
  try {
    return await listCategories();
  } catch {
    return [];
  }
}

async function safeByCategory(slug: string): Promise<SymposiumWithRefs[]> {
  try {
    return await listSimposiosByCategory(slug);
  } catch {
    return [];
  }
}

export default async function SimposiosPage() {
  const categories = await safeCategories();
  const buckets = await Promise.all(
    categories.map(async (cat) => ({
      cat,
      items: await safeByCategory(cat.slug),
    })),
  );

  const hasContent = buckets.some((b) => b.items.length > 0);

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

      {!hasContent && (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Estamos terminando de cargar los simposios. Vuelve en un momento.
        </div>
      )}

      {buckets.map(({ cat, items }) => {
        if (items.length === 0) return null;
        const color = cat.color ?? "#3DCDD0";
        return (
          <CategoryBlock
            key={cat.id}
            color={color}
            slug={cat.slug}
            name={cat.name}
            description={cat.description}
            items={items}
          />
        );
      })}
    </main>
  );
}

function CategoryBlock({
  slug,
  name,
  description,
  color,
  items,
}: {
  slug: string;
  name: string;
  description: string | null;
  color: string;
  items: SymposiumWithRefs[];
}) {
  return (
    <section aria-labelledby={`cat-${slug}`} className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2
          id={`cat-${slug}`}
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color }}
        >
          {name}
        </h2>
        <span className="text-xs text-franja-text-muted">{items.length}</span>
      </div>

      {description && (
        <p className="text-xs text-franja-text-muted leading-snug">{description}</p>
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
}
