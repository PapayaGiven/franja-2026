"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import type { UploadResult } from "@/lib/admin/upload";

const BUCKET = "exhibitors";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const SPONSOR_TIERS = new Set(["platinum", "gold", "silver"]);

/**
 * Upload a logo to Storage and write the public URL back to
 * `exhibitors.logo_url`. Same shape as the speakers photo action so
 * the generic BulkAssetUploader can drive both.
 */
export async function uploadExhibitorLogoAction(
  slug: string,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Archivo vacío o ausente." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Archivo > 8 MB." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: `Tipo no soportado: ${file.type}` };
  }

  const supabase = createAdminClient();

  const { data: exhibitor, error: lookupErr } = await supabase
    .from("exhibitors")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!exhibitor) return { ok: false, error: `Empresa no existe: ${slug}` };

  const ext = extensionFor(file);
  const path = `${slug}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000, immutable",
      upsert: false,
    });
  if (uploadErr) return { ok: false, error: uploadErr.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = pub.publicUrl;

  const { error: updateErr } = await supabase
    .from("exhibitors")
    .update({ logo_url: url, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath("/admin/exhibitors");
  revalidatePath(`/admin/exhibitors/${slug}`);
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${slug}`);

  return { ok: true, url };
}

/**
 * Update an existing exhibitor. Empty strings → NULL so the admin can
 * clear optional fields. Booleans + the category_id dropdown are
 * read explicitly (checkbox absence == false; empty category == NULL).
 */
export async function updateExhibitorAction(
  slug: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  const sponsorTier = text("sponsor_tier");
  if (sponsorTier && !SPONSOR_TIERS.has(sponsorTier)) {
    redirect(`/admin/exhibitors/${slug}?error=tier`);
  }

  const update: Record<string, unknown> = {
    name: text("name") ?? "",
    country: text("country"),
    booth_number: text("booth_number"),
    // Postgres column is literally "pabellón" (accented). The Supabase
    // JS client URL-encodes column names so this just works.
    pabellón: text("pabellon"),
    category_id: text("category_id"),
    description: text("description"),
    website: text("website"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    instagram: text("instagram"),
    is_sponsor: formData.get("is_sponsor") === "on",
    sponsor_tier: sponsorTier,
    updated_at: new Date().toISOString(),
  };

  if (!update.name) {
    redirect(`/admin/exhibitors/${slug}?error=name`);
  }

  const { error } = await supabase
    .from("exhibitors")
    .update(update)
    .eq("slug", slug);

  if (error) {
    redirect(
      `/admin/exhibitors/${slug}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/exhibitors");
  revalidatePath(`/admin/exhibitors/${slug}`);
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${slug}`);

  redirect(`/admin/exhibitors/${slug}?saved=1`);
}

/**
 * Create a new exhibitor. Slug is required and must be unique. On
 * success we redirect into the edit page so the admin can upload the
 * logo + fill the rest without a manual jump.
 */
export async function createExhibitorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  const name = text("name");
  let slug = text("slug");

  if (!name) redirect("/admin/exhibitors/new?error=name");
  if (!slug) {
    // If the admin left slug blank, derive it from name.
    slug = slugify(name);
    if (!slug) redirect("/admin/exhibitors/new?error=slug");
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    redirect("/admin/exhibitors/new?error=slug-format");
  }

  // Pre-flight uniqueness check so we can return a nice message
  // instead of bubbling a Postgres 23505.
  const { data: existing, error: lookupErr } = await supabase
    .from("exhibitors")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) {
    redirect(`/admin/exhibitors/new?error=${encodeURIComponent(lookupErr.message)}`);
  }
  if (existing) {
    redirect(`/admin/exhibitors/new?error=slug-taken&slug=${slug}`);
  }

  const sponsorTier = text("sponsor_tier");
  if (sponsorTier && !SPONSOR_TIERS.has(sponsorTier)) {
    redirect("/admin/exhibitors/new?error=tier");
  }

  const insert: Record<string, unknown> = {
    slug,
    name,
    country: text("country"),
    booth_number: text("booth_number"),
    pabellón: text("pabellon"),
    category_id: text("category_id"),
    description: text("description"),
    website: text("website"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    instagram: text("instagram"),
    is_sponsor: formData.get("is_sponsor") === "on",
    sponsor_tier: sponsorTier,
  };

  const { error } = await supabase.from("exhibitors").insert(insert);
  if (error) {
    redirect(`/admin/exhibitors/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/exhibitors");
  revalidatePath("/empresas");

  redirect(`/admin/exhibitors/${slug}?created=1`);
}

function extensionFor(file: File): string {
  const fromMime = file.type.split("/")[1];
  if (fromMime && /^[a-z0-9+]+$/i.test(fromMime)) {
    if (fromMime === "jpeg") return "jpg";
    if (fromMime === "svg+xml") return "svg";
    return fromMime;
  }
  const fromName = file.name.split(".").pop();
  if (fromName && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  return "bin";
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
