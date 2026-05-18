import { createClient } from "@/lib/supabase/server";
import type { FaqItem } from "@/lib/types";

/**
 * FAQ — lee la tabla faq y la renderiza como acordeón nativo (<details>),
 * sin JS. Si la tabla queda vacía o la query falla, mostramos un estado
 * "Próximamente".
 */
async function listFaq(): Promise<FaqItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, category, display_order")
    .order("display_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as FaqItem[];
}

export default async function FaqPage() {
  const items = await listFaq();

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Preguntas frecuentes
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Lo que más nos preguntan sobre FRANJA 2026.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-franja-border bg-white/5 p-6 text-sm text-franja-text-muted backdrop-blur-sm">
          Estamos preparando las respuestas. Vuelve en un momento.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((f) => (
            <li
              key={f.id}
              className="rounded-2xl border border-franja-border bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              <details className="group">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-franja-text-primary flex items-center justify-between gap-3">
                  <span>{f.question}</span>
                  <span
                    aria-hidden
                    className="text-franja-text-muted transition-transform group-open:rotate-45 text-lg leading-none"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-franja-text-secondary leading-relaxed whitespace-pre-line">
                  {f.answer}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
