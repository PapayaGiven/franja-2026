import { createClient } from "@/lib/supabase/server";
import type {
  Exhibitor,
  ExhibitorCategory,
  ExhibitorWithCategory,
} from "@/lib/types";

/**
 * Exhibitor queries — /negocios list, individual exhibitor profile, and
 * the category filter sidebar.
 */

const BASE_COLUMNS = `
  id, slug, name, logo_url, country, booth_number, "pabellón",
  category_id, description, website, whatsapp, email, instagram,
  is_sponsor, sponsor_tier, map_x, map_y, created_at, updated_at
`;

/**
 * All exhibitors with their category embedded. Sponsors first, then
 * alphabetical so the showcase tier always sits at the top.
 */
export async function listExhibitors(): Promise<ExhibitorWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitors")
    .select(`${BASE_COLUMNS}, category:exhibitor_categories(slug, name)`)
    .order("is_sponsor", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ExhibitorWithCategory[];
}

export async function getExhibitorBySlug(
  slug: string,
): Promise<ExhibitorWithCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitors")
    .select(`${BASE_COLUMNS}, category:exhibitor_categories(slug, name)`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ExhibitorWithCategory) ?? null;
}

export async function listExhibitorCategories(): Promise<ExhibitorCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitor_categories")
    .select("id, slug, name, display_order")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as ExhibitorCategory[];
}

/**
 * Sponsors only — the /negocios header carousel uses this.
 */
export async function listSponsorExhibitors(): Promise<Exhibitor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exhibitors")
    .select(BASE_COLUMNS)
    .eq("is_sponsor", true)
    .order("sponsor_tier", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Exhibitor[];
}
