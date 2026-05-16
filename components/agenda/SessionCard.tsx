import Link from "next/link";
import type { SymposiumWithRefs } from "@/lib/types";
import { formatClock } from "@/lib/utils/time";

/**
 * Compact session row used on Inicio (UpcomingSessions) and Agenda
 * (TimelineList). Color-coded by track: the track's hex drives both
 * the left border and the track-name accent.
 *
 * The whole card links to /agenda/[slug]. Detail page lands next
 * session; in the meantime the link will 404 on tap — acceptable for
 * a Phase C ship.
 */
export function SessionCard({ symposium }: { symposium: SymposiumWithRefs }) {
  const trackColor = symposium.track?.color ?? "#3DCDD0";

  return (
    <Link href={`/agenda/${symposium.slug}`} className="block group">
      <article
        className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm p-4 transition group-hover:bg-white/[0.08] group-hover:border-franja-border-strong"
        style={{ borderLeftWidth: "3px", borderLeftColor: trackColor }}
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-xs text-franja-text-muted tabular-nums">
            {formatClock(symposium.start_time)} – {formatClock(symposium.end_time)}
          </p>
          {symposium.track && (
            <span
              className="text-[10px] tracking-[0.12em] uppercase font-medium truncate"
              style={{ color: trackColor }}
            >
              {symposium.track.name}
            </span>
          )}
        </div>

        {symposium.generic_category && (
          <p className="text-[10px] tracking-[0.1em] uppercase text-franja-text-muted">
            {symposium.generic_category}
          </p>
        )}

        <h3 className="text-base font-medium text-white mt-1 leading-snug">
          {symposium.official_name}
        </h3>

        {symposium.subtitle && (
          <p className="text-xs italic text-franja-text-secondary mt-1 leading-relaxed">
            {symposium.subtitle}
          </p>
        )}

        {(symposium.is_exclusive || symposium.sponsor_brand || symposium.area) && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {symposium.area && (
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide bg-white/5 text-franja-text-secondary border border-franja-border">
                {symposium.area.name}
              </span>
            )}
            {symposium.is_exclusive && symposium.exclusive_org && (
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide bg-franja-pink/15 text-franja-pink border border-franja-pink/30">
                Exclusiva · {symposium.exclusive_org}
              </span>
            )}
            {symposium.sponsor_brand && (
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide bg-franja-gold/15 text-franja-gold border border-franja-gold/30">
                {symposium.sponsor_brand}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
