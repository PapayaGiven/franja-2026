"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

export async function updateSymposiumAction(
  currentSlug: string,
  formData: FormData
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  const officialName = text("official_name");
  const newSlug = text("slug");

  if (!officialName) redirect(`/admin/simposios/${currentSlug}?error=name`);
  if (!newSlug) redirect(`/admin/simposios/${currentSlug}?error=slug`);

  if (!/^[a-z0-9][a-z0-9-]*$/.test(newSlug)) {
    redirect(`/admin/simposios/${currentSlug}?error=slug-format`);
  }

  if (newSlug !== currentSlug) {
    const { data: existing, error: lookupErr } = await supabase
      .from("symposiums")
      .select("slug")
      .eq("slug", newSlug)
      .maybeSingle();

    if (lookupErr) {
      redirect(
        `/admin/simposios/${currentSlug}?error=${encodeURIComponent(
          lookupErr.message
        )}`
      );
    }

    if (existing) {
      redirect(
        `/admin/simposios/${currentSlug}?error=slug-taken&slug=${newSlug}`
      );
    }
  }

  const trackId = text("track_id");
  const areaId = text("area_id");
  const categoryId = text("category_id");

  const update: Record<string, unknown> = {
    slug: newSlug,
    official_name: officialName,
    subtitle: text("subtitle"),
    description: text("description"),
    kind: text("kind") ?? "symposium",
    generic_category: text("generic_category"),
    track_id: trackId ? Number(trackId) : null,
    area_id: areaId ? Number(areaId) : null,
    category_id: categoryId ? Number(categoryId) : null,
    day: text("day"),
    start_time: text("start_time"),
    end_time: text("end_time"),
    is_exclusive: formData.get("is_exclusive") === "on",
    exclusive_org: text("exclusive_org"),
    sponsor_brand: text("sponsor_brand"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("symposiums")
    .update(update)
    .eq("slug", currentSlug);

  if (error) {
    redirect(
      `/admin/simposios/${currentSlug}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/simposios");
  revalidatePath(`/admin/simposios/${newSlug}`);
  revalidatePath("/simposios");
  revalidatePath(`/simposios/${newSlug}`);
  revalidatePath("/agenda");

  redirect(`/admin/simposios/${newSlug}?saved=1`);
}

export async function addSymposiumParticipantAction(
  currentSlug: string,
  formData: FormData
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const speakerId = formData.get("speaker_id");
  const role = formData.get("role");
  const displayOrderRaw = formData.get("display_order");

  if (typeof speakerId !== "string" || !speakerId) {
    redirect(`/admin/simposios/${currentSlug}?error=missing-speaker`);
  }

  if (
    typeof role !== "string" ||
    !["director", "moderator", "speaker"].includes(role)
  ) {
    redirect(`/admin/simposios/${currentSlug}?error=invalid-role`);
  }

  const displayOrder =
    typeof displayOrderRaw === "string" && displayOrderRaw.trim() !== ""
      ? Number(displayOrderRaw)
      : 0;

  const { data: symposium, error: symposiumError } = await supabase
    .from("symposiums")
    .select("id, slug")
    .eq("slug", currentSlug)
    .maybeSingle();

  if (symposiumError || !symposium) {
    redirect(`/admin/simposios/${currentSlug}?error=symposium-not-found`);
  }

  const { data: existing, error: existingError } = await supabase
    .from("symposium_speakers")
    .select("symposium_id, speaker_id, role")
    .eq("symposium_id", symposium.id)
    .eq("speaker_id", speakerId)
    .eq("role", role)
    .maybeSingle();

  if (existingError) {
    redirect(
      `/admin/simposios/${currentSlug}?error=${encodeURIComponent(
        existingError.message
      )}`
    );
  }

  if (existing) {
    redirect(`/admin/simposios/${currentSlug}?error=participant-exists`);
  }

  const { error } = await supabase.from("symposium_speakers").insert({
    symposium_id: symposium.id,
    speaker_id: speakerId,
    role,
    display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
  });

  if (error) {
    redirect(
      `/admin/simposios/${currentSlug}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/simposios");
  revalidatePath(`/admin/simposios/${currentSlug}`);
  revalidatePath("/simposios");
  revalidatePath(`/simposios/${currentSlug}`);
  revalidatePath("/agenda");
  revalidatePath(`/agenda/${currentSlug}`);

  redirect(`/admin/simposios/${currentSlug}?participant_added=1`);
}

export async function removeSymposiumParticipantAction(
  currentSlug: string,
  formData: FormData
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const symposiumId = formData.get("symposium_id");
  const speakerId = formData.get("speaker_id");
  const role = formData.get("role");

  if (
    typeof symposiumId !== "string" ||
    typeof speakerId !== "string" ||
    typeof role !== "string"
  ) {
    redirect(`/admin/simposios/${currentSlug}?error=missing-relation`);
  }

  const { error } = await supabase
    .from("symposium_speakers")
    .delete()
    .eq("symposium_id", symposiumId)
    .eq("speaker_id", speakerId)
    .eq("role", role);

  if (error) {
    redirect(
      `/admin/simposios/${currentSlug}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath("/admin/simposios");
  revalidatePath(`/admin/simposios/${currentSlug}`);
  revalidatePath("/simposios");
  revalidatePath(`/simposios/${currentSlug}`);
  revalidatePath("/agenda");
  revalidatePath(`/agenda/${currentSlug}`);

  redirect(`/admin/simposios/${currentSlug}?participant_removed=1`);
}