import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "./auth";

/**
 * Defense-in-depth guard for Server Actions and Route Handlers. The
 * /admin/* matcher in middleware already redirects unauthenticated
 * browsers, but a Server Action can be invoked with a forged Origin
 * header from a script — so we re-check the cookie inside every
 * privileged code path. Lives in its own file (not auth.ts) so the
 * edge-runtime middleware never pulls in next/headers.
 */
export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySession(token))) {
    throw new Error("Unauthorized");
  }
}
