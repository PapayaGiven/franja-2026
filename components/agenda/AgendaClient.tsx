"use client";

import { useMemo, useState } from "react";
import type { SymposiumWithRefs } from "@/lib/types";
import { DayToggle, type AgendaDay } from "./DayToggle";
import { SearchBar } from "./SearchBar";
import { TrackFilter, type TrackOption } from "./TrackFilter";
import { AreaFilter, type AreaOption } from "./AreaFilter";
import { TimelineList } from "./TimelineList";

/**
 * Holds all filter state for the agenda. Receives the full symposium
 * list from the server once and filters client-side per the brief
 * (Section 8, Phase C step 14). 50 rows is a tiny payload; not worth
 * round-tripping to Supabase on every keystroke.
 */
export function AgendaClient({
  symposiums,
}: {
  symposiums: SymposiumWithRefs[];
}) {
  const [day, setDay] = useState<AgendaDay>("2026-07-09");
  const [trackSlug, setTrackSlug] = useState<string | null>(null);
  const [areaSlug, setAreaSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Derive the filter dropdown options straight from the symposium
  // list — dedupes by slug and preserves track display order (which
  // came pre-sorted from the server query).
  const tracks = useMemo<TrackOption[]>(() => {
    const seen = new Map<string, TrackOption>();
    for (const s of symposiums) {
      if (s.track && !seen.has(s.track.slug)) {
        seen.set(s.track.slug, { slug: s.track.slug, name: s.track.name, color: s.track.color });
      }
    }
    return Array.from(seen.values());
  }, [symposiums]);

  const areas = useMemo<AreaOption[]>(() => {
    const seen = new Map<string, AreaOption>();
    for (const s of symposiums) {
      if (s.area && !seen.has(s.area.slug)) {
        seen.set(s.area.slug, { slug: s.area.slug, name: s.area.name });
      }
    }
    // Alphabetical for the area dropdown so it's easier to scan.
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [symposiums]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return symposiums.filter((s) => {
      if (s.day !== day) return false;
      if (trackSlug && s.track?.slug !== trackSlug) return false;
      if (areaSlug && s.area?.slug !== areaSlug) return false;
      if (q) {
        const hay = [
          s.official_name,
          s.subtitle,
          s.generic_category,
          s.track?.name,
          s.area?.name,
          s.exclusive_org,
          s.sponsor_brand,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [symposiums, day, trackSlug, areaSlug, search]);

  return (
    <div className="space-y-5">
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.18em] uppercase text-franja-text-muted">
            Programación oficial
          </p>
          <h1 className="text-2xl font-medium text-white">Agenda</h1>
        </div>
        <DayToggle value={day} onChange={setDay} />
        <SearchBar value={search} onChange={setSearch} />
        <TrackFilter tracks={tracks} value={trackSlug} onChange={setTrackSlug} />
        <AreaFilter areas={areas} value={areaSlug} onChange={setAreaSlug} />
      </header>

      <p className="text-xs text-franja-text-muted">
        {filtered.length}{" "}
        {filtered.length === 1 ? "simposio" : "simposios"} en este día
        {(trackSlug || areaSlug || search) && " con los filtros activos"}
      </p>

      <TimelineList sessions={filtered} />
    </div>
  );
}
