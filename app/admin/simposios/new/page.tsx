import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { createSymposiumAction } from "../actions";

export default async function NewSimposioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; slug?: string }>;
}) {
  await requireAdmin();

  const { error, slug: collidingSlug } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: tracks }, { data: areas }, { data: categories }] =
    await Promise.all([
      supabase.from("tracks").select("id, name").order("name"),
      supabase.from("areas").select("id, name").order("name"),
      supabase.from("simposio_categories").select("id, name").order("name"),
    ]);

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
          Nuevo simposio
        </h1>
        <p className="text-sm text-franja-text-muted">
          Crea un bloque base del evento. Las relaciones con conferencistas se gestionarán después.
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

      <form action={createSymposiumAction} className="space-y-5">
        <FieldRow>
          <Field label="Nombre oficial" name="official_name" required>
            <Input name="official_name" required autoFocus />
          </Field>

          <Field
            label="Slug"
            name="slug"
            hint="kebab-case, sin acentos. Si lo dejas vacío se deriva del nombre."
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

        <Field label="Subtítulo" name="subtitle">
          <Input name="subtitle" />
        </Field>

        <Field label="Descripción" name="description">
          <Textarea name="description" rows={4} />
        </Field>

        <FieldRow>
          <Field label="Tipo" name="kind">
            <Select name="kind" defaultValue="symposium">
              <option value="symposium">Simposio</option>
              <option value="meeting">Reunión</option>
              <option value="panel">Panel</option>
              <option value="workshop">Taller</option>
            </Select>
          </Field>

          <Field label="Categoría genérica" name="generic_category">
            <Input name="generic_category" placeholder="Ej: Clínicos, Negocios..." />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Día" name="day">
            <Select name="day">
              <option value="">Sin día</option>
              <option value="2026-07-09">Jueves 9 de julio de 2026</option>
              <option value="2026-07-10">Viernes 10 de julio de 2026</option>
            </Select>
          </Field>

          <Field label="Salón / track" name="track_id">
            <Select name="track_id">
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
            <Input type="time" name="start_time" />
          </Field>

          <Field label="Hora final" name="end_time">
            <Input type="time" name="end_time" />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Área" name="area_id">
            <Select name="area_id">
              <option value="">Sin área</option>
              {(areas ?? []).map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Categoría oficial" name="category_id">
            <Select name="category_id">
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
            <Input name="exclusive_org" placeholder="Ej: ASOSAVIN, ORTOS..." />
          </Field>

          <Field label="Marca patrocinadora" name="sponsor_brand">
            <Input name="sponsor_brand" />
          </Field>
        </FieldRow>

        <label className="flex items-center gap-2 text-sm text-franja-text-primary">
          <input
            type="checkbox"
            name="is_exclusive"
            className="h-4 w-4 rounded border-franja-border bg-franja-bg accent-franja-turquoise"
          />
          Marcar como exclusivo
        </label>

        <div className="flex items-center justify-end gap-2 border-t border-franja-border pt-4">
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
            Crear simposio
          </button>
        </div>
      </form>
    </div>
  );
}

function decodeMessage(raw: string, slug?: string): string {
  if (raw === "name") return "El nombre oficial es obligatorio.";
  if (raw === "slug")
    return "El slug es obligatorio o el nombre no produce uno válido.";
  if (raw === "slug-format")
    return "El slug solo puede contener letras minúsculas, números y guiones.";
  if (raw === "slug-taken")
    return slug
      ? `Ya existe un simposio con el slug "${slug}". Prueba con otro.`
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={props.name}
      {...props}
      className="w-full rounded-md border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
    />
  );
}
