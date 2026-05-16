import Link from "next/link";
import { CalendarDays, Users, Store, Map } from "lucide-react";

/**
 * Inicio quick-access grid — 4 big touch targets to the main app
 * surfaces. Helps satisfy the brief's "max 2 clicks to any information"
 * rule from the home page.
 */
const ACTIONS: {
  href: string;
  label: string;
  icon: typeof CalendarDays;
  accent: string; // hex color for the icon halo
}[] = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays, accent: "#3DCDD0" },
  { href: "/speakers", label: "Conferencistas", icon: Users, accent: "#AF6CE8" },
  { href: "/negocios", label: "Empresas", icon: Store, accent: "#E85DA6" },
  { href: "/mapa", label: "Mapa", icon: Map, accent: "#F0C75E" },
];

export function QuickActions() {
  return (
    <nav aria-label="Accesos rápidos" className="grid grid-cols-2 gap-3">
      {ACTIONS.map(({ href, label, icon: Icon, accent }) => (
        <Link
          key={href}
          href={href}
          className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-3 transition hover:bg-white/10 hover:border-franja-border-strong"
        >
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${accent}1F`, // ~12% alpha tint
              color: accent,
            }}
          >
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <span className="text-sm font-medium text-white">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
