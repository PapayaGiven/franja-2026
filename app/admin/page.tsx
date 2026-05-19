import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Admin home — stub during Phase D. Full counters dashboard (speakers
 * total / with photo, exhibitors total / with logo, etc.) lands in the
 * second batch alongside the rest of the admin pages.
 */
export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-medium text-franja-text-primary">
          Panel Admin
        </h1>
        <p className="text-sm text-franja-text-muted">
          Gestión de contenido para FRANJA 2026.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/admin/speakers"
          title="Speakers"
          description="Subir fotos, editar perfiles y biografías"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-xl border border-franja-border bg-franja-bg-elevated/50 p-4 transition hover:border-franja-turquoise/40"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-franja-text-primary">{title}</p>
        <p className="text-xs text-franja-text-muted">{description}</p>
      </div>
      <ArrowUpRight
        size={16}
        className="text-franja-text-muted transition group-hover:text-franja-turquoise"
      />
    </Link>
  );
}
