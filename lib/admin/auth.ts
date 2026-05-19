/**
 * Admin session — single shared password.
 *
 * The user signs in once with the password stored in `ADMIN_PASSWORD`.
 * We then issue a cookie whose value is an HMAC-SHA256 of a static
 * label keyed by the password itself. Middleware re-computes the HMAC
 * on every request to verify the cookie.
 *
 * Properties:
 *  - No DB writes, no Supabase Auth.
 *  - Rotating `ADMIN_PASSWORD` invalidates every active session.
 *  - Forging the cookie requires knowing the password.
 *  - Uses Web Crypto only, so the same helpers run in the Edge runtime
 *    (middleware) and in Node route handlers / Server Actions.
 */

export const ADMIN_COOKIE = "franja-admin";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h
const SESSION_LABEL = "franja-admin-session-v1";

function getPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.length === 0) {
    throw new Error(
      "ADMIN_PASSWORD env var is not set — admin panel cannot start",
    );
  }
  return pwd;
}

async function hmacHex(password: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string compare. Returns false fast only on length
 * mismatch (acceptable — the token length is public).
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyPassword(input: string): Promise<boolean> {
  const expected = getPassword();
  return timingSafeEqual(input, expected);
}

export async function signSession(): Promise<string> {
  return hmacHex(getPassword(), SESSION_LABEL);
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await hmacHex(getPassword(), SESSION_LABEL);
  return timingSafeEqual(token, expected);
}
