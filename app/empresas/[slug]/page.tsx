import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Globe,
  MessageCircle,
  Mail,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { getExhibitorBySlug } from "@/lib/queries/exhibitors";

interface Params {
  slug: string;
}

/**
 * Detalle de empresa expositora. URL: /empresas/[slug]
 * Muestra logo, descripción, ubicación, categoría y canales de contacto.
 */
export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  let exhibitor = null;

  try {
    exhibitor = await getExhibitorBySlug(slug);
  } catch {
    exhibitor = null;
  }

  if (!exhibitor) notFound();

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1.5 text-xs text-franja-text-muted transition hover:text-franja-text-primary"
      >
        <ChevronLeft size={14} />
        Empresas
      </Link>

      <header className="space-y-4">
        <div className="flex min-h-[140px] items-center justify-center rounded-3xl border border-franja-border bg-white p-5">
          {exhibitor.logo_url ? (
            <img
              src={exhibitor.logo_url}
              alt={`Logo de ${exhibitor.name}`}
              className="max-h-28 max-w-full object-contain"
            />
          ) : (
            <span className="text-3xl font-semibold text-franja-bg">
              {initials(exhibitor.name)}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-medium leading-tight text-franja-text-primary">
            {exhibitor.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-franja-text-muted">
            {exhibitor.booth_number && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} />
                Stand {exhibitor.booth_number}
                {exhibitor.pabellón ? ` · ${exhibitor.pabellón}` : ""}
              </span>
            )}

            {exhibitor.country && <span>{exhibitor.country}</span>}

            {exhibitor.category && (
              <span className="rounded-full bg-franja-turquoise/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-franja-turquoise">
                {exhibitor.category.name}
              </span>
            )}
          </div>
        </div>
      </header>

      {exhibitor.description && (
        <section className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
            Sobre la empresa
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-franja-text-secondary">
            {exhibitor.description}
          </p>
        </section>
      )}

      {(exhibitor.website ||
        exhibitor.whatsapp ||
        exhibitor.email ||
        exhibitor.instagram) && (
        <section className="flex flex-wrap gap-2">
          {exhibitor.website && (
            <a
              href={exhibitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <Globe size={12} />
              Web
            </a>
          )}

          {exhibitor.whatsapp && (
            <a
              href={`https://wa.me/${exhibitor.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}

          {exhibitor.email && (
            <a
              href={`mailto:${exhibitor.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-franja-border bg-white/5 px-3 py-1.5 text-xs text-franja-text-secondary backdrop-blur-sm transition hover:bg-white/10"
            >
              <Mail size={12} />
              Email
            </a>
          )}

          {exhibitor.instagram && (
            <a
              href={normalizeExternalUrl(exhibitor.instagram)}
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
    </main>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("@")) {
    return `https://instagram.com/${trimmed.slice(1)}`;
  }

  return `https://instagram.com/${trimmed}`;
}