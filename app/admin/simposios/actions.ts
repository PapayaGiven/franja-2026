"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

export async function createSymposiumAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const text = (key: string): string | null => {
    const v = formData.get(key);
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  };

  const officialName = text("official_name");
  let slug = text("slug");

  if (!officialName) redirect("/admin/simposios/new?error=name");

  if (!slug) {
    slug = slugify(officialName);
    if (!slug) redirect("/admin/simposios/new?error=slug");
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    redirect("/admin/simposios/new?error=slug-format");
  }

  const { data: existing, error: lookupErr } = await supabase
    .from("symposiums")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupErr) {
    redirect(`/admin/simposios/new?error=${encodeURIComponent(lookupErr.message)}`);
  }

  if (existing) {
    redirect(`/admin/simposios/new?error=slug-taken&slug=${slug}`);
  }

  const trackId = text("track_id");
  const areaId = text("area_id");
  const categoryId = text("category_id");

  const insert: Record<string, unknown> = {
    slug,
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
  };

  const { error } = await supabase.from("symposiums").insert(insert);

  if (error) {
    redirect(`/admin/simposios/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/simposios");
  revalidatePath("/simposios");
  revalidatePath("/agenda");

  redirect(`/admin/simposios/${slug}?created=1`);
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
