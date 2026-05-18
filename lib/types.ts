/**
 * FRANJA 2026 — domain row types.
 *
 * Hand-typed to match the schema in supabase/migrations/0001_init.sql.
 * If/when we run `supabase gen types`, this file can be replaced by
 * the generated `Database` type and per-row aliases.
 *
 * Convention:
 *   `XxxRow` = exact row shape from the table.
 *   `XxxWithY` = a row plus its embedded relations (returned by joins).
 */

// ── Reference tables ────────────────────────────────────────────────

export type TrackSlug =
  | "franja-ocular"
  | "franja-visual"
  | "grupo-franja"
  | "talleres-franja";

export interface Track {
  id: string;
  slug: TrackSlug | string;
  name: string;
  color: string; // hex
  display_order: number;
  created_at: string;
}

export interface Area {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  created_at: string;
}

// ── Speakers ────────────────────────────────────────────────────────

export interface Speaker {
  id: string;
  slug: string;
  full_name: string;
  photo_url: string | null;
  country: string | null;
  country_code: string | null;
  specialty: string | null;
  institution: string | null;
  credentials: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ── Symposiums ──────────────────────────────────────────────────────

export type SymposiumKind = "symposium" | "taller" | "special" | "business_hour";
export type SymposiumRole = "director" | "moderator" | "speaker";

export interface Symposium {
  id: string;
  slug: string;
  kind: SymposiumKind;
  generic_category: string | null;
  official_name: string;
  subtitle: string | null;
  description: string | null;
  track_id: string | null;
  area_id: string | null;
  day: string; // ISO date "YYYY-MM-DD"
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  is_exclusive: boolean;
  exclusive_org: string | null;
  sponsor_brand: string | null;
  created_at: string;
  updated_at: string;
}

// Symposium row with the embedded track + area (PostgREST `tracks(...)`
// shape from supabase-js select queries).
export interface SymposiumWithRefs extends Symposium {
  track: Pick<Track, "slug" | "name" | "color"> | null;
  area: Pick<Area, "slug" | "name"> | null;
}

export interface SymposiumSpeakerLink {
  speaker_id: string;
  role: SymposiumRole;
  display_order: number;
  speaker: Pick<
    Speaker,
    "id" | "slug" | "full_name" | "photo_url" | "credentials" | "country" | "country_code"
  >;
}

// Full symposium detail used by /agenda/[slug].
export interface SymposiumDetail extends SymposiumWithRefs {
  participants: SymposiumSpeakerLink[];
  conferences: Conference[];
}

// ── Conferences (individual talks within a symposium) ───────────────

export interface Conference {
  id: string;
  symposium_id: string;
  title: string;
  start_time: string | null;
  duration_min: number | null;
  display_order: number;
  created_at: string;
}

// Categoría oficial de simposio (Clínicos / Negocios / Técnicos /
// Académicos). Source: simposio_categories — added in migration 0003.
export interface SimposioCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  display_order: number;
  created_at: string;
}

// Marcas / fabricantes participantes de un simposio. Decorativas
// (logos no clickeables). Source: symposium_brands — migration 0003.
export interface SymposiumBrand {
  id: string;
  symposium_id: string;
  brand_name: string;
  brand_slug: string;
  logo_url: string | null;
  display_order: number;
  created_at: string;
}

// ── Exhibitors ──────────────────────────────────────────────────────

export interface ExhibitorCategory {
  id: string;
  slug: string;
  name: string;
  display_order: number;
}

export interface Exhibitor {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  booth_number: string | null;
  // Column name has the accent in Postgres.
  pabellón: string | null;
  category_id: string | null;
  description: string | null;
  website: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  is_sponsor: boolean;
  sponsor_tier: string | null;
  map_x: number | null;
  map_y: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExhibitorWithCategory extends Exhibitor {
  category: Pick<ExhibitorCategory, "slug" | "name"> | null;
}

// ── Organizations ───────────────────────────────────────────────────

export interface Organization {
  id: string;
  slug: string;
  name: string;
  acronym: string | null;
  type: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
}

// ── Announcements ───────────────────────────────────────────────────

export type AnnouncementSeverity = "info" | "success" | "warning" | "urgent";

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  severity: AnnouncementSeverity;
  show_as_banner: boolean;
  show_in_feed: boolean;
  is_pinned: boolean;
  action_url: string | null;
  action_label: string | null;
  scheduled_for: string;
  expires_at: string | null;
  created_at: string;
}

// ── Misc ────────────────────────────────────────────────────────────

export type MapPoiType =
  | "bathroom"
  | "cafe"
  | "registration"
  | "networking"
  | "info"
  | "entrance"
  | "room"
  | "stage";

export interface MapPoi {
  id: string;
  name: string;
  type: MapPoiType;
  x: number;
  y: number;
  pabellón: string | null;
  icon: string | null;
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  distance_km: number | null;
  walking_minutes: number | null;
  image_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  preferred_rate: string | null;
  booking_url: string | null;
  perks: string[] | null;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  cover_image: string | null;
  author: string | null;
  published_at: string;
  tags: string[] | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
}
