import Link from "next/link";
import { listSpeakers } from "@/lib/queries/speakers";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";

/**
 * Conferencistas — lista completa de ponentes.
 * Avatar gris cuando photo_url es null.
 */
export default async function ConferencistasPage() {
  const speakers = await listSpeakers().catch(() => []);

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Conferencistas
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          {speakers.length} ponentes confirmados.
        </p>
      </header>

      {speakers.length === 0 ? (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Estamos cargando la lista de conferencistas.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {speakers.map((s) => (
            <li key={s.id}>
              <Link
                href={`/conferencistas/${s.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-franja-border bg-white/5 p-3 backdrop-blur-sm transition hover:bg-white/10"
              >
                <SpeakerAvatar
                  photoUrl={s.photo_url}
                  name={s.full_name}
                  size={44}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-franja-text-primary leading-tight truncate">
                    {s.full_name}
                  </p>

                  {s.credentials && (
                    <p className="text-[11px] text-franja-text-muted leading-tight truncate">
                      {s.credentials}
                    </p>
                  )}

                  {(s.country_code || s.country) && (
                    <p className="text-[11px] text-franja-text-muted leading-tight truncate">
                      {s.country_code ? `${s.country_code} · ` : ""}
                      {s.country ?? ""}
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