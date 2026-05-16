import { listSymposiums } from "@/lib/queries/symposiums";
import { HeroCard } from "@/components/home/HeroCard";
import { StatsGrid } from "@/components/home/StatsGrid";
import { UpcomingSessions } from "@/components/home/UpcomingSessions";
import { BusinessHourCard } from "@/components/home/BusinessHourCard";
import { QuickActions } from "@/components/home/QuickActions";

/**
 * Inicio — public landing. Server Component: fetches symposiums once
 * for the "Próximas conferencias" preview. Phase E will swap the
 * preview slice for live "starts within X min" logic when the event
 * is in progress.
 */
export default async function InicioPage() {
  const symposiums = await listSymposiums();
  const upcoming = symposiums.slice(0, 3);

  return (
    <div className="space-y-8">
      <HeroCard />
      <StatsGrid />
      <UpcomingSessions sessions={upcoming} />
      <BusinessHourCard />
      <QuickActions />
    </div>
  );
}
