import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client. Bypasses RLS — never import this from a
// Client Component or expose it to the browser. The "server-only" import
// throws a build error if it gets bundled to the client.
//
// Use this for: admin writes from Server Actions, seed-data scripts,
// cron jobs. For per-user operations prefer lib/supabase/server.ts.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
