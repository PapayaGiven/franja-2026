"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

/**
 * Update a single speaker. Empty strings collapse to NULL so the admin
 * can clear an optional field by deleting its content. is_featured is
 * read from the form via the presence of the checkbox value.
 */
export async function updateSpeakerAction(
  slug: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  };

  const update: Record<string, unknown> = {
    full_name: text("full_name") ?? "",
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
    updated_at: new Date().toISOString(),
  };

  if (!update.full_name) {
    redirect(`/admin/speakers/${slug}?error=name`);
  }

  const { error } = await supabase
    .from("speakers")
    .update(update)
    .eq("slug", slug);

  if (error) {
    redirect(
      `/admin/speakers/${slug}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/speakers");
  revalidatePath(`/admin/speakers/${slug}`);
  revalidatePath("/conferencistas");
  revalidatePath(`/conferencistas/${slug}`);

  redirect(`/admin/speakers/${slug}?saved=1`);
}

/**
 * Add this speaker to an existing symposium with a specific role.
 */
export async function addSpeakerSymposiumAction(
  speakerSlug: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const supabase = createAdminClient();

  const speakerId = formData.get("speaker_id");
  const symposiumId = formData.get("symposium_id");
  const role = formData.get("role");
  const displayOrderRaw = formData.get("display_order");

  if (
    typeof speakerId !== "string" ||
    typeof symposiumId !== "string" ||
    typeof role !== "string" ||
    speakerId.trim().length === 0 ||
    symposiumId.trim().length === 0 ||
    role.trim().length === 0
  ) {
    redirect(`/admin/speakers/${speakerSlug}?error=missing-fields`);
  }

  const validRoles = ["speaker", "director", "moderator"];

  if (!validRoles.includes(role)) {
    redirect(`/admin/speakers/${speakerSlug}?error=invalid-role`);
  }

  const displayOrder =
    typeof displayOrderRaw === "string" && displayOrderRaw.trim().length > 0
      ? Number(displayOrderRaw)
      : 0;

  const { error } = await supabase.from("symposium_speakers").upsert(
    {
      speaker_id: speakerId,
      symposium_id: symposiumId,
      role,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    },
    {
      onConflict: "symposium_id,speaker_id,role",
    },
  );

  if (error) {
    redirect(
      `/admin/speakers/${speakerSlug}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin/speakers");
  revalidatePath(`/admin/speakers/${speakerSlug}`);
  revalidatePath("/conferencistas");
  revalidatePath(`/conferencistas/${speakerSlug}`);
  revalidatePath("/agenda");
  revalidatePath("/simposios");

  redirect(`/admin/speakers/${speakerSlug}?saved=1`);
}

/**
 * Remove a symposium relationship from this speaker.
 */
export async function removeSpeakerSymposiumAction(
  speakerSlug: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const supabase = createAdminClient();

  const speakerId = formData.get("speaker_id");
  const symposiumId = formData.get("symposium_id");
  const role = formData.get("role");

  if (
    typeof speakerId !== "string" ||
    typeof symposiumId !== "string" ||
    typeof role !== "string" ||
    speakerId.trim().length === 0 ||
    symposiumId.trim().length === 0 ||
    role.trim().length === 0
  ) {
    redirect(`/admin/speakers/${speakerSlug}?error=missing-fields`);
  }

  const { error } = await supabase
    .from("symposium_speakers")
    .delete()
    .eq("speaker_id", speakerId)
    .eq("symposium_id", symposiumId)
    .eq("role", role);

  if (error) {
    redirect(
      `/admin/speakers/${speakerSlug}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin/speakers");
  revalidatePath(`/admin/speakers/${speakerSlug}`);
  revalidatePath("/conferencistas");
  revalidatePath(`/conferencistas/${speakerSlug}`);
  revalidatePath("/agenda");
  revalidatePath("/simposios");

  redirect(`/admin/speakers/${speakerSlug}?saved=1`);
}