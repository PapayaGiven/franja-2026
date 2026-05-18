"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getFavorites, type Favorite } from "@/lib/localStorage/favorites";

/**
 * Mi Maletín — agrupa los items guardados en localStorage por kind.
 * Sin server round-trip: por ahora solo confirmamos lo que el usuario
 * guardó. Resolver cada favorito al nombre real (consulta a Supabase
 * por id) llega en un commit posterior.
 */

const KIND_LABEL: Record<Favorite["kind"], string> = {
  symposium: "Simposios",
  speaker: "Conferencistas",
  exhibitor: "Empresas",
};

const KIND_HREF: Record<Favorite["kind"], string> = {
  symposium: "/agenda",
  speaker: "/mas/conferencistas",
  exhibitor: "/empresas",
};

export default function MaletinPage() {
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Grupo por kind preservando el orden de adición original (más
  // viejos primero — fácil de cambiar si el usuario prefiere "lo más
  // reciente arriba").
  const buckets = (favorites ?? []).reduce<Record<Favorite["kind"], Favorite[]>>(
    (acc, fav) => {
      (acc[fav.kind] = acc[fav.kind] ?? []).push(fav);
      return acc;
    },
    { symposium: [], speaker: [], exhibitor: [] },
  );

  const totalSaved = favorites?.length ?? 0;

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Mi Maletín
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Los simposios, conferencistas y empresas que guardaste.
        </p>
      </header>

      {favorites === null ? (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Cargando tu maletín…
        </div>
      ) : totalSaved === 0 ? (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-8 text-center backdrop-blur-sm">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-franja-turquoise/15 text-franja-turquoise">
            <Briefcase size={26} strokeWidth={1.5} />
          </span>
          <p className="text-sm text-franja-text-secondary">
            Aún no has guardado nada.
          </p>
          <p className="mt-1 text-xs text-franja-text-muted">
            Toca el icono ☆ en cualquier simposio, ponente o empresa.
          </p>
        </div>
      ) : (
        (Object.keys(KIND_LABEL) as Favorite["kind"][]).map((kind) => {
          const items = buckets[kind];
          if (!items || items.length === 0) return null;
          return (
            <section key={kind} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
                  {KIND_LABEL[kind]}
                </h2>
                <span className="text-xs text-franja-text-muted">
                  {items.length}
                </span>
              </div>
              <ul className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm divide-y divide-franja-border overflow-hidden">
                {items.map((f) => (
                  <li key={`${f.kind}-${f.id}`} className="px-4 py-3 text-sm">
                    <p className="text-franja-text-secondary font-mono text-xs truncate">
                      {f.id}
                    </p>
                    <p className="text-[11px] text-franja-text-muted mt-0.5">
                      Guardado el {new Date(f.addedAt).toLocaleDateString("es-CO")}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href={KIND_HREF[kind]}
                className="block text-xs font-medium text-franja-turquoise hover:underline"
              >
                Ver todos en {KIND_LABEL[kind].toLowerCase()} →
              </Link>
            </section>
          );
        })
      )}
    </main>
  );
}
