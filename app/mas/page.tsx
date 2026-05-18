import Link from "next/link";
import {
  Users,
  UserCog,
  Hotel as HotelIcon,
  Newspaper,
  Info,
  HelpCircle,
  Briefcase,
  ChevronRight,
} from "lucide-react";

/**
 * Más — hub que agrupa secciones secundarias. Conferencistas y
 * Directores viven aquí (no en el bottom nav). Networking ya no
 * forma parte del scope (decisión 0003).
 */

interface HubLink {
  href: string;
  label: string;
  hint?: string;
  icon: typeof Users;
}

const LINKS: HubLink[] = [
  { href: "/speakers", label: "Conferencistas", hint: "130+ ponentes de todo el mundo", icon: Users },
  { href: "/mas/directores", label: "Directores", hint: "Quién lidera cada simposio", icon: UserCog },
  { href: "/mas/hoteles", label: "Hoteles", hint: "Alojamiento recomendado", icon: HotelIcon },
  { href: "/mas/noticias", label: "Noticias", hint: "Últimas novedades del evento", icon: Newspaper },
  { href: "/mas/info", label: "Información General", hint: "Sedes, horarios, accesos", icon: Info },
  { href: "/mas/faq", label: "FAQ", hint: "Preguntas frecuentes", icon: HelpCircle },
  { href: "/mas/maletin", label: "Mi Maletín", hint: "Tus simposios y empresas guardados", icon: Briefcase },
];

export default function MasPage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">Más</h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Conferencistas, hoteles, noticias y todo lo demás.
        </p>
      </header>

      <ul className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm overflow-hidden">
        {LINKS.map(({ href, label, hint, icon: Icon }, i) => (
          <li key={href} className={i > 0 ? "border-t border-franja-border" : ""}>
            <Link
              href={href}
              className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-franja-turquoise/15 text-franja-turquoise shrink-0">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-franja-text-primary">
                  {label}
                </span>
                {hint && (
                  <span className="block text-xs text-franja-text-muted truncate">
                    {hint}
                  </span>
                )}
              </span>
              <ChevronRight size={16} className="text-franja-text-muted shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
