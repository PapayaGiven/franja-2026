import Link from "next/link";
import {
  CalendarDays,
  Users,
  Store,
  Map,
  Mic2,
  UserRoundCheck,
  Building2,
  Newspaper,
} from "lucide-react";

/**
 * Inicio quick-access grid — módulos principales del home.
 * Mantiene la estética visual de FRANJA 2026 con tarjetas oscuras,
 * bordes suaves, acentos de marca y buen comportamiento mobile-first.
 */
const ACTIONS: {
  href: string;
  label: string;
  icon: typeof CalendarDays;
  accent: string;
}[] = [
  {
    href: "/agenda-mapa",
    label: "Agenda y mapa",
    icon: CalendarDays,
    accent: "#3DCDD0",
  },
  {
    href: "/simposios",
    label: "Simposios",
    icon: Mic2,
    accent: "#F0C75E",
  },
  {
    href: "/mas/directores",
    label: "Directores",
    icon: UserRoundCheck,
    accent: "#AF6CE8",
  },
  {
    href: "/conferencistas",
    label: "Conferencistas",
    icon: Users,
    accent: "#AF6CE8",
  },
  {
    href: "/empresas",
    label: "Empresas",
    icon: Store,
    accent: "#E85DA6",
  },
  {
    href: "/reuniones",
    label: "Reuniones gremiales y profesionales",
    icon: Building2,
    accent: "#3DCDD0",
  },
  {
    href: "/mas/info",
    label: "Información general y noticias",
    icon: Newspaper,
    accent: "#F0C75E",
  },
  {
    href: "/mas/hoteles",
    label: "Hoteles",
    icon: Map,
    accent: "#E85DA6",
  },
];

export function QuickActions() {
  return (
    <section className="space-y-4" aria-labelledby="home-modules-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="home-modules-title" className="text-xl font-semibold text-white">
            Módulos
          </h2>
          <p className="text-sm text-white/55">
            Accede rápidamente a la información principal del evento.
          </p>
        </div>
      </div>

      <nav aria-label="Módulos principales" className="grid grid-cols-2 gap-3">
        {ACTIONS.map(({ href, label, icon: Icon, accent }) => (
          <Link
            key={label}
            href={href}
            className="min-h-[118px] rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm p-4 flex flex-col justify-between gap-4 transition hover:bg-white/10 hover:border-franja-border-strong active:scale-[0.98]"
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${accent}1F`,
                color: accent,
              }}
            >
              <Icon size={20} strokeWidth={1.75} />
            </span>

            <span className="text-sm sm:text-base font-semibold text-white leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}