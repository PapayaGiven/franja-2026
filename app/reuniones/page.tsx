import { CalendarDays, Clock, MapPin, UsersRound } from "lucide-react";

const MEETINGS = [
  {
    title: "ASOSAVIN",
    description:
      "Reunión de ASOSAVIN, Asociación Optométrica para la Salud Visual Infantil de Colombia.",
    leader: "Luz Esperanza González, OD. Presidenta.",
    room: "Salón FRANJA OCULAR",
    day: "Jueves 9 de julio",
    time: "12:45 p.m. a 1:45 p.m.",
    type: "Reunión gremial",
  },
  {
    title: "Legislación para consultorios, ópticas y laboratorios",
    description:
      "Espacio profesional orientado a temas de legislación para consultorios, ópticas y laboratorios.",
    leader: "Adela Benítez, OD. Marco Pardo, OD. Jairo Beltrán, OD.",
    room: "Salón TALLERES FRANJA",
    day: "Jueves 9 de julio",
    time: "4:30 p.m. a 5:20 p.m.",
    type: "Espacio profesional",
  },
  {
    title: "Reunión ORTOS",
    description:
      "Organización / Asociación Optométrica Colombiana de Terapia Visual, Ortóptica y Pleóptica.",
    leader: "Liliana Pulgarín, OD. Presidenta.",
    room: "Salón TALLERES FRANJA",
    day: "Jueves 9 de julio",
    time: "5:40 p.m. a 6:40 p.m.",
    type: "Reunión gremial",
  },
  {
    title: "Panel de expertos en lentes de contacto blandos",
    subtitle: "¿Cómo incrementar la adaptación de LCB?",
    description:
      "Expertos en la adaptación de lentes de contacto blandos presentan sus experiencias y casos de éxito como modelo de crecimiento del sector salud visual.",
    leader: "",
    room: "Salón GRUPO FRANJA",
    day: "Viernes 10 de julio",
    time: "12:30 p.m. a 2:00 p.m.",
    type: "Panel de expertos",
  },
  {
    title: "Lanzamiento de libros latinoamericanos",
    description: "Conversatorio con los autores.",
    leader: "",
    room: "Salón TALLERES FRANJA",
    day: "Viernes 10 de julio",
    time: "5:30 p.m. a 6:10 p.m.",
    type: "Conversatorio",
  },
  {
    title: "II Foro Crisis de la Salud Visual en América Latina",
    description:
      "Reunión de líderes gremiales, directores de programas universitarios de Optometría y representantes de organizaciones e instituciones que apoyan el crecimiento del sector y la salud visual de la población.",
    leader: "Organizan: GRUPO FRANJA & ALDOO.",
    room: "Salón FRANJA OCULAR",
    day: "Jueves 9 y viernes 10 de julio",
    time: "6:00 p.m. a 8:00 p.m.",
    type: "Foro",
  },
];

export default function ReunionesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-franja-border bg-white/5 p-5 backdrop-blur-sm">
        <p className="text-sm font-medium text-franja-turquoise">
          FRANJA 2026
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Reuniones gremiales y profesionales
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/65">
          Consulta los espacios de encuentro, conversación y articulación
          profesional que harán parte de la agenda de FRANJA 2026.
        </p>
      </section>

      <section className="space-y-4">
        {MEETINGS.map((meeting) => (
          <article
            key={`${meeting.title}-${meeting.day}-${meeting.time}`}
            className="rounded-3xl border border-franja-border bg-white/5 p-5 backdrop-blur-sm transition hover:border-franja-border-strong hover:bg-white/10"
          >
            <div className="flex flex-col gap-4">
              <div>
                <span className="inline-flex rounded-full border border-franja-turquoise/30 bg-franja-turquoise/10 px-3 py-1 text-xs font-medium text-franja-turquoise">
                  {meeting.type}
                </span>

                <h2 className="mt-3 text-xl font-semibold leading-tight text-white">
                  {meeting.title}
                </h2>

                {meeting.subtitle ? (
                  <p className="mt-1 text-sm font-medium text-franja-gold">
                    {meeting.subtitle}
                  </p>
                ) : null}
              </div>

              <p className="text-sm leading-6 text-white/65">
                {meeting.description}
              </p>

              {meeting.leader ? (
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
                  <UsersRound
                    size={18}
                    className="mt-0.5 shrink-0 text-franja-pink"
                    strokeWidth={1.75}
                  />
                  <p className="text-sm leading-6 text-white/70">
                    <span className="font-semibold text-white">Lidera: </span>
                    {meeting.leader}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <CalendarDays
                    size={18}
                    className="mt-0.5 shrink-0 text-franja-turquoise"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-xs text-white/45">Fecha</p>
                    <p className="text-sm font-medium text-white">
                      {meeting.day}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <Clock
                    size={18}
                    className="mt-0.5 shrink-0 text-franja-gold"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-xs text-white/45">Horario</p>
                    <p className="text-sm font-medium text-white">
                      {meeting.time}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-franja-pink"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-xs text-white/45">Salón</p>
                    <p className="text-sm font-medium text-white">
                      {meeting.room}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}