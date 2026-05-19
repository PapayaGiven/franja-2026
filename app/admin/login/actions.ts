"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  signSession,
  verifyPassword,
} from "@/lib/admin/auth";

/**
 * Login server action. Returning `{ error }` keeps the form a server
 * component — the page reads ?error= from the URL to render the
 * inline error message instead of a client-side state ping-pong.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin");

  // Only allow relative redirects so we can't be tricked into bouncing
  // a freshly authenticated user to an external URL.
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//")
    ? nextRaw
    : "/admin";

  const ok = await verifyPassword(password);
  if (!ok) {
    const url = new URL("/admin/login", "http://placeholder");
    url.searchParams.set("error", "1");
    if (next !== "/admin") url.searchParams.set("next", next);
    redirect(url.pathname + url.search);
  }

  const token = await signSession();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect(next);
}
