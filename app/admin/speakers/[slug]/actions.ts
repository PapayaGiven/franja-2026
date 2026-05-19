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
