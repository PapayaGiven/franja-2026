"use client";

import { ChevronDown } from "lucide-react";

/**
 * Area filter — there are 27 areas in the seed so a chip row would
 * overflow on mobile. Native `<select>` keeps the UX tight and gets
 * platform niceties (Cmd-F search, etc.) for free.
 */
export type AreaOption = { slug: string; name: string };

export function AreaFilter({
  areas,
  value,
  onChange,
}: {
  areas: AreaOption[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Filtrar por área"
        className="appearance-none w-full rounded-xl border border-franja-border bg-white/5 pl-3 pr-9 py-2 text-sm text-white focus:outline-none focus:border-franja-turquoise"
      >
        <option value="" className="bg-franja-bg">
          Todas las áreas
        </option>
        {areas.map((a) => (
          <option key={a.slug} value={a.slug} className="bg-franja-bg">
            {a.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.75}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-franja-text-muted pointer-events-none"
      />
    </div>
  );
}
