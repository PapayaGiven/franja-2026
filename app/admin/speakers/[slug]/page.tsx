import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Speaker } from "@/lib/types";
import { PhotoUploader } from "./PhotoUploader";
import {
  addSpeakerSymposiumAction,
  removeSpeakerSymposiumAction,
  updateSpeakerAction,
} from "./actions";

const SELECT = `
  id, slug, full_name, photo_url, country, country_code,
  specialty, institution, credentials, bio,
  website, linkedin, instagram, is_featured,
  created_at, updated_at
`;

type SymposiumRow = Record<string, unknown> & {
  id: string;
  slug?: string | null;
};

type SpeakerSymposiumRow = {
  speaker_id: string;
  symposium_id: string;
  role: string | null;
  display_order: number | null;
  symposiums: SymposiumRow | SymposiumRow[] | null;
};

export default async function SpeakerEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    saved?: string;
    created?: string;
    error?: string;
    photoError?: string;
  }>;
}) {
  const { slug } = await params;
  const { saved, created, error, photoError } = await searchParams;

  const supabase = createAdminClient();

  const { data, error: fetchErr } = await supabase
    .from("speakers")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!data) notFound();

  const speaker = data as Speaker;

  const { data: speakerSymposiumsData, error: speakerSymposiumsError } =
    await supabase
      .from("symposium_speakers")
      .select(
        `
          speaker_id,
          symposium_id,
          role,
          display_order,
          symposiums (*)
        `,
      )
      .eq("speaker_id", speaker.id)
      .order("display_order", { ascending: true });

  if (speakerSymposiumsError) throw speakerSymposiumsError;

  const speakerSymposiums =
    (speakerSymposiumsData ?? []) as SpeakerSymposiumRow[];

  const { data: allSymposiumsData, error: allSymposiumsError } = await supabase
    .from("symposiums")
    .select("*")
    .order("slug", { ascending: true });

  if (allSymposiumsError) throw allSymposiumsError;

  const allSymposiums = (allSymposiumsData ?? []) as SymposiumRow[];

  // Server actions bound with the slug — the forms submit FormData and
  // each action handles the redirect (saved=1 / error=...).
  const updateAction = updateSpeakerAction.bind(null, slug);
  const addSymposiumAction = addSpeakerSymposiumAction.bind(null, slug);
  const removeSymposiumAction = removeSpeakerSymposiumAction.bind(null, slug);

  return (
    <div className="space-y-6">
      <nav className="text-xs">
        <Link
          href="/admin/speakers"
          className="inline-flex items-center gap-1 text-franja-text-muted transition hover:text-franja-text-primary"
        >
          <ChevronLeft size={12} />
          Volver a speakers
        </Link>
      </nav>

      <header className="space-y-1">
        <h1 className="text-xl font-medium text-franja-text-primary">
          {speaker.full_name}
        </h1>
        <p className="text-xs text-franja-text-muted">slug: {speaker.slug}</p>
      </header>

      {created === "1" && !photoError && (
        <SuccessToast message="Conferencista creado. Verifica los datos abajo." />
      )}
      {created === "1" && photoError && (
        <ErrorToast
          message={`Conferencista creado pero falló la subida de la foto: ${decodeURIComponent(
            photoError,
          )}. Probá de nuevo desde el cuadro de foto.`}
        />
      )}
      {saved === "1" && <SuccessToast />}
      {error && <ErrorToast message={decodeMessage(error)} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <PhotoUploader
            slug={speaker.slug}
            initialUrl={speaker.photo_url}
            name={speaker.full_name}
          />
        </aside>

        <form action={updateAction} className="space-y-5">
          <FieldRow>
            <Field label="Nombre completo" name="full_name" required>
              <Input name="full_name" defaultValue={speaker.full_name} required />
            </Field>
            <Field label="Credenciales" name="credentials" hint="Ej: OD. MSc. PhD.">
              <Input name="credentials" defaultValue={speaker.credentials ?? ""} />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="País" name="country">
              <Input name="country" defaultValue={speaker.country ?? ""} />
            </Field>
            <Field label="Código país" name="country_code" hint="ISO-2 (CO, ES, US…)">
              <Input
                name="country_code"
                defaultValue={speaker.country_code ?? ""}
                maxLength={2}
                style={{ textTransform: "uppercase" }}
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Especialidad" name="specialty">
              <Input name="specialty" defaultValue={speaker.specialty ?? ""} />
            </Field>
            <Field label="Institución" name="institution">
              <Input name="institution" defaultValue={speaker.institution ?? ""} />
            </Field>
          </FieldRow>

          <Field label="Bio" name="bio">
            <Textarea name="bio" defaultValue={speaker.bio ?? ""} rows={5} />
          </Field>

          <FieldRow>
            <Field label="Sitio web" name="website">
              <Input
                type="url"
                name="website"
                defaultValue={speaker.website ?? ""}
                placeholder="https://"
              />
            </Field>
            <Field label="LinkedIn" name="linkedin">
              <Input name="linkedin" defaultValue={speaker.linkedin ?? ""} />
            </Field>
          </FieldRow>

          <Field label="Instagram" name="instagram" hint="@usuario o URL">
            <Input name="instagram" defaultValue={speaker.instagram ?? ""} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-franja-text-primary">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={speaker.is_featured}
              className="h-4 w-4 rounded border-franja-border bg-franja-bg accent-franja-turquoise"
            />
            Marcar como conferencista destacado
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-franja-border pt-4">
            <Link
              href="/admin/speakers"
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
        </form>
      </div>

      <section className="rounded-xl border border-franja-border bg-franja-bg-elevated/60 p-4">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-base font-medium text-franja-text-primary">
            Simposios asociados
          </h2>
          <p className="text-xs text-franja-text-muted">
            Aquí puedes ver, agregar o quitar la participación de este conferencista
            en simposios como conferencista, director o moderador.
          </p>
        </div>

        <div className="space-y-3">
          {speakerSymposiums.length === 0 ? (
            <p className="rounded-md border border-dashed border-franja-border px-3 py-4 text-sm text-franja-text-muted">
              Este conferencista todavía no está asociado a ningún simposio.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-franja-border">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-franja-bg/80 text-xs uppercase tracking-wider text-franja-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Simposio</th>
                    <th className="px-3 py-2 font-medium">Rol</th>
                    <th className="px-3 py-2 font-medium">Orden</th>
                    <th className="px-3 py-2 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-franja-border">
                  {speakerSymposiums.map((row) => {
                    const symposium = firstRecord(row.symposiums);
                    const symposiumLabel = getSymposiumLabel(symposium);
                    const role = row.role ?? "speaker";

                    return (
                      <tr
                        key={`${row.symposium_id}-${role}`}
                        className="text-franja-text-primary"
                      >
                        <td className="px-3 py-3">
                          <div className="font-medium">{symposiumLabel}</div>
                          {symposium?.slug && (
                            <div className="text-xs text-franja-text-muted">
                              slug: {symposium.slug}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full border border-franja-border px-2 py-1 text-xs text-franja-text-muted">
                            {roleLabel(role)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-franja-text-muted">
                          {row.display_order ?? 0}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <form action={removeSymposiumAction}>
                            <input
                              type="hidden"
                              name="speaker_id"
                              value={speaker.id}
                            />
                            <input
                              type="hidden"
                              name="symposium_id"
                              value={row.symposium_id}
                            />
                            <input type="hidden" name="role" value={role} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-md border border-franja-pink/40 px-2.5 py-1.5 text-xs text-franja-pink transition hover:bg-franja-pink/10"
                            >
                              <Trash2 size={12} />
                              Quitar
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form
          action={addSymposiumAction}
          className="mt-5 grid grid-cols-1 gap-3 rounded-lg border border-franja-border bg-franja-bg/50 p-3 md:grid-cols-[1fr_160px_120px_auto]"
        >
          <input type="hidden" name="speaker_id" value={speaker.id} />

          <Field label="Agregar a simposio" name="symposium_id">
            <select
              id="symposium_id"
              name="symposium_id"
              required
              className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona un simposio
              </option>
              {allSymposiums.map((symposium) => (
                <option key={symposium.id} value={symposium.id}>
                  {getSymposiumLabel(symposium)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rol" name="role">
            <select
              id="role"
              name="role"
              required
              className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
              defaultValue="speaker"
            >
              <option value="speaker">Conferencista</option>
              <option value="director">Director</option>
              <option value="moderator">Moderador</option>
            </select>
          </Field>

          <Field label="Orden" name="display_order">
            <Input
              type="number"
              name="display_order"
              min={0}
              step={1}
              defaultValue={0}
            />
          </Field>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-franja-turquoise px-4 py-2 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
            >
              Agregar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function firstRecord(
  value: SymposiumRow | SymposiumRow[] | null,
): SymposiumRow | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function getSymposiumLabel(symposium: SymposiumRow | null): string {
  if (!symposium) return "Simposio sin nombre";

  const possibleKeys = [
    "official_name",
    "title",
    "name",
    "symposium_name",
    "display_name",
    "slug",
  ];

  for (const key of possibleKeys) {
    const value = symposium[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "Simposio sin nombre";
}

function roleLabel(role: string): string {
  if (role === "director") return "Director";
  if (role === "moderator") return "Moderador";
  return "Conferencista";
}

function decodeMessage(raw: string): string {
  if (raw === "name") return "El nombre completo es obligatorio.";
  if (raw === "missing-fields") return "Faltan campos obligatorios.";
  if (raw === "invalid-role") return "El rol seleccionado no es válido.";

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
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

function SuccessToast({ message = "Cambios guardados." }: { message?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
    >
      <CheckCircle2 size={14} />
      {message}
    </div>
  );
}

function ErrorToast({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-franja-pink/40 bg-franja-pink/10 px-3 py-2 text-sm text-franja-pink"
    >
      <AlertCircle size={14} />
      {message}
    </div>
  );
}