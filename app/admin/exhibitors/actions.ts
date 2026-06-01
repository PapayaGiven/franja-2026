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

/**
 * Internal: validate + push file to Storage + update logo_url. Shared
 * by uploadExhibitorLogoAction (drag-and-drop on the edit page) and
 * createExhibitorAction (single-flow new page that creates + uploads
 * in one submit). Callers are responsible for requireAdmin().
 */
async function _uploadExhibitorLogo(
  slug: string,
  file: File,
): Promise<UploadResult> {
  if (file.size === 0) {
    return { ok: false, error: "Archivo vacío o ausente." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Archivo > 8 MB." };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: `Tipo no soportado: ${file.type}` };
  }

  const supabase = createAdminClient();

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

  if (!(file instanceof File)) {
    return { ok: false, error: "Archivo vacío o ausente." };
  }

  const supabase = createAdminClient();

  const { data: exhibitor, error: lookupErr } = await supabase
    .from("exhibitors")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!exhibitor) return { ok: false, error: `Empresa no existe: ${slug}` };

  return _uploadExhibitorLogo(slug, file);
}

/**
 * Update an existing exhibitor. Empty strings → NULL so the admin can
 * clear optional fields. The category_id dropdown is also normalized:
 * empty category == NULL.
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
 * Create a new exhibitor. Slug is required (or derived from name) and
 * must be unique. If a logo file is included in FormData we upload it
 * in the same action so the admin doesn't need a second screen.
 *
 * Always redirects to the edit page on success so the admin can
 * verify and fill in fields they skipped. The redirect target adds
 * `?created=1` for the toast and `?logoError=...` if only the logo
 * upload failed (the row is still created).
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
    slug = slugify(name);
    if (!slug) redirect("/admin/exhibitors/new?error=slug");
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    redirect("/admin/exhibitors/new?error=slug-format");
  }

  const { data: existing, error: lookupErr } = await supabase
    .from("exhibitors")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupErr) {
    redirect(
      `/admin/exhibitors/new?error=${encodeURIComponent(lookupErr.message)}`,
    );
  }

  if (existing) {
    redirect(`/admin/exhibitors/new?error=slug-taken&slug=${slug}`);
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
  };

  const { error } = await supabase.from("exhibitors").insert(insert);

  if (error) {
    redirect(`/admin/exhibitors/new?error=${encodeURIComponent(error.message)}`);
  }

  // Optional inline logo upload — only attempted if the admin attached
  // a file to the form. Failure here doesn't roll back the row; we
  // surface a non-fatal `logoError` in the redirect so the admin can
  // retry the upload from the edit page.
  const logoFile = formData.get("logo");
  let logoError: string | null = null;

  if (logoFile instanceof File && logoFile.size > 0) {
    const result = await _uploadExhibitorLogo(slug, logoFile);
    if (!result.ok) logoError = result.error;
  }

  revalidatePath("/admin/exhibitors");
  revalidatePath("/empresas");

  const params = new URLSearchParams({ created: "1" });

  if (logoError) params.set("logoError", logoError);

  redirect(`/admin/exhibitors/${slug}?${params.toString()}`);
}

function extensionFor(file: File): string {
  const fromMime = file.type.split("/")[1];

  if (fromMime && /^[a-z0-9+]+$/i.test(fromMime)) {
    if (fromMime === "jpeg") return "jpg";
    if (fromMime === "svg+xml") return "svg";

    return fromMime;
  }

  const fromName = file.name.split(".").pop();

  if (fromName && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName.toLowerCase();
  }

  return "bin";
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}