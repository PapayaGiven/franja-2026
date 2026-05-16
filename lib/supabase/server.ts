import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server-side Supabase client for Server Components, Server Actions, and
// Route Handlers. Reads/writes the auth cookie via next/headers so the
// admin panel keeps its session across requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          // In Server Components cookies are read-only; the try/catch is
          // intentional so we don't crash when @supabase/ssr probes for
          // a writer it can't have.
          try {
            toSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /* readonly cookies in this context — ignored */
          }
        },
      },
    },
  );
}
