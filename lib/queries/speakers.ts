import { createClient } from "@/lib/supabase/server";
import type { Speaker, Symposium, SymposiumRole } from "@/lib/types";

/**
 * Speaker queries — the /speakers list, individual speaker profile, and
 * the Directores sub-page filter ("speakers with director role").
 */

const BASE_COLUMNS = `
  id, slug, full_name, photo_url, country, country_code,
  specialty, institution, credentials, bio,
  website, linkedin, instagram, is_featured,
  created_at, updated_at
`;

/**
 * All speakers ordered by featured-first, then alphabetical.
 */
export async function listSpeakers(): Promise<Speaker[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("speakers")
    .select(BASE_COLUMNS)
    .order("is_featured", { ascending: false })
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Speaker[];
}

/**
 * Speakers that appear as `director` in at least one symposium_speakers
 * row. Powers /mas/directores. Uses a foreign-table inner-join filter so
 * Postgres dedupes naturally.
 */
export async function listDirectors(): Promise<Speaker[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("speakers")
    .select(`${BASE_COLUMNS}, symposium_speakers!inner(role)`)
    .eq("symposium_speakers.role", "director")
    .order("full_name", { ascending: true });
  if (error) throw error;
  // De-dup just in case the join surfaces a speaker multiple times.
  const seen = new Set<string>();
  return (data ?? []).filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  }) as Speaker[];
}

/**
 * Single speaker by slug. Returns null when no row matches.
 */
export async function getSpeakerBySlug(slug: string): Promise<Speaker | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("speakers")
    .select(BASE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Speaker) ?? null;
}

/**
 * Every symposium this speaker participates in, with their role. Used on
 * the speaker profile page to render "Dirige", "Modera", "Habla en"
 * sections.
 */
export async function listSymposiumsForSpeaker(
  speakerId: string,
): Promise<Array<Symposium & { role: SymposiumRole }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposium_speakers")
    .select(
      `role, symposium:symposiums(
        id, slug, kind, generic_category, official_name, subtitle, description,
        track_id, area_id, day, start_time, end_time,
        is_exclusive, exclusive_org, sponsor_brand,
        created_at, updated_at
      )`,
    )
    .eq("speaker_id", speakerId);
  if (error) throw error;

  type Row = { role: SymposiumRole; symposium: Symposium | null };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.symposium !== null)
    .map((r) => ({ ...(r.symposium as Symposium), role: r.role }))
    .sort((a, b) => {
      if (a.day !== b.day) return a.day.localeCompare(b.day);
      return a.start_time.localeCompare(b.start_time);
    });
}
