import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Exhibitor, ExhibitorCategory } from "@/lib/types";
import { LogoUploader } from "./LogoUploader";
import { updateExhibitorAction } from "./actions";

const SELECT = `
  id, slug, name, logo_url, country, booth_number, "pabellón",
  category_id, description, website, whatsapp, email, instagram,
  is_sponsor, sponsor_tier, map_x, map_y, created_at, updated_at
`;

const SPONSOR_TIERS = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
] as const;

export default async function ExhibitorEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    saved?: string;
    created?: string;
    error?: string;
    logoError?: string;
  }>;
}) {
  const { slug } = await params;
  const { saved, created, error, logoError } = await searchParams;

  const supabase = createAdminClient();

  const [{ data, error: fetchErr }, categoriesRes] = await Promise.all([
    supabase.from("exhibitors").select(SELECT).eq("slug", slug).maybeSingle(),
    supabase
      .from("exhibitor_categories")
      .select("id, slug, name, display_order")
      .order("display_order"),
  ]);
  if (fetchErr) throw fetchErr;
  if (!data) notFound();
  if (categoriesRes.error) throw categoriesRes.error;

  const exhibitor = data as Exhibitor;
  const categories = (categoriesRes.data ?? []) as ExhibitorCategory[];

  const action = updateExhibitorAction.bind(null, slug);

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
          {exhibitor.name}
        </h1>
        <p className="text-xs text-franja-text-muted">slug: {exhibitor.slug}</p>
      </header>

      {created === "1" && !logoError && (
        <Toast tone="success" message="Empresa creada. Verifica los datos abajo." />
      )}
      {created === "1" && logoError && (
        <Toast
          tone="error"
          message={`Empresa creada pero falló la subida del logo: ${decodeURIComponent(logoError)}. Probá de nuevo desde el cuadro de logo.`}
        />
      )}
      {saved === "1" && <Toast tone="success" message="Cambios guardados." />}
      {error && <Toast tone="error" message={decodeMessage(error)} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <LogoUploader
            slug={exhibitor.slug}
            initialUrl={exhibitor.logo_url}
            name={exhibitor.name}
          />
        </aside>

        <form action={action} className="space-y-5">
          <FieldRow>
            <Field label="Nombre" name="name" required>
              <Input name="name" defaultValue={exhibitor.name} required />
            </Field>
            <Field label="País" name="country">
              <Input name="country" defaultValue={exhibitor.country ?? ""} />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Stand (booth)" name="booth_number">
              <Input
                name="booth_number"
                defaultValue={exhibitor.booth_number ?? ""}
                placeholder="Ej: 47, A, 113-116"
              />
            </Field>
            <Field label="Pabellón" name="pabellon">
              <Input
                name="pabellon"
                defaultValue={exhibitor.pabellón ?? ""}
              />
            </Field>
          </FieldRow>

          <Field label="Categoría" name="category_id">
            <Select name="category_id" defaultValue={exhibitor.category_id ?? ""}>
              <option value="">— Sin categoría —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Descripción" name="description">
            <Textarea
              name="description"
              defaultValue={exhibitor.description ?? ""}
              rows={4}
            />
          </Field>

          <FieldRow>
            <Field label="Sitio web" name="website">
              <Input
                type="url"
                name="website"
                defaultValue={exhibitor.website ?? ""}
                placeholder="https://"
              />
            </Field>
            <Field label="WhatsApp" name="whatsapp" hint="Formato internacional: +57 300…">
              <Input name="whatsapp" defaultValue={exhibitor.whatsapp ?? ""} />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Email" name="email">
              <Input
                type="email"
                name="email"
                defaultValue={exhibitor.email ?? ""}
              />
            </Field>
            <Field label="Instagram" name="instagram" hint="@usuario o URL">
              <Input name="instagram" defaultValue={exhibitor.instagram ?? ""} />
            </Field>
          </FieldRow>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-franja-text-primary">
              <input
                type="checkbox"
                name="is_sponsor"
                defaultChecked={exhibitor.is_sponsor}
                className="h-4 w-4 rounded border-franja-border bg-franja-bg accent-franja-turquoise"
              />
              Es patrocinador
            </label>

            <Field label="Sponsor tier" name="sponsor_tier">
              <Select
                name="sponsor_tier"
                defaultValue={exhibitor.sponsor_tier ?? ""}
              >
                <option value="">— Ninguno —</option>
                {SPONSOR_TIERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

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
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function decodeMessage(raw: string): string {
  if (raw === "name") return "El nombre es obligatorio.";
  if (raw === "tier")
    return "Sponsor tier debe ser platinum, gold o silver (o vacío).";
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

function Toast({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  const styles =
    tone === "success"
      ? "border-franja-turquoise/40 bg-franja-turquoise/10 text-franja-turquoise"
      : "border-franja-pink/40 bg-franja-pink/10 text-franja-pink";
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${styles}`}
    >
      <Icon size={14} />
      {message}
    </div>
  );
}
