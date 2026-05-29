import Link from "next/link";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Store,
  GraduationCap,
  Megaphone,
  Hourglass,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin dashboard with real counters. Every count is computed
 * server-side via `head: true, count: "exact"` on the service-role
 * client so we don't ship row data we won't render. All counts run in
 * parallel.
 *
 * The "active banners" count mirrors the public-app RLS predicate
 * manually (admin client bypasses RLS, so we need explicit filters).
 */
export default async function AdminHomePage() {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const [
    speakersTotal,
    speakersWithPhoto,
    exhibitorsTotal,
    exhibitorsWithLogo,
    symposiumsTotal,
    symposiumsWithDescription,
    bannersActive,
  ] = await Promise.all([
    countOf(
      supabase
        .from("speakers")
        .select("id", { count: "exact", head: true }),
    ),
    countOf(
      supabase
        .from("speakers")
        .select("id", { count: "exact", head: true })
        .not("photo_url", "is", null),
    ),
    countOf(
      supabase
        .from("exhibitors")
        .select("id", { count: "exact", head: true }),
    ),
    countOf(
      supabase
        .from("exhibitors")
        .select("id", { count: "exact", head: true })
        .not("logo_url", "is", null),
    ),
    countOf(
      supabase
        .from("symposiums")
        .select("id", { count: "exact", head: true }),
    ),
    countOf(
      supabase
        .from("symposiums")
        .select("id", { count: "exact", head: true })
        .not("description", "is", null)
        .neq("description", ""),
    ),
    countOf(
      supabase
        .from("announcements")
        .select("id", { count: "exact", head: true })
        .eq("show_as_banner", true)
        .lte("scheduled_for", nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
    ),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-medium text-franja-text-primary">
          Panel Admin
        </h1>
        <p className="text-sm text-franja-text-muted">
          Estado del contenido de FRANJA 2026.
        </p>
      </header>

      <section
        aria-label="Contadores"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <AssetStatCard
          title="Speakers"
          icon={ImageIcon}
          total={speakersTotal}
          completed={speakersWithPhoto}
          completedLabel="con foto"
          missingLabel="sin foto"
          accent="turquoise"
          href="/admin/speakers"
        />
        <AssetStatCard
          title="Empresas"
          icon={Store}
          total={exhibitorsTotal}
          completed={exhibitorsWithLogo}
          completedLabel="con logo"
          missingLabel="sin logo"
          accent="purple"
          href="/admin/exhibitors"
        />
        <AssetStatCard
          title="Simposios"
          icon={GraduationCap}
          total={symposiumsTotal}
          completed={symposiumsWithDescription}
          completedLabel="con descripción"
          missingLabel="sin descripción"
          accent="pink"
          href="/admin/simposios"
        />
        <ActiveStatCard
          title="Banners activos"
          icon={Megaphone}
          count={bannersActive}
          href="/admin/banners"
          comingSoon
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-franja-text-muted">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/admin/speakers"
            title="Gestionar speakers"
            description="Subir fotos, editar perfiles y biografías"
          />
          <QuickLink
            href="/admin/exhibitors"
            title="Gestionar empresas"
            description="Logos, stands, sponsors y categorías"
          />
          <QuickLink
            href="/admin/exhibitors/new"
            title="Agregar empresa"
            description="Para las que faltaron del seed inicial"
          />
          <QuickLink
            href="/admin/simposios"
            title="Gestionar simposios"
            description="Nombres, descripciones, horarios y speakers"
          />
          <QuickLink
            href="/admin/banners"
            title="Composer de banners"
            description="Anuncios activos y programados"
            comingSoon
          />
          <QuickLink
            href="/admin/cambio-sala"
            title="Cambio de sala"
            description="Anuncio urgente con expiración 30 min"
            comingSoon
          />
        </div>
      </section>
    </div>
  );
}

async function countOf(builder: PromiseLike<{ count: number | null; error: unknown }>): Promise<number> {
  const { count, error } = await builder;
  if (error) {
    // Don't blow up the whole dashboard for one bad query — log and
    // surface 0 so the rest still renders.
    console.error("admin dashboard count failed:", error);
    return 0;
  }
  return count ?? 0;
}

const ACCENT_CLASSES = {
  turquoise: {
    icon: "text-franja-turquoise",
    bar: "bg-franja-turquoise",
    barBg: "bg-franja-turquoise/15",
  },
  purple: {
    icon: "text-franja-purple-light",
    bar: "bg-franja-purple-light",
    barBg: "bg-franja-purple-light/15",
  },
  pink: {
    icon: "text-franja-pink",
    bar: "bg-franja-pink",
    barBg: "bg-franja-pink/15",
  },
} as const;

function AssetStatCard({
  title,
  icon: Icon,
  total,
  completed,
  completedLabel,
  missingLabel,
  accent,
  href,
  comingSoon,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  total: number;
  completed: number;
  completedLabel: string;
  missingLabel: string;
  accent: keyof typeof ACCENT_CLASSES;
  href: string;
  comingSoon?: boolean;
}) {
  const missing = Math.max(0, total - completed);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const c = ACCENT_CLASSES[accent];

  const inner = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={c.icon} />
          <p className="text-sm font-medium text-franja-text-primary">{title}</p>
        </div>
        {comingSoon ? (
          <ComingSoonBadge />
        ) : (
          <ArrowUpRight
            size={14}
            className="text-franja-text-muted transition group-hover:text-franja-turquoise"
          />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-medium text-franja-text-primary">
          {total}
        </span>
        <span className="text-xs text-franja-text-muted">total</span>
      </div>

      <div className="space-y-1.5">
        <div className={`h-1.5 w-full overflow-hidden rounded-full ${c.barBg}`}>
          <div
            className={`h-full ${c.bar} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className={c.icon}>{completed} {completedLabel}</span>
          <span className="text-franja-text-muted">
            {missing} {missingLabel}
          </span>
        </div>
      </div>
    </div>
  );

  if (comingSoon) {
    return (
      <div className="rounded-2xl border border-franja-border bg-franja-bg-elevated/40 p-5">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-franja-border bg-franja-bg-elevated/50 p-5 transition hover:border-franja-turquoise/40"
    >
      {inner}
    </Link>
  );
}

function ActiveStatCard({
  title,
  icon: Icon,
  count,
  href,
  comingSoon,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count: number;
  href: string;
  comingSoon?: boolean;
}) {
  const inner = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-franja-gold" />
          <p className="text-sm font-medium text-franja-text-primary">{title}</p>
        </div>
        {comingSoon ? (
          <ComingSoonBadge />
        ) : (
          <ArrowUpRight
            size={14}
            className="text-franja-text-muted transition group-hover:text-franja-turquoise"
          />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-medium text-franja-text-primary">
          {count}
        </span>
        <span className="text-xs text-franja-text-muted">
          {count === 1 ? "activo" : "activos"}
        </span>
      </div>
      <p className="text-[11px] text-franja-text-muted">
        Anuncios que están mostrándose en la franja superior de la app.
      </p>
    </div>
  );

  if (comingSoon) {
    return (
      <div className="rounded-2xl border border-franja-border bg-franja-bg-elevated/40 p-5">
        {inner}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-franja-border bg-franja-bg-elevated/50 p-5 transition hover:border-franja-turquoise/40"
    >
      {inner}
    </Link>
  );
}

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-franja-border/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-franja-text-muted">
      <Hourglass size={9} />
      Próximamente
    </span>
  );
}

function QuickLink({
  href,
  title,
  description,
  comingSoon,
}: {
  href: string;
  title: string;
  description: string;
  comingSoon?: boolean;
}) {
  if (comingSoon) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border border-franja-border bg-franja-bg-elevated/30 p-4 opacity-70">
        <div className="space-y-1">
          <p className="text-sm font-medium text-franja-text-primary">{title}</p>
          <p className="text-xs text-franja-text-muted">{description}</p>
        </div>
        <ComingSoonBadge />
      </div>
    );
  }
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
