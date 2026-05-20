"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import type { UploadResult } from "@/lib/admin/upload";

const BUCKET = "speakers";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — generous; PNGs of headshots are tiny.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * Internal: validate + push file to Storage + update photo_url.
 * Caller is responsible for requireAdmin() and for confirming the
 * speaker exists. Shared by uploadSpeakerPhotoAction (drag-and-drop on
 * edit page; bulk modal) and createSpeakerAction (new page single-flow).
 *
 * Object key is `${slug}/${timestamp}.${ext}` so each upload gets a
 * fresh URL — public-bucket URLs are CDN-cached and we never want to
 * serve a stale photo after the admin replaces one.
 */
async function _uploadSpeakerPhoto(
  slug: string,
  file: File,
): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, error: "Archivo vacío o ausente." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Archivo > 8 MB." };
  if (!ALLOWED_TYPES.has(file.type))
    return { ok: false, error: `Tipo no soportado: ${file.type}` };

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
    .from("speakers")
    .update({ photo_url: url, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath("/admin/speakers");
  revalidatePath(`/admin/speakers/${slug}`);
  revalidatePath("/conferencistas");
  revalidatePath(`/conferencistas/${slug}`);

  return { ok: true, url };
}

/**
 * Upload a single speaker photo. Used by the edit-form drag-and-drop
 * zone and the bulk-upload modal.
 */
export async function uploadSpeakerPhotoAction(
  slug: string,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Archivo vacío o ausente." };
  }

  const supabase = createAdminClient();
  const { data: speaker, error: lookupErr } = await supabase
    .from("speakers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!speaker) return { ok: false, error: `Speaker no existe: ${slug}` };

  return _uploadSpeakerPhoto(slug, file);
}

/**
 * Create a new speaker. Same single-flow pattern as exhibitors: if a
 * photo file is attached we upload it after the row is inserted. On
 * success we redirect to the edit page with `?created=1` (and
 * `?photoError=...` if only the photo failed). full_name is required;
 * slug is required or derived from full_name.
 */
export async function createSpeakerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  const fullName = text("full_name");
  let slug = text("slug");

  if (!fullName) redirect("/admin/speakers/new?error=name");
  if (!slug) {
    slug = slugify(fullName);
    if (!slug) redirect("/admin/speakers/new?error=slug");
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    redirect("/admin/speakers/new?error=slug-format");
  }

  const { data: existing, error: lookupErr } = await supabase
    .from("speakers")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) {
    redirect(`/admin/speakers/new?error=${encodeURIComponent(lookupErr.message)}`);
  }
  if (existing) {
    redirect(`/admin/speakers/new?error=slug-taken&slug=${slug}`);
  }

  const insert: Record<string, unknown> = {
    slug,
    full_name: fullName,
    credentials: text("credentials"),
    country: text("country"),
    country_code: text("country_code"),
    specialty: text("specialty"),
    institution: text("institution"),
    bio: text("bio"),
    website: text("website"),
    linkedin: text("linkedin"),
    instagram: text("instagram"),
    is_featured: formData.get("is_featured") === "on",
  };

  const { error } = await supabase.from("speakers").insert(insert);
  if (error) {
    redirect(`/admin/speakers/new?error=${encodeURIComponent(error.message)}`);
  }

  const photoFile = formData.get("photo");
  let photoError: string | null = null;
  if (photoFile instanceof File && photoFile.size > 0) {
    const result = await _uploadSpeakerPhoto(slug, photoFile);
    if (!result.ok) photoError = result.error;
  }

  revalidatePath("/admin/speakers");
  revalidatePath("/conferencistas");

  const params = new URLSearchParams({ created: "1" });
  if (photoError) params.set("photoError", photoError);
  redirect(`/admin/speakers/${slug}?${params.toString()}`);
}

function extensionFor(file: File): string {
  const fromMime = file.type.split("/")[1];
  if (fromMime && /^[a-z0-9]+$/i.test(fromMime)) {
    return fromMime === "jpeg" ? "jpg" : fromMime;
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
