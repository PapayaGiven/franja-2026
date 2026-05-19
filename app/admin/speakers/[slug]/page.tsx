import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Speaker } from "@/lib/types";
import { PhotoUploader } from "./PhotoUploader";
import { updateSpeakerAction } from "./actions";

const SELECT = `
  id, slug, full_name, photo_url, country, country_code,
  specialty, institution, credentials, bio,
  website, linkedin, instagram, is_featured,
  created_at, updated_at
`;

export default async function SpeakerEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { saved, error } = await searchParams;

  const supabase = createAdminClient();
  const { data, error: fetchErr } = await supabase
    .from("speakers")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!data) notFound();
  const speaker = data as Speaker;

  // Server action bound with the slug — the form submits FormData and
  // the action handles the redirect (saved=1 / error=...).
  const action = updateSpeakerAction.bind(null, slug);

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

        <form action={action} className="space-y-5">
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
    </div>
  );
}

function decodeMessage(raw: string): string {
  if (raw === "name") return "El nombre completo es obligatorio.";
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

function SuccessToast() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-franja-turquoise/40 bg-franja-turquoise/10 px-3 py-2 text-sm text-franja-turquoise"
    >
      <CheckCircle2 size={14} />
      Cambios guardados.
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
