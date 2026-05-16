/**
 * Phase B sanity check — proves that:
 *   1. .env.local is wired correctly
 *   2. The anon key + RLS public-read policy let us read `tracks`
 *   3. The seed actually ran in Supabase
 *
 * Run with:
 *   npm run test:connection
 *
 * Anon (not service-role) on purpose: it's the same client path the
 * public app uses, so a green run here means the public Server
 * Components can read data too.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "✗ Missing env vars. Make sure NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function main() {
  console.log(`→ Querying ${url}\n`);

  // Tracks — expect exactly the 4 from the brief.
  const tracksRes = await supabase
    .from("tracks")
    .select("slug, name, color")
    .order("display_order", { ascending: true });

  if (tracksRes.error) {
    console.error("✗ tracks query failed:", tracksRes.error.message);
    process.exit(1);
  }

  const tracks = tracksRes.data ?? [];
  console.log(`Tracks (${tracks.length}):`);
  for (const t of tracks) {
    console.log(`  • ${t.name.padEnd(18)} ${t.color}  (${t.slug})`);
  }

  if (tracks.length !== 4) {
    console.warn(
      `\n⚠ Expected 4 tracks, found ${tracks.length}. Did the seed run?`,
    );
  }

  // Lightweight head:true counts of the other content tables so we can
  // confirm against the numbers the user verified in Supabase.
  const [speakers, symposiums, conferences] = await Promise.all([
    supabase.from("speakers").select("id", { count: "exact", head: true }),
    supabase.from("symposiums").select("id", { count: "exact", head: true }),
    supabase.from("conferences").select("id", { count: "exact", head: true }),
  ]);

  console.log("\nCounts:");
  console.log(`  • speakers     ${speakers.count ?? "?"}`);
  console.log(`  • symposiums   ${symposiums.count ?? "?"}`);
  console.log(`  • conferences  ${conferences.count ?? "?"}`);

  console.log("\n✓ Connection OK");
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});
