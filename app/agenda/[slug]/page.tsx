import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, MapPin } from "lucide-react";
import {
  getSymposiumBySlug,
  listSymposiumBrands,
} from "@/lib/queries/symposiums";
import { listCategories } from "@/lib/queries/categories";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";
import { formatClock, formatLongDate } from "@/lib/utils/time";
import type { SymposiumSpeakerLink } from "@/lib/types";

/**
 * Detalle de un simposio. URL: /agenda/[slug]
 *
 * Orden de bloques: header → director(es) → Fabricantes participantes
 * (si hay) → descripción → ponencias. Las marcas son decorativas
 * (logos no clickeables); placeholder gris hasta que el admin suba
 * logo_url.
 */

interface Params {
  slug: string;
}

export default async function SymposiumDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [symposium, brands, categories] = await Promise.all([
    getSymposiumBySlug(slug),
    // Defer brands until we have an ID — listSymposiumBrands needs it.
    // We'll re-fetch below after the symposium resolves.
    Promise.resolve([]),
    listCategories(),
  ]);
  if (!symposium) notFound();

  const symposiumBrands = await listSymposiumBrands(symposium.id);
  void brands; // placeholder declared above for parallelism clarity

  const category = categories.find((c) => c.id === symposium.category_id) ?? null;
  const categoryColor = category?.color ?? symposium.track?.color ?? "#3DCDD0";

  const directors = symposium.participants?.filter((p) => p.role === "director") ?? [];
  const moderators = symposium.participants?.filter((p) => p.role === "moderator") ?? [];
  const speakers = symposium.participants?.filter((p) => p.role === "speaker") ?? [];

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <Link
        href="/agenda"
        className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted hover:text-franja-text-primary transition"
      >
        <ChevronLeft size={14} />
        Agenda
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: `${categoryColor}22`,
                color: categoryColor,
              }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              {category.name}
            </span>
          )}
          {symposium.track && (
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: `${symposium.track.color}22`,
                color: symposium.track.color,
              }}
            >
              {symposium.track.name}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-medium text-franja-text-primary leading-tight">
          {symposium.official_name}
        </h1>
        {symposium.subtitle && (
          <p className="text-sm text-franja-text-secondary leading-snug">
            {symposium.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-franja-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} />
            {formatLongDate(symposium.day)} · {formatClock(symposium.start_time)}–{formatClock(symposium.end_time)}
          </span>
          {symposium.area && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} />
              {symposium.area.name}
            </span>
          )}
        </div>
      </header>

      {/* Directores */}
      {directors.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            {directors.length > 1 ? "Directores" : "Director"}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {directors.map((d) => (
              <ParticipantCard key={d.speaker_id} p={d} />
            ))}
          </ul>
        </section>
      )}

      {/* Fabricantes participantes — placeholder gris hasta que haya logo_url */}
      {symposiumBrands.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Fabricantes participantes
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {symposiumBrands.map((b) => (
              <li
                key={b.id}
                className="flex h-20 items-center justify-center rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm text-center px-3"
                aria-label={`Fabricante: ${b.brand_name}`}
              >
                {b.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.logo_url}
                    alt={b.brand_name}
                    className="max-h-12 max-w-full object-contain opacity-90"
                  />
                ) : (
                  <span className="text-xs font-medium text-franja-text-secondary leading-snug">
                    {b.brand_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Descripción */}
      {symposium.description && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Sobre este simposio
          </h2>
          <p className="text-sm leading-relaxed text-franja-text-secondary whitespace-pre-line">
            {symposium.description}
          </p>
        </section>
      )}

      {/* Moderadores */}
      {moderators.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            {moderators.length > 1 ? "Moderadores" : "Moderador"}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {moderators.map((m) => (
              <ParticipantCard key={m.speaker_id} p={m} />
            ))}
          </ul>
        </section>
      )}

      {/* Ponentes */}
      {speakers.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Ponentes
          </h2>
          <ul className="flex flex-wrap gap-3">
            {speakers.map((s) => (
              <ParticipantCard key={s.speaker_id} p={s} />
            ))}
          </ul>
        </section>
      )}

      {/* Conferencias */}
      {symposium.conferences && symposium.conferences.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Ponencias
          </h2>
          <ol className="space-y-2">
            {symposium.conferences
              .slice()
              .sort((a, b) => a.display_order - b.display_order)
              .map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-franja-border bg-white/5 backdrop-blur-sm p-3"
                >
                  <p className="text-sm font-medium text-franja-text-primary leading-snug">
                    {c.title}
                  </p>
                  {(c.start_time || c.duration_min) && (
                    <p className="mt-1 text-xs text-franja-text-muted">
                      {c.start_time ? formatClock(c.start_time) : ""}
                      {c.start_time && c.duration_min ? " · " : ""}
                      {c.duration_min ? `${c.duration_min} min` : ""}
                    </p>
                  )}
                </li>
              ))}
          </ol>
        </section>
      )}
    </main>
  );
}

function ParticipantCard({ p }: { p: SymposiumSpeakerLink }) {
  return (
    <li className="flex items-center gap-3">
      <SpeakerAvatar photoUrl={p.speaker.photo_url} name={p.speaker.full_name} size={44} />
      <div className="min-w-0">
        <Link
          href={`/speakers/${p.speaker.slug}`}
          className="block text-sm font-medium text-franja-text-primary leading-tight hover:text-franja-turquoise transition"
        >
          {p.speaker.full_name}
        </Link>
        {p.speaker.credentials && (
          <p className="text-[11px] text-franja-text-muted leading-tight">
            {p.speaker.credentials}
          </p>
        )}
        {p.speaker.country && (
          <p className="text-[11px] text-franja-text-muted leading-tight">
            {p.speaker.country_code ? `${p.speaker.country_code} · ` : ""}
            {p.speaker.country}
          </p>
        )}
      </div>
    </li>
  );
}
