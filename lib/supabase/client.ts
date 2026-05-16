import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Use this in Client Components for live
// queries, realtime subscriptions, and anything that needs to read auth
// state from the browser session.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
