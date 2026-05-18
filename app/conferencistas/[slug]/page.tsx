import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Globe, ExternalLink } from "lucide-react";
import { getSpeakerBySlug, listSymposiumsForSpeaker } from "@/lib/queries/speakers";
import { SpeakerAvatar } from "@/components/speakers/SpeakerAvatar";
import { formatLongDate, formatClock } from "@/lib/utils/time";

interface Params {
  slug: string;
}

const ROLE_LABEL: Record<string, string> = {
  director: "Dirige",
  moderator: "Modera",
  speaker: "Habla en",
};

export default async function SpeakerDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let speaker = null;
  try {
    speaker = await getSpeakerBySlug(slug);
  } catch {
    speaker = null;
  }
  if (!speaker) notFound();

  type Session = Awaited<ReturnType<typeof listSymposiumsForSpeaker>>[number];
  const sessions: Session[] = await listSymposiumsForSpeaker(speaker.id).catch(() => []);

  // Group sessions by role for the "Dirige / Modera / Habla en" buckets.
  const byRole: Record<string, Session[]> = {};
  for (const s of sessions) {
    (byRole[s.role] = byRole[s.role] ?? []).push(s);
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <Link
        href="/mas/conferencistas"
        className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted hover:text-franja-text-primary transition"
      >
        <ChevronLeft size={14} />
        Conferencistas
      </Link>

      <header className="flex items-center gap-4">
        <SpeakerAvatar photoUrl={speaker.photo_url} name={speaker.full_name} size={72} />
        <div className="min-w-0">
          <h1 className="text-xl font-medium text-franja-text-primary leading-tight">
            {speaker.full_name}
          </h1>
          {speaker.credentials && (
            <p className="text-xs text-franja-text-muted leading-snug mt-0.5">
              {speaker.credentials}
            </p>
          )}
          {(speaker.country_code || speaker.country) && (
            <p className="text-xs text-franja-text-muted leading-snug">
              {speaker.country_code ? `${speaker.country_code} · ` : ""}
              {speaker.country ?? ""}
            </p>
          )}
        </div>
      </header>

      {speaker.specialty && (
        <section className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Especialidad
          </h2>
          <p className="text-sm text-franja-text-secondary">{speaker.specialty}</p>
        </section>
      )}

      {speaker.bio && (
        <section className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Bio
          </h2>
          <p className="text-sm text-franja-text-secondary leading-relaxed whitespace-pre-line">
            {speaker.bio}
          </p>
        </section>
      )}

      {(speaker.website || speaker.linkedin || speaker.instagram) && (
        <section className="flex flex-wrap gap-2">
          {speaker.website && (
            <a
              href={speaker.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <Globe size={12} />
              Web
            </a>
          )}
          {speaker.linkedin && (
            <a
              href={speaker.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <ExternalLink size={12} />
              LinkedIn
            </a>
          )}
          {speaker.instagram && (
            <a
              href={speaker.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <ExternalLink size={12} />
              Instagram
            </a>
          )}
        </section>
      )}

      {Object.keys(byRole).length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            En FRANJA 2026
          </h2>
          {(["director", "moderator", "speaker"] as const).map((role) => {
            const rows = byRole[role];
            if (!rows || rows.length === 0) return null;
            return (
              <div key={role} className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-franja-turquoise">
                  {ROLE_LABEL[role]}
                </p>
                <ul className="grid grid-cols-1 gap-2">
                  {rows.map((sess) => (
                    <li key={sess.id}>
                      <Link
                        href={`/agenda/${sess.slug}`}
                        className="block rounded-2xl border border-franja-border bg-white/5 p-3 backdrop-blur-sm transition hover:bg-white/10"
                      >
                        <p className="text-sm font-medium text-franja-text-primary leading-snug">
                          {sess.official_name}
                        </p>
                        <p className="text-[11px] text-franja-text-muted mt-1">
                          {formatLongDate(sess.day)} · {formatClock(sess.start_time)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
