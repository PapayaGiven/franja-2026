"use server";

import { revalidatePath } from "next/cache";
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
 * Upload a single speaker photo to Supabase Storage and write the
 * public URL back to `speakers.photo_url`. Used by both the individual
 * edit form's drag-and-drop zone and the bulk uploader modal.
 *
 * The object key is `${slug}/${timestamp}.${ext}` so each upload gets a
 * fresh URL — public-bucket URLs are CDN-cached and we never want to
 * serve a stale photo after the admin replaces one.
 */
export async function uploadSpeakerPhotoAction(
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

  // Confirm the speaker exists before we waste a storage write.
  const { data: speaker, error: lookupErr } = await supabase
    .from("speakers")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!speaker) return { ok: false, error: `Speaker no existe: ${slug}` };

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
  // Public-facing pages that render this photo:
  revalidatePath("/conferencistas");
  revalidatePath(`/conferencistas/${slug}`);

  return { ok: true, url };
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
