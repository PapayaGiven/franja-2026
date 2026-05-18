"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, GraduationCap, Store, Map, MoreHorizontal } from "lucide-react";

/**
 * Mobile-first bottom navigation. Six top-level destinations:
 * Inicio · Agenda · Simposios · Empresas · Mapa · Más.
 *
 * Active state matches the current pathname's first segment so deep
 * pages like `/agenda/[slug]` still highlight their parent tab.
 * Conferencistas + Directores moved into /mas.
 */
const ITEMS = [
  { href: "/", label: "Inicio", icon: Home, segment: "" },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, segment: "agenda" },
  { href: "/simposios", label: "Simposios", icon: GraduationCap, segment: "simposios" },
  { href: "/empresas", label: "Empresas", icon: Store, segment: "empresas" },
  { href: "/mapa", label: "Mapa", icon: Map, segment: "mapa" },
  { href: "/mas", label: "Más", icon: MoreHorizontal, segment: "mas" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeSegment = pathname.split("/")[1] ?? "";

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-40 border-t border-franja-border bg-franja-bg/85 backdrop-blur-md"
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-6">
        {ITEMS.map(({ href, label, icon: Icon, segment }) => {
          const active = segment === activeSegment;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] transition ${
                  active
                    ? "text-franja-turquoise"
                    : "text-franja-text-muted hover:text-franja-text-secondary"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
