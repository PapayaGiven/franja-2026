const MAP_PDF_URL =
  "https://franjavirtual.co/Franja2026/Oriana/mapa%20FRANJA%202026.pdf";

export default function MapaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-franja-border bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-sm font-medium text-franja-turquoise">
          FRANJA 2026
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Mapa del evento
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/65">
          Consulta la ubicación de los pabellones, salones y espacios
          principales de FRANJA 2026 en Corferias.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={MAP_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-franja-turquoise px-5 py-3 text-center text-sm font-semibold text-franja-bg transition hover:brightness-110"
          >
            Abrir mapa en pantalla completa
          </a>

          <a
            href={MAP_PDF_URL}
            download
            className="rounded-2xl border border-franja-border bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Descargar mapa
          </a>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-franja-border bg-white/5">
        <div className="border-b border-franja-border px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            Previsualización del mapa
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Puedes ampliar, mover o abrir el PDF en una pestaña nueva si lo
            necesitas.
          </p>
        </div>

        <div className="h-[72vh] min-h-[520px] bg-white">
          <iframe
            src={MAP_PDF_URL}
            title="Mapa FRANJA 2026"
            className="h-full w-full"
          />
        </div>
      </section>
    </div>
  );
}