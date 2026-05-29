import Link from "next/link";
import { listDirectors } from "@/lib/queries/speakers";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";

/**
 * Directores — speakers que aparecen como `role='director'` en al
 * menos un simposio. listDirectors() ya deduplica.
 */
export default async function DirectoresPage() {
  const directors = await listDirectors().catch(() => []);

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Directores</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Quienes lideran cada simposio.
        </p>
      </header>

      {directors.length === 0 ? (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Aún no hay directores asignados.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {directors.map((d) => (
            <li key={d.id}>
              <Link
                href={`/conferencistas/${d.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-franja-border bg-white/5 p-3 backdrop-blur-sm transition hover:bg-white/10"
              >
                <SpeakerAvatar photoUrl={d.photo_url} name={d.full_name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-franja-text-primary leading-tight truncate">
                    {d.full_name}
                  </p>
                  {d.credentials && (
                    <p className="text-[11px] text-franja-text-muted leading-tight truncate">
                      {d.credentials}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
