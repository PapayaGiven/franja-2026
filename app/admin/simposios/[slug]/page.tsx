import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import {
  addSymposiumParticipantAction,
  removeSymposiumParticipantAction,
  updateSymposiumAction,
} from "./actions";

export default async function EditSimposioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    created?: string;
    slug?: string;
    participant_added?: string;
    participant_removed?: string;
  }>;
}) {
  await requireAdmin();

  const { slug } = await params;
  const {
    error,
    saved,
    created,
    slug: collidingSlug,
    participant_added,
    participant_removed,
  } = await searchParams;

  const supabase = createAdminClient();

  const [
    { data: symposium, error: symposiumError },
    { data: tracks },
    { data: areas },
    { data: categories },
  ] = await Promise.all([
    supabase.from("symposiums").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("tracks").select("id, name").order("name"),
    supabase.from("areas").select("id, name").order("name"),
    supabase.from("simposio_categories").select("id, name").order("name"),
  ]);

  if (symposiumError || !symposium) {
    notFound();
  }

  const [{ data: participants }, { data: allSpeakers }] = await Promise.all([
    supabase
      .from("symposium_speakers")
      .select(
        `
        symposium_id,
        speaker_id,
        role,
        display_order,
        speaker:speakers (
          id,
          slug,
          full_name,
          credentials,
          country,
          specialty
        )
      `
      )
      .eq("symposium_id", symposium.id)
      .order("role", { ascending: true })
      .order("display_order", { ascending: true }),

    supabase
      .from("speakers")
      .select("id, slug, full_name, credentials, country, specialty")
      .order("full_name", { ascending: true }),
  ]);

  const updateWithSlug = updateSymposiumAction.bind(null, slug);
  const addParticipantWithSlug = addSymposiumParticipantAction.bind(null, slug);
  const removeParticipantWithSlug = removeSymposiumParticipantAction.bind(
    null,
    slug
  );

  return (
    <div className="space-y-6">
      <nav className="text-xs">
        <Link
          href="/admin/simposios"
          className="inline-flex items-center gap-1 text-franja-text-muted transition hover:text-franja-text-primary"
        >
          <ChevronLeft size={12} />
          Volver a simposios
        </Link>
      </nav>

      <header className="space-y-1">
        <h1 className="text-xl font-medium text-franja-text-primary">
          Editar simposio
        </h1>
        <p className="text-sm text-franja-text-muted">
          Actualiza la información base del simposio. Los cambios se reflejan en agenda y app pública.
        </p>
      </header>

      {created && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
        >
          <CheckCircle2 size={14} />
          Simposio creado correctamente.
        </div>
      )}

      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
        >
          <CheckCircle2 size={14} />
          Cambios guardados correctamente.
        </div>
      )}

      {participant_added && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
        >
          <CheckCircle2 size={14} />
          Participante agregado correctamente.
        </div>
      )}

      {participant_removed && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
        >
          <CheckCircle2 size={14} />
          Participante eliminado correctamente.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-franja-pink/40 bg-franja-pink/10 px-3 py-2 text-sm text-franja-pink"
        >
          <AlertCircle size={14} />
          {decodeMessage(error, collidingSlug)}
        </div>
      )}

      <form action={updateWithSlug} className="space-y-5">
        <FieldRow>
          <Field label="Nombre oficial" name="official_name" required>
            <Input
              name="official_name"
              required
              defaultValue={symposium.official_name ?? ""}
              autoFocus
            />
          </Field>

          <Field label="Slug" name="slug" required>
            <Input
              name="slug"
              required
              pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
              defaultValue={symposium.slug}
            />
          </Field>
        </FieldRow>

        <Field label="Subtítulo" name="subtitle">
          <Input name="subtitle" defaultValue={symposium.subtitle ?? ""} />
        </Field>

        <Field label="Descripción" name="description">
          <Textarea
            name="description"
            rows={4}
            defaultValue={symposium.description ?? ""}
          />
        </Field>

        <FieldRow>
          <Field label="Tipo" name="kind">
            <Select name="kind" defaultValue={symposium.kind ?? "symposium"}>
              <option value="symposium">Simposio</option>
              <option value="meeting">Reunión</option>
              <option value="panel">Panel</option>
              <option value="workshop">Taller</option>
            </Select>
          </Field>

          <Field label="Categoría genérica" name="generic_category">
            <Input
              name="generic_category"
              defaultValue={symposium.generic_category ?? ""}
            />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Día" name="day">
            <Select name="day" defaultValue={symposium.day ?? ""}>
              <option value="">Sin día</option>
              <option value="2026-07-09">Jueves 9 de julio de 2026</option>
              <option value="2026-07-10">Viernes 10 de julio de 2026</option>
            </Select>
          </Field>

          <Field label="Salón / track" name="track_id">
            <Select name="track_id" defaultValue={symposium.track_id ?? ""}>
              <option value="">Sin salón</option>
              {(tracks ?? []).map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </Select>
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Hora inicio" name="start_time">
            <Input
              type="time"
              name="start_time"
              defaultValue={toTimeInput(symposium.start_time)}
            />
          </Field>

          <Field label="Hora final" name="end_time">
            <Input
              type="time"
              name="end_time"
              defaultValue={toTimeInput(symposium.end_time)}
            />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Área" name="area_id">
            <Select name="area_id" defaultValue={symposium.area_id ?? ""}>
              <option value="">Sin área</option>
              {(areas ?? []).map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Categoría oficial" name="category_id">
            <Select name="category_id" defaultValue={symposium.category_id ?? ""}>
              <option value="">Sin categoría</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Organización exclusiva" name="exclusive_org">
            <Input
              name="exclusive_org"
              defaultValue={symposium.exclusive_org ?? ""}
            />
          </Field>

          <Field label="Marca patrocinadora" name="sponsor_brand">
            <Input
              name="sponsor_brand"
              defaultValue={symposium.sponsor_brand ?? ""}
            />
          </Field>
        </FieldRow>

        <label className="flex items-center gap-2 text-sm text-franja-text-primary">
          <input
            type="checkbox"
            name="is_exclusive"
            defaultChecked={Boolean(symposium.is_exclusive)}
            className="h-4 w-4 rounded border-franja-border bg-franja-bg accent-franja-turquoise"
          />
          Marcar como exclusivo
        </label>

        <div className="flex items-center justify-between gap-2 border-t border-franja-border pt-4">
          <Link
            href={`/simposios/${symposium.slug}`}
            className="rounded-md border border-franja-border px-3 py-2 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary"
          >
            Ver en app pública
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/simposios"
              className="rounded-md border border-franja-border px-3 py-2 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-md bg-franja-turquoise px-4 py-2 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </form>

      <section className="space-y-4 rounded-xl border border-franja-border bg-franja-bg-elevated p-4">
        <div>
          <h2 className="text-base font-medium text-franja-text-primary">
            Participantes y directores
          </h2>
          <p className="text-sm text-franja-text-muted">
            Agrega o elimina directores, conferencistas y moderadores asociados a este simposio.
          </p>
        </div>

        <form
          action={addParticipantWithSlug}
          className="grid grid-cols-1 gap-3 rounded-lg border border-franja-border bg-franja-bg/50 p-3 md:grid-cols-[1fr_180px_120px_auto]"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-franja-text-muted">
              Persona
            </label>
            <select
              name="speaker_id"
              required
              className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
            >
              <option value="">Seleccionar persona</option>
              {(allSpeakers ?? []).map((speaker) => (
                <option key={speaker.id} value={speaker.id}>
                  {speaker.full_name}
                  {speaker.credentials ? ` — ${speaker.credentials}` : ""}
                  {speaker.country ? ` (${speaker.country})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-franja-text-muted">
              Rol
            </label>
            <select
              name="role"
              defaultValue="speaker"
              className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
            >
              <option value="speaker">Conferencista</option>
              <option value="director">Director</option>
              <option value="moderator">Moderador</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-franja-text-muted">
              Orden
            </label>
            <input
              type="number"
              name="display_order"
              defaultValue={0}
              min={0}
              className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-franja-turquoise px-4 py-2 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
            >
              Agregar
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-franja-border">
          <table className="min-w-full divide-y divide-franja-border text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-franja-text-muted">
                  Persona
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-franja-text-muted">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-franja-text-muted">
                  Orden
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-franja-text-muted">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-franja-border">
              {(participants ?? []).map((participant) => {
                const speaker = Array.isArray(participant.speaker)
                  ? participant.speaker[0]
                  : participant.speaker;

                return (
                  <tr
                    key={`${participant.symposium_id}-${participant.speaker_id}-${participant.role}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-franja-text-primary">
                        {speaker?.full_name ?? "Persona sin nombre"}
                      </p>
                      <p className="text-xs text-franja-text-muted">
                        {speaker?.credentials ?? "Sin credenciales"}
                        {speaker?.country ? ` · ${speaker.country}` : ""}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-franja-text-muted">
                      {roleLabel(participant.role)}
                    </td>

                    <td className="px-4 py-3 text-franja-text-muted">
                      {participant.display_order ?? 0}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <form action={removeParticipantWithSlug}>
                        <input
                          type="hidden"
                          name="symposium_id"
                          value={participant.symposium_id}
                        />
                        <input
                          type="hidden"
                          name="speaker_id"
                          value={participant.speaker_id}
                        />
                        <input
                          type="hidden"
                          name="role"
                          value={participant.role}
                        />
                        <button
                          type="submit"
                          className="rounded-md border border-franja-pink/40 px-2.5 py-1.5 text-xs text-franja-pink transition hover:bg-franja-pink/10"
                        >
                          Quitar
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}

              {(participants ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-franja-text-muted"
                  >
                    Este simposio todavía no tiene participantes asociados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function decodeMessage(raw: string, slug?: string): string {
  if (raw === "name") return "El nombre oficial es obligatorio.";
  if (raw === "slug") return "El slug es obligatorio.";
  if (raw === "slug-format")
    return "El slug solo puede contener letras minúsculas, números y guiones.";
  if (raw === "slug-taken")
    return slug
      ? `Ya existe un simposio con el slug "${slug}". Prueba con otro.`
      : "Ese slug ya está en uso.";
  if (raw === "missing-speaker")
    return "Debes seleccionar una persona para agregarla al simposio.";
  if (raw === "invalid-role")
    return "El rol seleccionado no es válido.";
  if (raw === "participant-exists")
    return "Esa persona ya está asociada a este simposio con ese mismo rol.";
  if (raw === "missing-relation")
    return "No se pudo identificar la relación que quieres eliminar.";
  if (raw === "symposium-not-found")
    return "No se encontró el simposio.";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function toTimeInput(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

function roleLabel(role: string | null) {
  if (role === "director") return "Director";
  if (role === "moderator") return "Moderador";
  if (role === "speaker") return "Conferencista";
  return role ?? "—";
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  name,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-wider text-franja-text-muted"
      >
        {label}
        {required && <span className="text-franja-pink"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-franja-text-muted/80">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={props.name}
      {...props}
      className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={props.name}
      {...props}
      className="w-full resize-y rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={props.name}
      {...props}
      className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
    />
  );
}