"use client";

/**
 * Color-coded track pill row. "Todas" is the no-filter state. Each
 * other pill is tinted with the track's hex when active.
 *
 * Why inline styles for the active color: Tailwind v4 still generates
 * utilities at build time, so we can't bind a dynamic hex to e.g.
 * `bg-[${color}]`. Falling back to style="" keeps the data-driven
 * track colors honest (admin can edit the hex in Supabase later).
 */
export type TrackOption = { slug: string; name: string; color: string };

export function TrackFilter({
  tracks,
  value,
  onChange,
}: {
  tracks: TrackOption[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <div role="group" aria-label="Filtrar por sala" className="flex gap-1.5 flex-wrap">
      <FilterPill active={value === null} onClick={() => onChange(null)}>
        Todas las salas
      </FilterPill>
      {tracks.map((t) => {
        const active = value === t.slug;
        return (
          <FilterPill
            key={t.slug}
            active={active}
            color={t.color}
            onClick={() => onChange(active ? null : t.slug)}
          >
            {t.name}
          </FilterPill>
        );
      })}
    </div>
  );
}

function FilterPill({
  active,
  color,
  children,
  onClick,
}: {
  active: boolean;
  color?: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  // Active styling either uses the track color (when provided) or the
  // turquoise default (for the "Todas" pill).
  const activeStyle = active && color
    ? { backgroundColor: color, color: "#0F0820", borderColor: color }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={activeStyle}
      className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide border transition ${
        active
          ? color
            ? "" // colored variant — handled by inline style
            : "bg-franja-turquoise text-franja-bg border-franja-turquoise"
          : "bg-white/5 text-franja-text-secondary border-franja-border hover:text-white hover:border-franja-border-strong"
      }`}
    >
      {children}
    </button>
  );
}
