import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

export default async function AdminSimposiosPage() {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: symposiums, error } = await supabase
    .from("symposiums")
    .select(`
      id,
      slug,
      official_name,
      subtitle,
      day,
      start_time,
      end_time,
      is_exclusive,
      tracks (
        name
      ),
      areas (
        name
      ),
      simposio_categories (
        name
      )
    `)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true })
    .order("official_name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-md border border-franja-pink/40 bg-franja-pink/10 p-4 text-sm text-franja-pink">
        Error cargando simposios: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-xl font-medium text-franja-text-primary">
            Simposios
          </h1>
          <p className="text-sm text-franja-text-muted">
            Gestiona nombres, horarios, salones, categorías y datos base de los simposios.
          </p>
          <p className="mt-1 text-xs text-franja-text-muted">
            Total en base de datos: {symposiums?.length ?? 0}
          </p>
        </div>

        <Link
          href="/admin/simposios/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-franja-turquoise px-4 py-2 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
        >
          <Plus size={14} />
          Nuevo simposio
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-franja-border bg-franja-bg-elevated">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-franja-border text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Simposio</Th>
                <Th>Día</Th>
                <Th>Horario</Th>
                <Th>Salón</Th>
                <Th>Área</Th>
                <Th>Categoría</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-franja-border">
              {(symposiums ?? []).map((s) => (
                <tr key={s.id} className="align-top">
                  <Td>
                    <div className="max-w-md">
                      <p className="font-medium text-franja-text-primary">
                        {s.official_name}
                      </p>
                      {s.subtitle && (
                        <p className="mt-1 text-xs text-franja-text-muted">
                          {s.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-franja-text-muted/70">
                        {s.slug}
                      </p>
                    </div>
                  </Td>
                  <Td>{formatDay(s.day)}</Td>
                  <Td>
                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                  </Td>
                  <Td>{relationName(s.tracks)}</Td>
                  <Td>{relationName(s.areas)}</Td>
                  <Td>{relationName(s.simposio_categories)}</Td>
                  <Td>
                    {s.is_exclusive ? (
                      <span className="rounded-full bg-franja-gold/15 px-2 py-1 text-[11px] text-franja-gold">
                        Exclusivo
                      </span>
                    ) : (
                      <span className="rounded-full bg-franja-turquoise/10 px-2 py-1 text-[11px] text-franja-turquoise">
                        General
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/simposios/${s.slug}`}
                      className="inline-flex items-center gap-1 rounded-md border border-franja-border px-2.5 py-1.5 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary"
                    >
                      <Pencil size={12} />
                      Editar
                    </Link>
                  </Td>
                </tr>
              ))}

              {symposiums?.length === 0 && (
                <tr>
                  <Td colSpan={8}>
                    <p className="py-8 text-center text-sm text-franja-text-muted">
                      No hay simposios registrados.
                    </p>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-franja-text-muted ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-franja-text-muted ${className}`}
    >
      {children}
    </td>
  );
}

function formatDay(day: string | null) {
  if (!day) return "—";
  if (day === "2026-07-09") return "Jue. 9 jul.";
  if (day === "2026-07-10") return "Vie. 10 jul.";
  return day;
}

function formatTime(time: string | null) {
  if (!time) return "—";
  return time.slice(0, 5);
}

function relationName(
  relation: { name: string | null } | { name: string | null }[] | null
) {
  if (!relation) return "—";

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "—";
  }

  return relation.name ?? "—";
}
