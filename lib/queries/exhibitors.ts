import { createClient } from "@/lib/supabase/server";
import type {
  Exhibitor,
  ExhibitorCategory,
  ExhibitorWithCategory,
} from "@/lib/types";

/**
 * Exhibitor queries — listado público de empresas, perfil individual
 * y categorías.
 */

const BASE_COLUMNS = `
  id, slug, name, logo_url, country, booth_number, "pabellón",
  category_id, description, website, whatsapp, email, instagram,
  map_x, map_y, created_at, updated_at
`;

/**
 * All exhibitors with their category embedded.
 */
export async function listExhibitors(): Promise<ExhibitorWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exhibitors")
    .select(`${BASE_COLUMNS}, category:exhibitor_categories(slug, name)`)
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
 * Legacy helper kept for compatibility with older imports.
 * Returns the regular exhibitor list.
 */
export async function listSponsorExhibitors(): Promise<Exhibitor[]> {
  const exhibitors = await listExhibitors();

  return exhibitors as unknown as Exhibitor[];
}