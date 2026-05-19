import Link from "next/link";
import { headers } from "next/headers";
import { LogOut } from "lucide-react";

export const metadata = {
  title: "Admin · FRANJA 2026",
};

// The order here is the order the tabs render — earliest pages first.
// Pages that don't exist yet (build in progress) are still listed so
// the nav is stable and visible; clicking them is fine because the
// admin will land on a 404 until the page lands in main.
const NAV = [
  { href: "/admin", label: "Inicio", segment: "" },
  { href: "/admin/speakers", label: "Speakers", segment: "speakers" },
  { href: "/admin/exhibitors", label: "Empresas", segment: "exhibitors" },
  { href: "/admin/simposios", label: "Simposios", segment: "simposios" },
  { href: "/admin/banners", label: "Banners", segment: "banners" },
  { href: "/admin/cambio-sala", label: "Cambio de sala", segment: "cambio-sala" },
  { href: "/admin/hoteles", label: "Hoteles", segment: "hoteles" },
  { href: "/admin/noticias", label: "Noticias", segment: "noticias" },
  { href: "/admin/faq", label: "FAQ", segment: "faq" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/login is intentionally NOT wrapped in this chrome — the
  // middleware lets unauthenticated requests through to that route.
  // We detect it via x-pathname (set in middleware) and bypass the
  // shell so the login page can render full-bleed centered.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const activeSegment = pathname.replace(/^\/admin\/?/, "").split("/")[0] ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-franja-bg">
      <header className="sticky top-0 z-30 border-b border-franja-border bg-franja-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-semibold text-franja-text-primary"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-franja-turquoise" />
            FRANJA 2026
            <span className="text-franja-text-muted font-normal">· Admin</span>
          </Link>

          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-franja-border px-3 py-1.5 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary"
            >
              <LogOut size={12} strokeWidth={2} />
              Cerrar sesión
            </button>
          </form>
        </div>

        <nav
          aria-label="Admin"
          className="border-t border-franja-border/60"
        >
          <ul className="mx-auto flex max-w-screen-xl gap-1 overflow-x-auto px-2 py-1.5">
            {NAV.map(({ href, label, segment }) => {
              const active = segment === activeSegment;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition ${
                      active
                        ? "bg-franja-turquoise/15 text-franja-turquoise"
                        : "text-franja-text-muted hover:bg-white/5 hover:text-franja-text-primary"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
