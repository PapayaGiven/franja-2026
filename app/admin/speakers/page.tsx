import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";
import { BulkPhotoUploader } from "./BulkPhotoUploader";
import type { Speaker } from "@/lib/types";

const PAGE_SIZE = 50;

/**
 * /admin/speakers — paginated list with always-visible search.
 *
 * The query runs through the service role client so admin reads are not
 * affected by RLS. `q` matches the speaker's name OR slug (case
 * insensitive). Pagination is `range(start, end)` and we ask for an
 * exact count so we can render "X of Y" and total page numbers.
 */
export default async function AdminSpeakersPage({
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
    .from("speakers")
    .select(
      "id, slug, full_name, photo_url, country, country_code, is_featured",
      { count: "exact" },
    )
    .order("is_featured", { ascending: false })
    .order("full_name", { ascending: true })
    .range(from, to);

  if (q) {
    // Escape PostgREST `or()` reserved chars by using a parenthesized
    // expression. The %-wrapped value goes inside ilike's pattern.
    const safe = q.replace(/[(),%]/g, " ").trim();
    builder = builder.or(`full_name.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }

  const [{ data, count, error }, allSpeakersRes] = await Promise.all([
    builder,
    // Full list (id, slug, full_name) for the bulk uploader's slug
    // matcher + per-file dropdown. ~115 rows so the payload stays tiny.
    supabase
      .from("speakers")
      .select("id, slug, full_name")
      .order("full_name", { ascending: true }),
  ]);
  if (error) throw error;
  if (allSpeakersRes.error) throw allSpeakersRes.error;

  const speakers = (data ?? []) as Array<
    Pick<
      Speaker,
      "id" | "slug" | "full_name" | "photo_url" | "country" | "country_code" | "is_featured"
    >
  >;
  const allSpeakers = (allSpeakersRes.data ?? []) as Array<
    Pick<Speaker, "id" | "slug" | "full_name">
  >;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-franja-text-primary">
            Speakers
          </h1>
          <p className="text-sm text-franja-text-muted">
            {total} {total === 1 ? "conferencista" : "conferencistas"}
            {q ? ` que coinciden con "${q}"` : ""}.
          </p>
        </div>

        <BulkPhotoUploader speakers={allSpeakers} />
      </header>

      <SearchForm initialValue={q} />

      <div className="overflow-hidden rounded-xl border border-franja-border bg-franja-bg-elevated/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-franja-border text-left text-xs uppercase tracking-wider text-franja-text-muted">
              <th className="px-4 py-2 font-medium">Conferencista</th>
              <th className="px-4 py-2 font-medium">País</th>
              <th className="px-4 py-2 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {speakers.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-12 text-center text-sm text-franja-text-muted"
                >
                  {q
                    ? "Sin resultados para esa búsqueda."
                    : "Aún no hay conferencistas cargados."}
                </td>
              </tr>
            )}
            {speakers.map((s) => (
              <tr
                key={s.id}
                className="border-b border-franja-border/40 last:border-0"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <SpeakerAvatar
                      photoUrl={s.photo_url}
                      name={s.full_name}
                      size={32}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-franja-text-primary">
                        {s.full_name}
                        {s.is_featured && (
                          <span className="ml-2 align-middle rounded-full bg-franja-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-franja-gold">
                            destacado
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-franja-text-muted">
                        {s.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-franja-text-muted">
                  {s.country ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/speakers/${s.slug}`}
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
      action="/admin/speakers"
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
          placeholder="Buscar por nombre o slug…"
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
    return qs ? `/admin/speakers?${qs}` : "/admin/speakers";
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
