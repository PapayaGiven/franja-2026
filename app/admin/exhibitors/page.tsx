import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ExhibitorLogo } from "@/components/admin/ExhibitorLogo";
import { BulkLogoUploader } from "./BulkLogoUploader";
import type { Exhibitor, ExhibitorCategory } from "@/lib/types";

const PAGE_SIZE = 50;

type Row = Pick<
  Exhibitor,
  "id" | "slug" | "name" | "logo_url" | "country" | "booth_number" | "is_sponsor" | "sponsor_tier" | "category_id"
>;

/**
 * /admin/exhibitors — paginated list with search by name OR booth.
 * Mirrors /admin/speakers but for the exhibitors table; the category
 * label is resolved client-side via a map of category_id → name so we
 * don't pay for a join on every row.
 */
export default async function AdminExhibitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qRaw, page: pageRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);

  const supabase = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let builder = supabase
    .from("exhibitors")
    .select(
      "id, slug, name, logo_url, country, booth_number, is_sponsor, sponsor_tier, category_id",
      { count: "exact" },
    )
    .order("is_sponsor", { ascending: false })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) {
    const safe = q.replace(/[(),%]/g, " ").trim();
    builder = builder.or(
      `name.ilike.%${safe}%,booth_number.ilike.%${safe}%,slug.ilike.%${safe}%`,
    );
  }

  const [{ data, count, error }, allExhibitorsRes, categoriesRes] = await Promise.all([
    builder,
    // For the bulk uploader: full id/slug/name list so the matcher
    // can map filename → exhibitor and the dropdown is populated.
    supabase
      .from("exhibitors")
      .select("id, slug, name")
      .order("name", { ascending: true }),
    supabase
      .from("exhibitor_categories")
      .select("id, slug, name, display_order")
      .order("display_order"),
  ]);
  if (error) throw error;
  if (allExhibitorsRes.error) throw allExhibitorsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  const rows = (data ?? []) as Row[];
  const allExhibitors = (allExhibitorsRes.data ?? []) as Array<
    Pick<Exhibitor, "id" | "slug" | "name">
  >;
  const categories = (categoriesRes.data ?? []) as ExhibitorCategory[];
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-franja-text-primary">Empresas</h1>
          <p className="text-sm text-franja-text-muted">
            {total} {total === 1 ? "empresa" : "empresas"}
            {q ? ` que coinciden con "${q}"` : ""}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/exhibitors/new"
            className="inline-flex items-center gap-2 rounded-md border border-franja-turquoise/60 bg-franja-turquoise/10 px-3 py-1.5 text-xs font-semibold text-franja-turquoise transition hover:bg-franja-turquoise/20"
          >
            <Plus size={12} strokeWidth={2.5} />
            Agregar nueva empresa
          </Link>
          <BulkLogoUploader exhibitors={allExhibitors} />
        </div>
      </header>

      <SearchForm initialValue={q} />

      <div className="overflow-hidden rounded-xl border border-franja-border bg-franja-bg-elevated/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-franja-border text-left text-xs uppercase tracking-wider text-franja-text-muted">
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Stand</th>
              <th className="px-4 py-2 font-medium">País</th>
              <th className="px-4 py-2 font-medium">Categoría</th>
              <th className="px-4 py-2 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-franja-text-muted"
                >
                  {q
                    ? "Sin resultados para esa búsqueda."
                    : "Aún no hay empresas cargadas."}
                </td>
              </tr>
            )}
            {rows.map((e) => (
              <tr
                key={e.id}
                className="border-b border-franja-border/40 last:border-0"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <ExhibitorLogo logoUrl={e.logo_url} name={e.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-franja-text-primary">
                        {e.name}
                        {e.is_sponsor && e.sponsor_tier && (
                          <span className="ml-2 align-middle rounded-full bg-franja-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-franja-gold">
                            {e.sponsor_tier}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-franja-text-muted">
                        {e.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-franja-text-muted">
                  {e.booth_number ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-franja-text-muted">
                  {e.country ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-franja-text-muted">
                  {e.category_id ? categoryName.get(e.category_id) ?? "—" : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/exhibitors/${e.slug}`}
                    className="inline-block rounded-md border border-franja-border px-2.5 py-1 text-xs text-franja-text-primary transition hover:border-franja-turquoise/60 hover:text-franja-turquoise"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        q={q}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
}

function SearchForm({ initialValue }: { initialValue: string }) {
  return (
    <form
      action="/admin/exhibitors"
      method="get"
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-franja-text-muted"
        />
        <input
          type="search"
          name="q"
          defaultValue={initialValue}
          placeholder="Buscar por nombre, stand o slug…"
          className="w-full rounded-md border border-franja-border bg-franja-bg/60 py-2 pl-9 pr-3 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
        />
      </div>
      <button
        type="submit"
        className="rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-xs text-franja-text-primary transition hover:border-franja-turquoise/60"
      >
        Buscar
      </button>
    </form>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  q,
  hasPrev,
  hasNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  q: string;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  if (total === 0) return null;
  const buildHref = (n: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/admin/exhibitors?${qs}` : "/admin/exhibitors";
  };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-xs text-franja-text-muted">
      <p>
        {start}–{end} de {total}
      </p>
      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={buildHref(page - 1)}
            className="inline-flex items-center gap-1 rounded-md border border-franja-border px-2.5 py-1 text-franja-text-primary transition hover:border-franja-turquoise/60"
          >
            <ChevronLeft size={12} />
            Anterior
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-franja-border/40 px-2.5 py-1 text-franja-text-muted/50">
            <ChevronLeft size={12} />
            Anterior
          </span>
        )}
        <span className="px-2 text-franja-text-muted">
          Pág. {page} / {totalPages}
        </span>
        {hasNext ? (
          <Link
            href={buildHref(page + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-franja-border px-2.5 py-1 text-franja-text-primary transition hover:border-franja-turquoise/60"
          >
            Siguiente
            <ChevronRight size={12} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-franja-border/40 px-2.5 py-1 text-franja-text-muted/50">
            Siguiente
            <ChevronRight size={12} />
          </span>
        )}
      </div>
    </div>
  );
}
