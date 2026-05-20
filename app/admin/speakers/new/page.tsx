import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { createSpeakerAction } from "../actions";
import { DeferredPhotoPicker } from "./DeferredPhotoPicker";

export default async function NewSpeakerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; slug?: string }>;
}) {
  const { error, slug: collidingSlug } = await searchParams;

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
          Nuevo conferencista
        </h1>
        <p className="text-sm text-franja-text-muted">
          Después de crearlo podrás completar más datos o cambiar la foto.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-franja-pink/40 bg-franja-pink/10 px-3 py-2 text-sm text-franja-pink"
        >
          <AlertCircle size={14} />
          {decodeMessage(error, collidingSlug)}
        </div>
      )}

      <form
        action={createSpeakerAction}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]"
      >
        <aside className="space-y-3">
          <DeferredPhotoPicker />
        </aside>

        <div className="space-y-5">
          <FieldRow>
            <Field label="Nombre completo" name="full_name" required>
              <Input name="full_name" required autoFocus />
            </Field>
            <Field
              label="Slug"
              name="slug"
              hint="kebab-case, sin acentos. Si lo dejás vacío se deriva del nombre."
            >
              <Input
                name="slug"
                pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
                defaultValue={
                  error === "slug-taken" && collidingSlug ? collidingSlug : ""
                }
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Credenciales" name="credentials" hint="Ej: OD. MSc. PhD.">
              <Input name="credentials" />
            </Field>
            <Field label="Especialidad" name="specialty">
              <Input name="specialty" />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="País" name="country">
              <Input name="country" />
            </Field>
            <Field label="Código país" name="country_code" hint="ISO-2 (CO, ES, US…)">
              <Input
                name="country_code"
                maxLength={2}
                style={{ textTransform: "uppercase" }}
              />
            </Field>
          </FieldRow>

          <Field label="Institución" name="institution">
            <Input name="institution" />
          </Field>

          <Field label="Bio" name="bio">
            <Textarea name="bio" rows={4} />
          </Field>

          <FieldRow>
            <Field label="Sitio web" name="website">
              <Input type="url" name="website" placeholder="https://" />
            </Field>
            <Field label="LinkedIn" name="linkedin">
              <Input name="linkedin" />
            </Field>
          </FieldRow>

          <Field label="Instagram" name="instagram" hint="@usuario o URL">
            <Input name="instagram" />
          </Field>

          <label className="flex items-center gap-2 text-sm text-franja-text-primary">
            <input
              type="checkbox"
              name="is_featured"
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
              Crear conferencista
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function decodeMessage(raw: string, slug?: string): string {
  if (raw === "name") return "El nombre completo es obligatorio.";
  if (raw === "slug")
    return "El slug es obligatorio o el nombre no produce uno válido.";
  if (raw === "slug-format")
    return "El slug solo puede contener letras minúsculas, números y guiones.";
  if (raw === "slug-taken")
    return slug
      ? `Ya existe un conferencista con el slug "${slug}". Probá con otro.`
      : "Ese slug ya está en uso.";
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
