import { listSymposiums } from "@/lib/queries/symposiums";
import { AgendaClient } from "@/components/agenda/AgendaClient";

/**
 * Agenda — Server Component shell. Fetches the full symposium list
 * once and hands it to AgendaClient, which owns all the filter state
 * (day toggle, track chips, area dropdown, search).
 *
 * Per the brief: filtering is client-side after the initial server
 * fetch. 50ish rows on a single payload is small enough that we don't
 * need to round-trip Supabase on each chip tap.
 */
export default async function AgendaPage() {
  const symposiums = await listSymposiums();
  return <AgendaClient symposiums={symposiums} />;
}
