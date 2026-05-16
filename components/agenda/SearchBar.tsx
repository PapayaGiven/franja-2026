"use client";

import { Search, X } from "lucide-react";

/**
 * Always-visible search input. Filtering happens upstream in the agenda
 * client component (substring match over name / subtitle / track / area).
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar simposio, área o conferencista…",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        strokeWidth={1.75}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-franja-text-muted pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className="w-full rounded-xl border border-franja-border bg-white/5 pl-9 pr-9 py-2 text-sm text-white placeholder:text-franja-text-muted focus:outline-none focus:border-franja-turquoise focus:bg-white/[0.08] transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-franja-text-muted hover:text-white"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
