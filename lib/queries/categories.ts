import { createClient } from "@/lib/supabase/server";
import type { SimposioCategory } from "@/lib/types";

/**
 * Categorías oficiales de simposios (Clínicos / Negocios / Técnicos /
 * Académicos). Source: simposio_categories — added in migration 0003.
 * Ordered by `display_order` so the official tabbed order is preserved.
 */
export async function listCategories(): Promise<SimposioCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simposio_categories")
    .select("id, slug, name, description, color, display_order, created_at")
    .order("display_order", { ascending: true });
  // Collapse "table doesn't exist yet" into an empty list so callers
  // render their own empty state instead of 500'ing.
  if (error) return [];
  return (data ?? []) as SimposioCategory[];
}
