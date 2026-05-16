import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/types";

/**
 * Announcement queries.
 *
 * The RLS policy on `announcements` already filters to active rows
 * (scheduled_for <= now, expires_at is null or > now), so we don't
 * repeat that predicate here — Postgres does the work and skipping it
 * keeps the index-friendly plan.
 */

const BASE_COLUMNS = `
  id, title, body, image_url, severity,
  show_as_banner, show_in_feed, is_pinned,
  action_url, action_label,
  scheduled_for, expires_at, created_at
`;

/**
 * Banner-flagged active announcements — used as the SSR seed for the
 * <BannerStrip /> realtime subscription so the first paint isn't blank
 * while the websocket negotiates.
 */
export async function listActiveBanners(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(BASE_COLUMNS)
    .eq("show_as_banner", true)
    .order("is_pinned", { ascending: false })
    .order("scheduled_for", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Announcement[];
}

/**
 * News-feed announcements (Inicio + /mas/noticias). Pinned first, then
 * newest first.
 */
export async function listFeedAnnouncements(limit = 20): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(BASE_COLUMNS)
    .eq("show_in_feed", true)
    .order("is_pinned", { ascending: false })
    .order("scheduled_for", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Announcement[];
}
