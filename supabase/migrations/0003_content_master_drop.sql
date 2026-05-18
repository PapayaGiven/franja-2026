-- =============================================================
-- FRANJA 2026 — CONTENT MIGRATION 0003
-- Master content drop (May 18, 2026)
--
-- Incluye:
--   A) Nueva tabla: simposio_categories (Clínicos / Negocios /
--      Técnicos / Académicos) — categorías oficiales
--   B) Nueva tabla: simposium_brands — marcas/fabricantes como
--      entidad decorativa (logos no clickeables)
--   C) +50 conferencistas nuevos con país y credenciales
--   D) 26 simposios completos con resumen, ponencias, ponentes
--   E) 89 empresas expositoras con stand
--   F) Limpieza: quita Networking del scope
--
-- Safe to re-run (todo es idempotente).
-- =============================================================

-- ---------------------------------------------------------------
-- A) CATEGORÍAS OFICIALES DE SIMPOSIOS
-- ---------------------------------------------------------------

create table if not exists simposio_categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  description text,
  color       text,
  display_order int default 0,
  created_at  timestamptz default now()
);

alter table simposio_categories enable row level security;
do $$ begin
  create policy "public read" on simposio_categories for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authed all" on simposio_categories for all using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

insert into simposio_categories (slug, name, description, color, display_order) values
  ('clinicos',  'Clínicos',
   'Simposios académicos enfocados en clínica, diagnóstico y tratamiento visual',
   '#3DCDD0', 1),
  ('negocios',  'Negocios y Crecimiento Económico',
   'Marketing, ventas, distribución, imagen, retail y comercio óptico',
   '#7B3FA6', 2),
  ('tecnicos',  'Técnicos e Industriales',
   'Laboratorios ópticos, lentes oftálmicos y anteojería',
   '#E85DA6', 3),
  ('academicos','Académicos y Formación Profesional',
   'Educadores y estudiantes de optometría',
   '#F0C75E', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color,
  display_order = excluded.display_order;

-- Add category column on symposiums table
alter table symposiums add column if not exists category_id uuid references simposio_categories(id) on delete set null;
create index if not exists idx_symposiums_category on symposiums(category_id);

-- ---------------------------------------------------------------
-- B) FABRICANTES / MARCAS PARTICIPANTES (logos decorativos)
-- ---------------------------------------------------------------

create table if not exists symposium_brands (
  id            uuid primary key default uuid_generate_v4(),
  symposium_id  uuid references symposiums(id) on delete cascade,
  brand_name    text not null,
  brand_slug    text not null,
  logo_url      text,
  display_order int default 0,
  created_at    timestamptz default now(),
  unique (symposium_id, brand_slug)
);

alter table symposium_brands enable row level security;
do $$ begin
  create policy "public read" on symposium_brands for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authed all" on symposium_brands for all using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------
-- C) CONFERENCISTAS — añadir los faltantes (50+)
-- ---------------------------------------------------------------

insert into speakers (slug, full_name, credentials, country, country_code, specialty, is_featured) values
  -- NUEVOS DE LOS DOCUMENTOS DEFINITIVOS
  ('adriana-escobar',        'Adriana Escobar',         'Ing. Coach',                                        'Colombia',           'CO', 'Coaching educativo', false),
  ('alberto-chacon',         'Alberto Chacón',          'MD. Oftalmólogo corneólogo',                        'Colombia',           'CO', 'Córnea',            false),
  ('alejandro-leon',         'Alejandro León',          'OD. MSc. PhD.',                                     'Colombia',           'CO', 'Presbicia',         true),
  ('alejandro-parada',       'Alejandro Parada',        'Comunicador',                                       'Colombia',           'CO', 'Imagen y comunicación', false),
  ('alejandro-tapia',        'Alejandro Tapia',         'OD. Esp.',                                          'Colombia',           'CO', 'Lentes de contacto', false),
  ('alejandro-valencia',     'Alejandro Valencia',      'Estudiante de Optometría',                          'Colombia',           'CO', 'Optometría',        false),
  ('andrea-bressani',        'Andrea Bressani',         'Adm.',                                              'Italia',             'IT', 'Industria óptica',  false),
  ('andres-rosas',           'Andrés Rosas',            'MD. Oftalmólogo',                                   'Colombia',           'CO', 'Córnea y cristalino', false),
  ('carol-pinzon',           'Carol Pinzón',            'OD.',                                               'Colombia',           'CO', 'Lentes de contacto blandos', true),
  ('christian-garcia',       'Christian García',        'LO.',                                               'México',             'MX', 'Optometría pediátrica', false),
  ('christian-hendricks',    'Christian Hendricks',     'Vicepresidente de Operaciones Eyemart',             'Estados Unidos',     'US', 'Gestión laboratorio', true),
  ('claudia-ramos',          'Claudia Alejandra Ramos', 'OD.',                                               'Colombia',           'CO', 'Lentes oftálmicos', false),
  ('david-pineros',          'David Piñeros',           'OD. PhD.',                                          'España',             'ES', 'Terapia visual',    true),
  ('diana-restrepo',         'Diana Restrepo Bernal',   'MD. Psiquiatra',                                    'Colombia',           'CO', 'Psiquiatría',       false),
  ('diancy-capella',         'Diancy Capella',          'OD. Esp.',                                          'Colombia',           'CO', 'Lentes de contacto', false),
  ('elena-salobrar',         'Elena Salobrar García',   'OD. PhD. MsC.',                                     'España',             'ES', 'Investigación retinal', true),
  ('elias-rojo',             'Elías Rojo',              'Gerente General Salud Digna',                       'México',             'MX', 'Gestión laboratorio óptico', true),
  ('erickson-graham',        'Erickson Graham',         'OD. MSVS. PhD.',                                    'Estados Unidos',     'US', 'Terapia visual deportiva', true),
  ('essilorluxottica',       'EssilorLuxottica',        'Fabricante',                                        'Internacional',      'XX', 'Lentes oftálmicos', false),
  ('george-hammersley',      'George Hammersley',       'OD. Esp. Baja Visión',                              'Chile',              'CL', 'Baja visión',       false),
  ('henry-cantor',           'Henry Cantor',            'MD. Oftalmólogo',                                   'Colombia',           'CO', 'Superficie ocular', false),
  ('hoya',                   'Hoya',                    'Fabricante',                                        'Internacional',      'XX', 'Lentes oftálmicos', false),
  ('ivan-felipe-suarez',     'Iván Felipe Suárez',      'MD. Oftalmólogo',                                   'Colombia',           'CO', 'Córnea y catarata', false),
  ('javier-chaves',          'Javier Chaves',           'MD. Oftalmólogo',                                   'Colombia',           'CO', 'Segmento anterior', false),
  ('javier-flores',          'Javier Flórez',           'OD.',                                               'Colombia',           'CO', 'Laboratorio óptico', false),
  ('javier-jimenez',         'Javier Jiménez',          'Ing. Mag. Esp.',                                    'Colombia',           'CO', 'Distribución',      false),
  ('javier-oviedo',          'Javier Oviedo',           'OD.',                                               'Colombia',           'CO', 'Lentes de contacto blandos', true),
  ('jaume-paune',            'Jaume Pauné',             'OD. Mag. PhD.',                                     'España',             'ES', 'Miopía y ortoqueratología', true),
  ('jenny-sanchez',          'Jenny Maritza Sánchez Espinoza','OD. Esp. Mag.',                               'Colombia',           'CO', 'Baja visión pediátrica', false),
  ('jeobany-garces',         'Jeobany Garces',          'Vicepresidente Versant Health',                     'Estados Unidos',     'US', 'Seguros ópticos',   true),
  ('jorge-leonardo-martinez','Jorge Leonardo Martínez', 'Mag. Psicólogo',                                    'Colombia',           'CO', 'Psicología',        false),
  ('jorge-vargas',           'Jorge Vargas',            'OD.',                                               'Colombia',           'CO', 'Lentes de contacto blandos', false),
  ('josely-fu',              'Josely Fu Barrios',       null,                                                'Panamá',             'PA', 'Visajismo y colorimetría', false),
  ('juan-alberto-patino',    'Juan Alberto Patiño',     'Administrador y Desarrollador de Negocios',         'Colombia',           'CO', 'Distribución',      false),
  ('juan-carlos-dpabloz',    'Juan Carlos D´Pabloz',    'Administrador',                                     'Colombia',           'CO', 'Distribución',      false),
  ('juan-guillermo-sanchez', 'Juan Guillermo Sánchez',  null,                                                'Colombia',           'CO', 'Marketing',         false),
  ('juan-pablo-aparicio',    'Juan Pablo Aparicio',     'MD.',                                               'Colombia',           'CO', 'Cirugía refractiva', false),
  ('juan-silva',             'Juan Silva',              'Ing. experto en IA',                                'Colombia',           'CO', 'Inteligencia artificial', false),
  ('karen-carrasquillo',     'Karen Carrasquillo',      'OD. PhD. FAAO. FSLS. FBCLA.',                       'Estados Unidos',     'US', 'Lentes de contacto especializados', true),
  ('kathy-weise',            'Kathy Weise',             'OD. MBA. PhD. FAAO.',                               'Estados Unidos',     'US', 'Pediatría y miopía', true),
  ('klaus-trier',            'Klaus Trier',             'MD. Oftalmólogo retinólogo',                        'Dinamarca',          'DK', 'Retina y miopía',   true),
  ('luis-velasco',           'Luis Alberto de Velasco Mingramm','LO. Lic. Mgtr. Esp.',                        'México',             'MX', 'Neurovisión',       true),
  ('marcela-frazier',        'Marcela Frazier',         'OD. MPH. FAAO.',                                    'Estados Unidos',     'US', 'Pediatría',         true),
  ('patricia-florez',        'Patricia Flórez',         'OD. PhD.',                                          'Chile',              'CL', 'Queratocono',       false),
  ('rafael-vanegas',         'Rafael Vanegas',          'OD.',                                               'Colombia',           'CO', 'Cirugía refractiva', false),
  ('rodenstock',             'Rodenstock',              'Fabricante',                                        'Internacional',      'XX', 'Lentes oftálmicos', false),
  ('rodrigo-neira',          'Rodrigo Neira',           'TOC.',                                              'Argentina',          'AR', 'Moda óptica',       false),
  ('tomaz-carvalho',         'Tomaz Carvalho',          'Ingeniero',                                         'Brasil',             'BR', 'Industria laboratorio', false),
  ('william-malagon',        'William Malagón',         'OD.',                                               'Colombia',           'CO', 'Cirugía refractiva', false),
  ('younger',                'Younger',                 'Fabricante',                                        'Internacional',      'XX', 'Lentes oftálmicos', false),
  ('zeiss',                  'Zeiss',                   'Fabricante',                                        'Internacional',      'XX', 'Lentes oftálmicos', false)
on conflict (slug) do update set
  full_name = excluded.full_name,
  credentials = excluded.credentials,
  country = excluded.country,
  country_code = excluded.country_code,
  specialty = excluded.specialty,
  is_featured = excluded.is_featured,
  updated_at = now();

-- Updates a speakers existentes con país/especialidad correctos
update speakers set country = 'Perú',         country_code = 'PE' where slug = 'ana-alpiste';
update speakers set country = 'Costa Rica',   country_code = 'CR' where slug = 'allan-mora';
update speakers set country = 'Costa Rica',   country_code = 'CR' where slug = 'javier-prada';
update speakers set country = 'Honduras',     country_code = 'HN' where slug = 'julio-jinesta';
update speakers set country = 'Ecuador',      country_code = 'EC' where slug = 'carolina-arroba';
update speakers set country = 'España',       country_code = 'ES', is_featured = true where slug = 'ana-llorca';

-- ---------------------------------------------------------------
-- D) ACTUALIZAR/AÑADIR LOS 26 SIMPOSIOS OFICIALES
-- ---------------------------------------------------------------

-- D.1 — Asignar categoría a los simposios existentes
-- Clínicos (14)
update symposiums set category_id = (select id from simposio_categories where slug = 'clinicos')
  where slug in ('eco-plateada','ultrasonido-ia','tendencias-evaluacion','cornea-cristalino',
                 'vision-activa','vision-infantil','manejo-miopia','baja-vision',
                 'superficie-360','neurovision','salud-mental-visual','presbicia-correccion',
                 'todo-lc');

-- Negocios (7)
update symposiums set category_id = (select id from simposio_categories where slug = 'negocios')
  where slug in ('vitrinas-seductoras','vender-mas','ia-negocio','marketing-consumidor',
                 'distribuidores','imagen-personal','moda-rostro');

-- Técnicos (3)
update symposiums set category_id = (select id from simposio_categories where slug = 'tecnicos')
  where slug in ('lab-opticos-13','prescripcion-montura','adaptacion-lentes');

-- Académicos (2)
update symposiums set category_id = (select id from simposio_categories where slug = 'academicos')
  where slug in ('salud-docente','estudiantes-jue');

-- D.2 — Refinar nombres oficiales, subtítulos y resúmenes

update symposiums set
  official_name = 'Adulto Mayor: Salud y Economía Plateada',
  subtitle = null,
  description = 'Este simposio aborda de manera integral el envejecimiento poblacional y las grandes oportunidades de la economía plateada dentro de la salud visual contemporánea. El programa analiza las principales alteraciones visuales asociadas al adulto mayor, incluyendo ojo seco, degeneración macular relacionada con la edad (DMRE), estrabismo y manifestaciones visuales relacionadas con enfermedades neurodegenerativas como Alzheimer y Parkinson. Además, se estudian los impactos de los estilos de vida modernos, el uso de pantallas y medicamentos en la funcionalidad visual de esta población. Paralelamente, el simposio presenta una visión estratégica sobre la economía plateada como uno de los mercados de mayor crecimiento para la optometría y la industria visual en América Latina y el mundo.',
  updated_at = now()
where slug = 'eco-plateada';

update symposiums set
  official_name = 'Exámenes Especiales en Optometría',
  subtitle = 'Los hallazgos que cambian la decisión clínica',
  description = 'Un encuentro académico de vanguardia enfocado en la precisión diagnóstica y los hallazgos clínicos que pueden transformar completamente la toma de decisiones en optometría moderna. El programa aborda herramientas y metodologías avanzadas como el ultrasonido ocular, la nueva campimetría basada en realidad virtual, software e inteligencia artificial, así como la correlación entre estructuras corneales y nuevas tecnologías diagnósticas. Además, el simposio profundiza en la neuroimagen retiniana aplicada a enfermedades neurodegenerativas y en el análisis histológico y tomográfico de la retina en pacientes miopes, fortaleciendo la capacidad del profesional para detectar alteraciones complejas con mayor precisión y oportunidad clínica.',
  updated_at = now()
where slug = 'ultrasonido-ia';

update symposiums set
  official_name = 'Cirugía Refractiva',
  subtitle = 'Casos quirúrgicos de córnea y cristalino',
  description = 'Este simposio reúne especialistas en cirugía refractiva y optometría para analizar los criterios clínicos y tecnológicos que intervienen en la toma de decisiones quirúrgicas modernas sobre córnea y cristalino. El programa aborda la selección adecuada del paciente desde la consulta primaria, la elección entre procedimientos corneales o intraoculares y las nuevas posibilidades para corregir simultáneamente defectos refractivos y aberraciones ópticas de alto desempeño visual. Asimismo, se profundiza en el debate entre lentes EDOF y multifocales, resaltando la importancia de la interacción clínica entre cirujano y optómetra para optimizar resultados, expectativas y satisfacción visual de los pacientes.',
  updated_at = now()
where slug = 'cornea-cristalino';

update symposiums set
  official_name = 'Terapia y Entrenamiento Visual',
  subtitle = 'Visión activa: estilos de vida y entrenamiento visual',
  description = 'Este simposio presenta una visión moderna e interdisciplinaria de la terapia y el entrenamiento visual aplicada a los estilos de vida contemporáneos, el rendimiento cognitivo y el desempeño deportivo. El programa aborda evidencia científica relacionada con el uso de terapia visual en enfermedades neurodegenerativas, entrenamiento especializado para diferentes disciplinas deportivas y estrategias clínicas para el manejo de alteraciones visuales posteriores a conmociones cerebrales. Asimismo, se exploran nuevas metodologías basadas en gamificación científica, nutrición orientada al rendimiento visual y procesos cognitivos asociados a la lectura. Finalmente, el simposio analiza el futuro de la terapia visual, sus oportunidades de crecimiento profesional y las estrategias de posicionamiento y marketing dentro de la comunidad salud visual.',
  updated_at = now()
where slug = 'vision-activa';

update symposiums set
  official_name = 'Optometría Pediátrica',
  subtitle = 'Visión infantil: estilos de vida y decisiones clínicas',
  description = 'Este simposio aborda los principales desafíos clínicos y funcionales de la optometría pediátrica moderna, integrando aspectos epidemiológicos, quirúrgicos, refractivos y del desarrollo visual infantil. El programa analiza la realidad actual de la salud visual pediátrica en Latinoamérica, así como criterios basados en evidencia científica para el manejo del estrabismo y la toma de decisiones clínicas en pacientes infantiles. Además, se profundiza en la relación entre visión binocular y aprendizaje visual, fortaleciendo la comprensión del impacto del sistema visual en el desarrollo académico y cognitivo de los niños. Finalmente, se presentan herramientas prácticas y tips clínicos aplicables al manejo diario del paciente pediátrico dentro de la consulta optométrica contemporánea.',
  updated_at = now()
where slug = 'vision-infantil';

update symposiums set
  official_name = 'Manejo Clínico de la Miopía',
  subtitle = 'De la consulta a la vida diaria',
  description = 'Uno de los simposios más relevantes de FRANJA 2026 frente al crecimiento global de la miopía y sus implicaciones clínicas, sociales y económicas. El programa aborda las principales patologías asociadas al paciente miope y presenta las estrategias contemporáneas más avanzadas para el control del crecimiento ocular. Se analizan tratamientos farmacológicos como la 7 Metilxantina, tecnologías ópticas basadas en OrtoK y zonas ópticas especializadas, así como nuevas alternativas terapéuticas relacionadas con luz roja, lentes multifocales blandos y evolución de la atropina. Finalmente, el simposio integra criterios clínicos basados en evidencia científica para ayudar al profesional a seleccionar el manejo más adecuado según las características y necesidades de cada paciente miope.',
  updated_at = now()
where slug = 'manejo-miopia';

update symposiums set
  official_name = 'Baja Visión',
  subtitle = 'Riesgo, prevención y rehabilitación',
  description = 'Este simposio presenta una visión integral y contemporánea de la baja visión desde la prevención, el diagnóstico temprano y los procesos modernos de rehabilitación visual. El programa analiza factores de riesgo relacionados con el estilo de vida, el envejecimiento fisiológico del sistema visual y las enfermedades crónicas que afectan la funcionalidad ocular y la calidad de vida de la población. Asimismo, aborda estrategias clínicas especializadas para pacientes pediátricos y adultos mayores, incluyendo nuevas alternativas de rehabilitación perceptual y adaptación visual en el siglo XXI. La sesión concluye con el análisis de casos clínicos y discusión académica aplicada a la práctica diaria de la consulta especializada.',
  updated_at = now()
where slug = 'baja-vision';

update symposiums set
  official_name = 'Superficie Ocular',
  subtitle = 'Análisis y tratamiento 360°',
  description = 'Este simposio desarrolla una visión integral y multidisciplinaria de la superficie ocular moderna, conectando el estilo de vida contemporáneo con los nuevos desafíos diagnósticos y terapéuticos del ojo seco y otras alteraciones de la superficie ocular. El programa introduce innovaciones clínicas de alto impacto, incluyendo biomarcadores oculares, inteligencia artificial aplicada al análisis lagrimal y nuevas tecnologías de liberación farmacológica mediante lentes de contacto terapéuticos. Asimismo, se presentan estrategias de manejo clínico que abarcan desde tratamientos convencionales hasta intervenciones quirúrgicas avanzadas, permitiendo a los asistentes comprender el abordaje 360° de una de las áreas de mayor crecimiento e investigación en la salud visual contemporánea.',
  updated_at = now()
where slug = 'superficie-360';

update symposiums set
  official_name = 'Neurovisión',
  subtitle = 'Estrategias prácticas para comprender el cerebro',
  description = 'Este simposio introduce una visión moderna e integradora de la neurovisión aplicada a la práctica clínica contemporánea. A través de un enfoque orientado al funcionamiento cerebral y no únicamente a la estructura ocular, los conferencistas analizan cómo se desarrolla, procesa y altera la visión dentro del cerebro humano y cómo estos procesos impactan directamente el rendimiento visual, cognitivo y funcional de los pacientes. El programa profundiza en la identificación de hallazgos clínicos frecuentemente subestimados, la toma de decisiones terapéuticas orientadas al desempeño visual y la importancia de comprender la relación entre percepción, procesamiento cerebral y calidad de vida. La sesión concluye con el análisis de casos reales y estrategias clínicas aplicables al ejercicio diario de la optometría y la rehabilitación visual.',
  updated_at = now()
where slug = 'neurovision';

update symposiums set
  official_name = 'Optometría y Salud Mental',
  subtitle = 'Estado emocional y salud visual',
  description = 'Un simposio pionero que aborda la relación entre salud visual, bienestar emocional y salud mental dentro de la comunidad de la salud visual. El programa analiza cómo diferentes síntomas visuales pueden influir en estados de ansiedad, estrés, agotamiento emocional y depresión, afectando tanto la calidad de vida de los pacientes como el desempeño de los profesionales del sector. Asimismo, se presentan resultados de uno de los primeros ejercicios investigativos orientados a comprender el estado emocional de la comunidad salud visual mediante herramientas de análisis y encuestas especializadas. Este espacio busca generar conciencia sobre la importancia de integrar la salud mental dentro de los procesos de atención, educación y bienestar profesional en la optometría contemporánea.',
  updated_at = now()
where slug = 'salud-mental-visual';

update symposiums set
  official_name = 'Manejo Clínico de la Presbicia',
  subtitle = 'Alternativas actuales de corrección',
  description = 'Este simposio presenta una actualización integral sobre las principales alternativas contemporáneas para el manejo clínico de la presbicia, una de las condiciones visuales de mayor impacto en la población adulta. A través de diferentes enfoques clínicos y terapéuticos, los conferencistas analizan soluciones ópticas, farmacológicas y quirúrgicas orientadas a mejorar la calidad visual y funcional de los pacientes présbitas. El programa incluye el uso de lentes intraoculares EDOF, aplicaciones de ortoqueratología, lentes de contacto blandos multifocales, nuevas estrategias farmacológicas y procedimientos quirúrgicos modernos. Una sesión académica diseñada para fortalecer la toma de decisiones clínicas y ampliar las opciones de corrección disponibles en la práctica visual actual.',
  updated_at = now()
where slug = 'presbicia-correccion';

update symposiums set
  official_name = 'Simposio de Lentes de Contacto',
  subtitle = 'La importancia del "todo" para llegar a la adaptación exitosa de LC',
  description = 'Este simposio desarrolla una visión integral sobre los múltiples factores clínicos y funcionales que intervienen en el éxito de la adaptación de lentes de contacto en pacientes con diferentes necesidades visuales y condiciones oculares. El programa enfatiza la importancia de comprender "el todo" del paciente, integrando variables refractivas, topográficas, fisiológicas y de superficie ocular para lograr adaptaciones más precisas, cómodas y sostenibles. A través de casos clínicos y experiencias especializadas, se abordan desafíos contemporáneos como el astigmatismo, la presbicia, el queratocono, los pacientes post-trasplante y el manejo del ojo seco, fortaleciendo la capacidad clínica del profesional para tomar decisiones más acertadas y mejorar significativamente la calidad visual y la experiencia del usuario de lentes de contacto.',
  updated_at = now()
where slug = 'todo-lc';

-- Negocios
update symposiums set
  official_name = 'Vitrinas Seductoras de Ópticas',
  subtitle = 'Estudio de casos de éxito',
  description = 'Un simposio especializado en la transformación de las ópticas en espacios comerciales altamente emocionales, atractivos y estratégicos para la experiencia del consumidor moderno. A través de estudios de casos reales y conceptos de merchandising visual, el programa analiza cómo las vitrinas, el diseño de espacios y la ambientación pueden influir directamente en las decisiones de compra y en la percepción de valor de las marcas. Además, se exploran propuestas orientadas a segmentos específicos como niños y deportistas, así como estrategias para optimizar los entornos físicos de las ópticas, fortalecer la identidad visual y aumentar las oportunidades de facturación mediante experiencias sensoriales y comerciales más efectivas.',
  updated_at = now()
where slug = 'vitrinas-seductoras';

update symposiums set
  official_name = 'Estrategias para Vender Más',
  subtitle = null,
  description = 'Un programa dinámico y estratégico enfocado en fortalecer las ventas y el crecimiento sostenible de las ópticas modernas mediante herramientas de psicología del consumidor, servicio y comunicación comercial. El simposio desarrolla metodologías para reactivar clientes antiguos, atraer nuevos consumidores a partir de bases de datos existentes y construir relaciones comerciales más sólidas mediante confianza y experiencia de servicio. Además, se presentan campañas exitosas aplicadas al sector óptico y estrategias orientadas a transformar la consulta visual en un espacio generador de fidelización, posicionamiento y mayores oportunidades de venta.',
  updated_at = now()
where slug = 'vender-mas';

update symposiums set
  official_name = 'Propietarios de Óptica',
  subtitle = 'Inteligencia Artificial para mejorar tu negocio',
  description = 'Un espacio innovador diseñado para propietarios y líderes de ópticas interesados en comprender cómo la inteligencia artificial está transformando la gestión empresarial, las ventas y la experiencia del cliente en el sector salud visual. El programa introduce conceptos estratégicos de IA aplicados a conversión comercial, automatización y optimización de procesos de servicio. Además, incluye demostraciones prácticas sobre asistentes inteligentes orientados a ventas, comunicación y atención al cliente, mostrando cómo las ópticas pueden utilizar herramientas tecnológicas modernas para aumentar productividad, eficiencia y competitividad en un mercado cada vez más digital.',
  updated_at = now()
where slug = 'ia-negocio';

update symposiums set
  official_name = 'Marketing en Salud Visual',
  subtitle = 'Estrategias para el nuevo consumidor',
  description = 'Este simposio explora las profundas transformaciones del consumidor moderno y su impacto directo en las estrategias comerciales, de servicio y posicionamiento de las ópticas y empresas de salud visual. A partir del análisis de los nuevos hábitos de compra, las experiencias emocionales de consumo y la evolución digital de los mercados, los conferencistas presentan herramientas prácticas para comprender al nuevo usuario y construir relaciones más sólidas, humanas y sostenibles. Además, se desarrollan estrategias enfocadas en el crecimiento empresarial ético y rentable, integrando experiencia de cliente, mercadeo contemporáneo y responsabilidad empresarial como pilares fundamentales para competir en los nuevos escenarios comerciales.',
  updated_at = now()
where slug = 'marketing-consumidor';

update symposiums set
  official_name = 'IV Simposio de Distribuidores',
  subtitle = 'De la Comunidad Salud Visual',
  description = 'Este simposio estratégico está diseñado para distribuidores y líderes empresariales de la comunidad salud visual que buscan adaptarse a los profundos cambios comerciales, tecnológicos y culturales que transforman actualmente la industria. A través de un enfoque práctico y gerencial, los conferencistas abordan la necesidad de realizar diagnósticos honestos sobre la realidad empresarial, fortalecer equipos de alto desempeño orientados a resultados y replantear los modelos tradicionales de comercialización frente a los nuevos hábitos del consumidor y la evolución del mercado. Además, el programa proyecta los grandes desafíos y oportunidades hacia el año 2030, preparando a los asistentes para desarrollar empresas más innovadoras, sostenibles y competitivas dentro de un entorno global en constante transformación.',
  updated_at = now()
where slug = 'distribuidores';

update symposiums set
  official_name = 'Imagen Personal',
  subtitle = 'La experiencia que vende: secretos de imagen y comunicación para ópticas exitosas',
  description = 'Un simposio innovador que conecta la imagen personal, la comunicación y la experiencia del cliente como herramientas estratégicas para fortalecer el posicionamiento y las ventas en las ópticas modernas. A través de un enfoque humano y práctico, el programa analiza cómo la percepción personal, el lenguaje visual y la comunicación impactan la confianza, la credibilidad y la relación comercial con los pacientes y consumidores. Los asistentes aprenderán conceptos aplicables sobre primera impresión, manejo inteligente del color en el entorno corporativo, construcción de imagen desde el amor propio y optimización del estilo personal como parte de la identidad profesional. Una propuesta orientada a transformar la experiencia de servicio y elevar el valor emocional de las ópticas exitosas.',
  updated_at = now()
where slug = 'imagen-personal';

update symposiums set
  official_name = 'La Moda del Rostro',
  subtitle = 'Cosméticos, accesorios y anteojos',
  description = 'Este simposio analiza cómo la moda, la estética facial y los anteojos se han convertido en una poderosa herramienta de expresión personal y construcción de identidad en la sociedad contemporánea. El programa conecta conceptos de visajismo, colorimetría, accesorios y tendencias de estilo de vida con las nuevas dinámicas de consumo en óptica, donde el usuario busca no solo mejorar su visión, sino también proyectar imagen, personalidad y bienestar. A través de diferentes perspectivas comerciales y estéticas, los asistentes comprenderán cómo transformar la experiencia de venta tradicional en una experiencia emocional y aspiracional, identificando nuevas oportunidades de crecimiento a partir de la moda del rostro y la evolución cultural del consumidor moderno.',
  updated_at = now()
where slug = 'moda-rostro';

-- Técnicos
update symposiums set
  official_name = 'XIII Simposio de Laboratorios Ópticos',
  subtitle = 'Laboratorio óptico: epicentro de la evolución industrial',
  description = 'Uno de los encuentros más especializados y estratégicos para la industria de laboratorios ópticos de América Latina. Este simposio reúne expertos internacionales para analizar las nuevas dinámicas tecnológicas, comerciales y productivas que están transformando la fabricación y evolución de los lentes oftálmicos. El programa aborda temas de alto impacto como neurología óptica, calidad visual de alta resolución, análisis de superficies oftálmicas, tecnologías de antirreflejo y procesos industriales avanzados. Asimismo, se desarrollan mesas de expertos orientadas a comprender el futuro de la industria, el crecimiento de lentes especializados para miopía y fatiga visual digital, y el debate sobre la evolución de los lentes de visión sencilla frente a las nuevas demandas visuales contemporáneas.',
  updated_at = now()
where slug in ('lab-opticos-13','lab-opticos-13-vie');

update symposiums set
  official_name = 'Óptica y Anteojería',
  subtitle = 'Relación directa entre prescripción, montura y lente',
  description = 'Este simposio desarrolla una visión integral sobre la estrecha relación entre la prescripción clínica, el diseño de lentes oftálmicos, la selección de monturas y los procesos modernos de fabricación óptica. El programa analiza cómo los filtros visuales y los nuevos diseños de lente se integran al estilo de vida contemporáneo y transforman la experiencia visual de los usuarios. Asimismo, se presentan perspectivas internacionales sobre innovación industrial, soluciones ópticas de alto desempeño y la importancia de comprender cómo cada detalle de fabricación influye directamente en la adaptación, comodidad y satisfacción final del paciente. Una sesión diseñada para conectar la ciencia óptica, la tecnología y las necesidades reales del consumidor moderno.',
  updated_at = now()
where slug = 'prescripcion-montura';

update symposiums set
  official_name = 'Adaptación Profesional de Lentes Oftálmicos',
  subtitle = 'Innovación y tendencias actuales',
  description = 'Un espacio académico y técnico de alto nivel que reúne a representantes de algunas de las compañías fabricantes de lentes oftálmicos más importantes del mundo para analizar las tendencias que están transformando la industria visual contemporánea. A través de una dinámica de mesa redonda, el simposio abordará los avances en lentes multifocales ultrapersonalizados, los nuevos desarrollos en lentes digitales de visión sencilla y las innovaciones en superficies y tratamientos oftálmicos orientados al confort, desempeño visual y protección ocular. La sesión permitirá conocer diferentes enfoques tecnológicos, clínicos y comerciales que actualmente lideran el mercado global de lentes oftálmicos y que están redefiniendo la experiencia visual de los pacientes modernos.',
  updated_at = now()
where slug = 'adaptacion-lentes';

-- Académicos
update symposiums set
  official_name = 'V Simposio de Educadores en Optometría',
  subtitle = 'Salud mental del docente',
  description = 'Un espacio académico y humano dedicado al bienestar emocional y psicológico de los docentes en optometría, reconociendo los retos personales, profesionales y sociales que enfrentan en los entornos educativos contemporáneos. Este simposio promueve una reflexión profunda sobre la importancia de la salud mental, el equilibrio emocional y el autocuidado como pilares fundamentales para el ejercicio de la docencia de alto impacto. A través de un enfoque interdisciplinario que integra educación, coaching y psicología, los asistentes encontrarán herramientas prácticas para fortalecer su bienestar, prevenir el agotamiento profesional y construir ambientes académicos más saludables, empáticos y sostenibles.',
  updated_at = now()
where slug = 'salud-docente';

update symposiums set
  official_name = 'Simposio Estudiantes de Optometría',
  subtitle = null,
  description = 'Espacio académico dedicado a los estudiantes de optometría de toda América Latina, diseñado para fortalecer la formación profesional, el liderazgo y la conexión con la comunidad salud visual. El simposio promueve el desarrollo de competencias clínicas, comerciales y de innovación a través de ponencias inspiradoras, dinámicas de aprendizaje y experiencias compartidas con profesionales de referencia. Una oportunidad clave para que las nuevas generaciones de optómetras descubran las tendencias del sector y construyan vínculos estratégicos para su futuro profesional.',
  updated_at = now()
where slug = 'estudiantes-jue';

-- D.3 — Insertar el simposio NUEVO #26: Mejora tu Vida con LC
insert into symposiums (
  slug, kind, generic_category, official_name, subtitle, description,
  track_id, area_id, category_id,
  day, start_time, end_time,
  is_exclusive, exclusive_org, sponsor_brand
) values (
  'mejora-tu-vida-lc',
  'symposium',
  'Simposio Lentes de Contacto Blandos',
  'Panel de Expertos: Mejora tu Vida con LC',
  'Patrocinado por ALCON, Bausch & Lomb, Johnson & Johnson y Coopervision',
  'Este simposio y debate es una propuesta de crecimiento para toda la comunidad salud visual. Está demostrado que la práctica de la contactología aumenta las visitas de pacientes y su entorno, incrementando la posibilidad de prestar otros servicios y ventas. Al mismo tiempo, se mantiene la salud y el bienestar de las personas. Por eso, GRUPO FRANJA con el respaldo de las empresas ALCON, Bausch & Lomb, Johnson & Johnson y Coopervision desarrolla una estrategia que fortalece su primera parte con este Simposio y Panel de Expertos. El concepto es ganador: MEJORA TU VIDA CON LENTES DE CONTACTO.',
  (select id from tracks where slug = 'grupo-franja'),
  (select id from areas where slug = 'lentes-contacto'),
  (select id from simposio_categories where slug = 'clinicos'),
  '2026-07-10',
  '12:30',
  '14:00',
  false, null, 'ALCON, Bausch & Lomb, Johnson & Johnson, Coopervision'
) on conflict (slug) do update set
  official_name = excluded.official_name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  category_id = excluded.category_id,
  sponsor_brand = excluded.sponsor_brand,
  updated_at = now();

-- D.4 — Vincular directores del nuevo simposio
insert into symposium_speakers (symposium_id, speaker_id, role) values
  ((select id from symposiums where slug='mejora-tu-vida-lc'), (select id from speakers where slug='carol-pinzon'),   'director'),
  ((select id from symposiums where slug='mejora-tu-vida-lc'), (select id from speakers where slug='javier-oviedo'),  'director')
on conflict (symposium_id, speaker_id, role) do nothing;

-- D.5 — Marcas patrocinadoras del nuevo simposio (logos decorativos)
insert into symposium_brands (symposium_id, brand_name, brand_slug, display_order) values
  ((select id from symposiums where slug='mejora-tu-vida-lc'), 'ALCON',             'alcon',         1),
  ((select id from symposiums where slug='mejora-tu-vida-lc'), 'Bausch & Lomb',     'bausch-lomb',   2),
  ((select id from symposiums where slug='mejora-tu-vida-lc'), 'Johnson & Johnson', 'jnj',           3),
  ((select id from symposiums where slug='mejora-tu-vida-lc'), 'Coopervision',      'coopervision',  4)
on conflict (symposium_id, brand_slug) do update set
  brand_name = excluded.brand_name,
  display_order = excluded.display_order;

-- D.6 — Marcas del Simposio Adaptación de Lentes Oftálmicos
insert into symposium_brands (symposium_id, brand_name, brand_slug, display_order) values
  ((select id from symposiums where slug='adaptacion-lentes'), 'EssilorLuxottica', 'essilorluxottica', 1),
  ((select id from symposiums where slug='adaptacion-lentes'), 'Hoya',             'hoya',             2),
  ((select id from symposiums where slug='adaptacion-lentes'), 'Rodenstock',       'rodenstock',       3),
  ((select id from symposiums where slug='adaptacion-lentes'), 'Younger',          'younger',          4),
  ((select id from symposiums where slug='adaptacion-lentes'), 'Zeiss',            'zeiss',            5)
on conflict (symposium_id, brand_slug) do update set
  brand_name = excluded.brand_name,
  display_order = excluded.display_order;

-- ---------------------------------------------------------------
-- E) 89 EMPRESAS EXPOSITORAS
-- ---------------------------------------------------------------

-- Helper function: slugify name
create or replace function franja_slugify(input text) returns text as $$
  select lower(regexp_replace(unaccent(coalesce(input,'')), '[^a-zA-Z0-9]+', '-', 'g'))
$$ language sql immutable;

-- Try to enable unaccent (some Supabase projects need this)
create extension if not exists unaccent;

insert into exhibitors (slug, name, booth_number, country) values
  ('tq',                       'TQ',                          '3, 4',     'Colombia'),
  ('phelcom-int',              'Phelcom Int',                 '5',        null),
  ('acep',                     'ACEP',                        '6',        null),
  ('eschenbach',               'Eschenbach',                  '7',        'Alemania'),
  ('kerakom',                  'Kerakom',                     '8',        null),
  ('gx7',                      'GX7',                         '9',        null),
  ('precision-lab',            'Precisión Lab',               '10',       null),
  ('opticas-com',              'Opticas.com',                 '11',       null),
  ('anyday',                   'Anyday',                      '13',       null),
  ('maui-jim',                 'Maui Jim',                    '15',       'Estados Unidos'),
  ('falcon',                   'Falcon',                      '16',       null),
  ('world-vision',             'World Vision',                '17',       null),
  ('ko',                       'KO',                          '18',       null),
  ('softix',                   'Softix',                      '19',       null),
  ('optidis',                  'Optidis',                     '20',       null),
  ('siou',                     'SIOU',                        '21',       'Brasil'),
  ('pibavision',               'Pibavision',                  '22',       null),
  ('horizons-optical',         'Horizons Optical',            '23',       null),
  ('quince-uno',               '15-1',                        '24',       null),
  ('alt-medical',              'Alt Medical',                 '25',       null),
  ('spectrum',                 'Spectrum',                    '27',       null),
  ('hoya',                     'Hoya',                        '28',       'Internacional'),
  ('satisloh',                 'Satisloh',                    '29',       'Internacional'),
  ('mei',                      'MEI',                         '30',       'Italia'),
  ('schneider',                'Schneider',                   '31',       'Alemania'),
  ('leonard',                  'Leonard',                     '32',       null),
  ('optisur',                  'Optisur',                     '35',       null),
  ('nawi',                     'Ñawi',                        '36',       null),
  ('novar',                    'Novar',                       '37',       'Argentina'),
  ('coburn',                   'Coburn',                      '38',       'Estados Unidos'),
  ('brapan',                   'Brapan',                      '40',       null),
  ('augen',                    'Augen',                       '41',       null),
  ('lensware',                 'Lensware',                    '42',       null),
  ('lamar',                    'Lamar',                       '43',       null),
  ('younger-optics',           'Younger Optics',              '44',       'Estados Unidos'),
  ('iot',                      'IOT',                         '45',       null),
  ('symcon-vision',            'Symcon Vision',               '46',       null),
  ('bausch-lomb',              'Bausch & Lomb',               '47',       'Internacional'),
  ('essilorluxottica',         'EssilorLuxottica',            '48, 54',   'Internacional'),
  ('distribuciones-melgarejo', 'Distribuciones Ópticas Melgarejo','49',   'Colombia'),
  ('optotech',                 'OptoTech',                    '50',       null),
  ('opticon',                  'Opticon',                     '52',       null),
  ('yesh-vitajon',             'Yesh Vitajon',                '53',       null),
  ('prats',                    'Prats',                       '55',       null),
  ('visibility',               'Visibility',                  '57',       null),
  ('kim',                      'Kim',                         '58',       null),
  ('zeiss',                    'Zeiss',                       '59',       'Internacional'),
  ('jnj',                      'Johnson & Johnson',           '60',       'Internacional'),
  ('gildi',                    'Gildi',                       '61',       null),
  ('think-pink',               'Think Pink',                  '63',       null),
  ('alternative-eyewear',      'Alternative Eyewear',         '64',       null),
  ('latam-optical',            'Latam Optical',               '65',       null),
  ('opteam',                   'Opteam',                      '66',       null),
  ('lentes-vip',               'Lentes VIP',                  '68',       null),
  ('luze',                     'LUZE',                        '69',       null),
  ('geo',                      'GEO',                         '70',       null),
  ('sydicol',                  'Sydicol',                     '71',       null),
  ('optomedic',                'Optomedic',                   '72',       null),
  ('distribuidora-ultralents', 'Distribuidora Ultralents',    '78',       null),
  ('eye-hero',                 'Eye-Hero',                    '80',       null),
  ('c-vision',                 'C+Vision',                    '82',       null),
  ('coopervision',             'Coopervision',                '83',       'Internacional'),
  ('grupo-colors',             'Grupo Colors',                '84',       null),
  ('excilens',                 'EXCILENS',                    '86',       null),
  ('maori',                    'Maori',                       '87',       null),
  ('unilentes',                'Unilentes',                   '88',       null),
  ('australens',               'Australens',                  '89',       null),
  ('safilo',                   'Safilo',                      '90',       'Italia'),
  ('sophia',                   'Sophia',                      '92',       null),
  ('ophtha',                   'Ophtha',                      '93',       null),
  ('smartvision',              'Smartvision',                 '94',       null),
  ('east-optical',             'East Optical',                '95',       null),
  ('tuvision',                 'TuVision',                    '97, 98',   null),
  ('gospa',                    'Gospa',                       '101, 102', null),
  ('master-flex',              'Master Flex',                 '103',      null),
  ('andru-vision',             'Andru Vision',                '104, 106', null),
  ('keratos',                  'Keratos',                     '105',      null),
  ('vb-vision',                'VB Vision',                   '107, 108', null),
  ('jn-visual',                'JN Visual',                   '111, 112', null),
  ('pulido-otalora',           'Pulido & Otálora',            '113, 116', 'Colombia'),
  ('global-v',                 'Global-V',                    '114, 115', null),
  ('pharma-prix',              'Pharma Prix',                 '119',      null),
  ('bmk',                      'BMK',                         '120',      null),
  ('el-becerro',               'El Becerro',                  '121',      null),
  ('fun-look',                 'Fun Look',                    'A',        null),
  ('international-visual-brands','International Visual Brands','C',       'Internacional')
on conflict (slug) do update set
  name = excluded.name,
  booth_number = excluded.booth_number,
  country = excluded.country,
  updated_at = now();

-- ---------------------------------------------------------------
-- F) CATEGORÍAS DE EXPOSITORES (orientativas — admin asigna después)
-- ---------------------------------------------------------------

insert into exhibitor_categories (slug, name, display_order) values
  ('laboratorios',     'Laboratorios Ópticos',                   1),
  ('monturas',         'Monturas y Marcas',                      2),
  ('lentes-contacto',  'Lentes de Contacto',                     3),
  ('equipos',          'Equipos y Tecnología',                   4),
  ('lentes-oftalmicos','Lentes Oftálmicos',                      5),
  ('cosmetica',        'Cosmética Visual',                       6),
  ('software',         'Software y SaaS',                        7),
  ('servicios',        'Servicios',                              8),
  ('distribuidores',   'Distribuidores',                         9),
  ('fabricantes',      'Fabricantes',                           10)
on conflict (slug) do update set
  name = excluded.name,
  display_order = excluded.display_order;

-- Pre-asignar categorías obvias
update exhibitors set category_id = (select id from exhibitor_categories where slug='lentes-oftalmicos')
  where slug in ('hoya','zeiss','essilorluxottica','younger-optics','rodenstock','iot','horizons-optical');

update exhibitors set category_id = (select id from exhibitor_categories where slug='lentes-contacto')
  where slug in ('bausch-lomb','jnj','coopervision','sophia');

update exhibitors set category_id = (select id from exhibitor_categories where slug='equipos')
  where slug in ('satisloh','mei','schneider','coburn','symcon-vision','optotech','phelcom-int','novar','siou');

update exhibitors set category_id = (select id from exhibitor_categories where slug='monturas')
  where slug in ('maui-jim','safilo','eschenbach','alternative-eyewear','prats','gildi','think-pink',
                 'maori','fun-look','mormaii');

-- Sponsors destacados
update exhibitors set is_sponsor = true, sponsor_tier = 'platinum' where slug in ('essilorluxottica','hoya','zeiss');
update exhibitors set is_sponsor = true, sponsor_tier = 'gold'     where slug in ('bausch-lomb','jnj','coopervision','younger-optics');
update exhibitors set is_sponsor = true, sponsor_tier = 'silver'   where slug in ('safilo','sophia','spectrum','satisloh','rodenstock');

-- ---------------------------------------------------------------
-- G) ACTUALIZAR EL CONTEO MAGNITUD EN FAQ (26 simposios, no 24)
-- ---------------------------------------------------------------

update faq set answer = '26 simposios académicos.'
  where question = '¿Cuántos simposios tiene FRANJA 2026?';

update faq set answer = '15 talleres especializados (algunos por confirmar).'
  where question = '¿Cuántos talleres habrá?';

update faq set answer = '89 empresas expositoras confirmadas en el Salón de Negocios.'
  where question = '¿Cuántas empresas expositoras hay?';

-- =============================================================
-- FIN MIGRATION 0003
--
-- Batches futuros (cuando llegue el contenido):
--   0004_content_conferences_jueves.sql — TODAS las ponencias del jueves
--   0005_content_conferences_viernes.sql — TODAS las ponencias del viernes
--   0006_content_speakers_photos.sql — fotos cuando el admin las suba
--   0007_content_news_articles.sql — noticias cuando lleguen
-- =============================================================
