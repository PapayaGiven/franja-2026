import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExhibitorCategory } from "@/lib/types";
import { createExhibitorAction } from "../actions";
import { DeferredLogoPicker } from "./DeferredLogoPicker";

export default async function NewExhibitorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; slug?: string }>;
}) {
  const { error, slug: collidingSlug } = await searchParams;

  const supabase = createAdminClient();

  const { data: categoriesData, error: catErr } = await supabase
    .from("exhibitor_categories")
    .select("id, slug, name, display_order")
    .order("display_order");

  if (catErr) throw catErr;

  const categories = (categoriesData ?? []) as ExhibitorCategory[];

  return (
    <div className="space-y-6">
      <nav className="text-xs">
        <Link
          href="/admin/exhibitors"
          className="inline-flex items-center gap-1 text-franja-text-muted transition hover:text-franja-text-primary"
        >
          <ChevronLeft size={12} />
          Volver a empresas
        </Link>
      </nav>

      <header className="space-y-1">
        <h1 className="text-xl font-medium text-franja-text-primary">
          Nueva empresa
        </h1>
        <p className="text-sm text-franja-text-muted">
          Puedes crear la empresa con sus datos principales y logo.
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
        action={createExhibitorAction}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]"
      >
        <aside className="space-y-3">
          <DeferredLogoPicker />
        </aside>

        <div className="space-y-5">
          <FieldRow>
            <Field label="Nombre" name="name" required>
              <Input name="name" required autoFocus />
            </Field>

            <Field
              label="Slug"
              name="slug"
              hint="kebab-case, sin acentos. Si lo dejas vacío, se deriva del nombre."
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
            <Field label="País" name="country">
              <Input name="country" />
            </Field>

            <Field label="Stand (booth)" name="booth_number">
              <Input name="booth_number" placeholder="Ej: 47, A, 113-116" />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Pabellón" name="pabellon">
              <Input name="pabellon" />
            </Field>

            <Field label="Categoría" name="category_id">
              <Select name="category_id" defaultValue="">
                <option value="">— Sin categoría —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldRow>

          <Field label="Descripción" name="description">
            <Textarea name="description" rows={4} />
          </Field>

          <FieldRow>
            <Field label="Sitio web" name="website">
              <Input type="url" name="website" placeholder="https://" />
            </Field>

            <Field label="WhatsApp" name="whatsapp">
              <Input name="whatsapp" />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Email" name="email">
              <Input type="email" name="email" />
            </Field>

            <Field label="Instagram" name="instagram">
              <Input name="instagram" />
            </Field>
          </FieldRow>

          <div className="flex items-center justify-end gap-2 border-t border-franja-border pt-4">
            <Link
              href="/admin/exhibitors"
              className="rounded-md border border-franja-border px-3 py-2 text-xs text-franja-text-muted transition hover:border-franja-border-strong hover:text-franja-text-primary"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="rounded-md bg-franja-turquoise px-4 py-2 text-xs font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark"
            >
              Crear empresa
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function decodeMessage(raw: string, slug?: string): string {
  if (raw === "name") return "El nombre es obligatorio.";
  if (raw === "slug") {
    return "El slug es obligatorio o el nombre no produce uno válido.";
  }
  if (raw === "slug-format") {
    return "El slug solo puede contener letras minúsculas, números y guiones.";
  }
  if (raw === "slug-taken") {
    return slug
      ? `Ya existe una empresa con el slug "${slug}". Prueba con otro.`
      : "Ese slug ya está en uso.";
  }

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