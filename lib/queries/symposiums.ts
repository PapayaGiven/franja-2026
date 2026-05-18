import { createClient } from "@/lib/supabase/server";
import type {
  Symposium,
  SymposiumBrand,
  SymposiumDetail,
  SymposiumWithRefs,
} from "@/lib/types";

/**
 * Symposium queries used by the agenda, symposium detail, and the
 * gremiales / directores sub-pages.
 *
 * All queries run through the user-scoped server client so they go
 * through the public-read RLS policy. The select strings hand-pick the
 * columns we actually need to keep the wire payload small.
 */

const BASE_COLUMNS = `
  id, slug, kind, generic_category, official_name, subtitle, description,
  track_id, area_id, category_id, day, start_time, end_time,
  is_exclusive, exclusive_org, sponsor_brand,
  created_at, updated_at
`;

const WITH_REFS_SELECT = `
  ${BASE_COLUMNS},
  track:tracks(slug, name, color),
  area:areas(slug, name)
`;

/**
 * Every symposium ordered by day → start_time. The agenda fetches once
 * and filters client-side per the brief (Section 8, Phase C step 14).
 */
export async function listSymposiums(): Promise<SymposiumWithRefs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposiums")
    .select(WITH_REFS_SELECT)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SymposiumWithRefs[];
}

/**
 * Single symposium by slug + its directors / moderators / speakers and
 * any conferences inside it. Powers /agenda/[slug].
 */
export async function getSymposiumBySlug(
  slug: string,
): Promise<SymposiumDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposiums")
    .select(
      `
      ${WITH_REFS_SELECT},
      participants:symposium_speakers(
        speaker_id, role, display_order,
        speaker:speakers(id, slug, full_name, photo_url, credentials, country, country_code)
      ),
      conferences(id, symposium_id, title, start_time, duration_min, display_order, created_at)
    `,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as unknown as SymposiumDetail;
}

/**
 * Symposiums where at least one participant is flagged 'director'.
 * Used by the Directores sub-page (lists the directors with the
 * sessions they're leading).
 */
export async function listSymposiumsWithRole(
  role: "director" | "moderator" | "speaker",
): Promise<Symposium[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposiums")
    .select(`${BASE_COLUMNS}, symposium_speakers!inner(role)`)
    .eq("symposium_speakers.role", role)
    .order("day")
    .order("start_time");
  if (error) throw error;
  return (data ?? []) as unknown as Symposium[];
}

/**
 * Symposiums in a given category (Clínicos / Negocios / Técnicos /
 * Académicos). Joins through simposio_categories.slug → category_id so
 * callers can pass the slug directly. Powers /simposios.
 */
export async function listSimposiosByCategory(
  slug: string,
): Promise<SymposiumWithRefs[]> {
  const supabase = await createClient();
  const { data: cat, error: catErr } = await supabase
    .from("simposio_categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (catErr) throw catErr;
  if (!cat) return [];

  const { data, error } = await supabase
    .from("symposiums")
    .select(WITH_REFS_SELECT)
    .eq("category_id", cat.id)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SymposiumWithRefs[];
}

/**
 * Marcas / fabricantes participantes de un simposio (logos decorativos).
 * Source: symposium_brands — migration 0003.
 */
export async function listSymposiumBrands(
  symposiumId: string,
): Promise<SymposiumBrand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposium_brands")
    .select(
      "id, symposium_id, brand_name, brand_slug, logo_url, display_order, created_at",
    )
    .eq("symposium_id", symposiumId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SymposiumBrand[];
}

/**
 * Exclusive / gremial sessions — the Reuniones Gremiales sub-page.
 * Either explicitly is_exclusive=true OR linked to ASOSAVIN/ORTOS/ALDOO
 * via exclusive_org.
 */
export async function listGremiales(): Promise<SymposiumWithRefs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("symposiums")
    .select(WITH_REFS_SELECT)
    .or(
      "is_exclusive.eq.true,exclusive_org.in.(ASOSAVIN,ORTOS,ALDOO)",
    )
    .order("day")
    .order("start_time");
  if (error) throw error;
  return (data ?? []) as unknown as SymposiumWithRefs[];
}
