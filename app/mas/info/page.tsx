/**
 * Información General — sección canónica del evento. Las cifras
 * vienen del content drop 0003 (26 simposios · 89 empresas).
 */
export default function InfoPage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-franja-text-primary">
          Información General
        </h1>
        <p className="mt-1 text-sm text-franja-text-muted">
          Todo lo que necesitas saber sobre FRANJA 2026.
        </p>
      </header>

      <Block title="Evento">
        <p>
          FRANJA 2026 es el congreso más importante de Latinoamérica para la
          comunidad de la salud visual: optometría, oftalmología, industria
          óptica, retail y formación profesional. Una semana de academia,
          negocios, networking y tendencias bajo un mismo techo.
        </p>
      </Block>

      <Block title="Fechas">
        <p>Jueves 9 y viernes 10 de julio de 2026.</p>
      </Block>

      <Block title="Lugar">
        <p>Corferias · Bogotá, Colombia.</p>
      </Block>

      <Block title="Horarios">
        <p>
          Jueves y viernes de 8:00 a.m. a 7:00 p.m. La franja académica
          principal corre entre 8:30 a.m. y 6:00 p.m.; el Salón de Negocios
          permanece abierto durante todo el día.
        </p>
      </Block>

      <Block title="Espacios">
        <p>
          Cuatro pistas paralelas (Franja Ocular, Franja Visual, Grupo Franja
          y Talleres Franja), Salón de Negocios con stands de las marcas y
          fabricantes, zonas de descanso y áreas de networking informal.
        </p>
      </Block>

      <Block title="Magnitud">
        <ul className="list-disc pl-5 space-y-1">
          <li>26 simposios académicos</li>
          <li>15 talleres especializados (algunos por confirmar)</li>
          <li>130+ conferencistas de Latinoamérica, Europa y Estados Unidos</li>
          <li>89 empresas expositoras en el Salón de Negocios</li>
        </ul>
      </Block>

      <Block title="Para quién es">
        <p>
          Optómetras, oftalmólogos, ópticos, técnicos de laboratorio,
          gerentes de óptica, distribuidores, docentes universitarios y
          estudiantes de optometría de toda Latinoamérica.
        </p>
      </Block>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-franja-text-muted">
        {title}
      </h2>
      <div className="text-sm text-franja-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}
