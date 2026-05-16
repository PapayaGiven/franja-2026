-- =============================================================
-- FRANJA 2026 — base seed (tracks, areas, hotels, organizations,
-- speakers skeleton, symposium skeleton, FAQ, sample POIs).
-- Run after 0001_init.sql. Future content batches (0002_, 0003_…)
-- layer in more detail.
-- =============================================================

-- TRACKS
insert into tracks (slug, name, color, display_order) values
  ('franja-ocular',  'Franja Ocular',  '#3DCDD0', 1),
  ('franja-visual',  'Franja Visual',  '#7B3FA6', 2),
  ('grupo-franja',   'Grupo Franja',   '#E85DA6', 3),
  ('talleres-franja','Talleres Franja','#F0C75E', 4);

-- AREAS
insert into areas (slug, name) values
  ('adulto-mayor',       'Adulto Mayor'),
  ('examenes-especiales','Exámenes Especiales'),
  ('merchandising',      'Merchandising'),
  ('consulta-optometria','Consulta de Optometría'),
  ('propietarios',       'Propietarios de Óptica'),
  ('ventas',             'Ventas'),
  ('laboratorios',       'Laboratorios'),
  ('estudiantes',        'Estudiantes'),
  ('optica-anteojeria',  'Óptica y Anteojería'),
  ('cirugia-refractiva', 'Cirugía Refractiva'),
  ('terapia-visual',     'Terapia y Entrenamiento Visual'),
  ('pediatria',          'Pediatría'),
  ('control-miopia',     'Control de Miopía'),
  ('baja-vision',        'Baja Visión'),
  ('superficie-ocular',  'Superficie Ocular'),
  ('educadores',         'Educadores en Optometría'),
  ('marketing',          'Marketing'),
  ('neurovision',        'Neurovisión'),
  ('lentes-oftalmicos',  'Lentes Oftálmicos'),
  ('imagen-personal',    'Imagen Personal'),
  ('salud-mental',       'Optometría y Salud Mental'),
  ('presbicia',          'Presbicia'),
  ('lc-blandos',         'Lentes de Contacto Blandos'),
  ('moda-rostro',        'Moda del Rostro'),
  ('lentes-contacto',    'Lentes de Contacto'),
  ('legislacion',        'Legislación'),
  ('protesis-oculares',  'Prótesis Oculares');

-- EXHIBITOR CATEGORIES (placeholder — fill from real exhibitor list)
insert into exhibitor_categories (slug, name, display_order) values
  ('laboratorios',     'Laboratorios Ópticos', 1),
  ('monturas',         'Monturas y Marcas', 2),
  ('lentes-contacto',  'Lentes de Contacto', 3),
  ('equipos',          'Equipos y Tecnología', 4),
  ('lentes-oftalmicos','Lentes Oftálmicos', 5),
  ('cosmetica',        'Cosmética Visual', 6),
  ('software',         'Software y SaaS', 7),
  ('servicios',        'Servicios', 8);

-- ORGANIZATIONS
insert into organizations (slug, name, acronym, type) values
  ('asosavin','Asociación ASOSAVIN','ASOSAVIN','asociación'),
  ('ortos',   'ORTOS',              'ORTOS',   'asociación'),
  ('aldoo',   'ALDOO',              'ALDOO',   'asociación');

-- HOTELS
insert into hotels (slug, name) values
  ('hyatt-place',          'Hyatt Place'),
  ('black-tower',          'Black Tower'),
  ('regency',              'Regency'),
  ('boutique-city-center', 'Hotel Boutique City Center');

-- DIRECTORS as speakers (preliminary — full bios filled later via admin)
insert into speakers (slug, full_name, credentials, country, country_code, is_featured) values
  ('juan-carlos-morales',    'Juan Carlos Morales',    'MD. Geriatra. Mag.',                     'Colombia','CO', true),
  ('cesar-erazo',            'César Erazo',            'Mag. Psicología del Consumidor',          'Colombia','CO', false),
  ('luis-escaf',             'Luis Escaf',             'MD.',                                     'Colombia','CO', true),
  ('julian-trivino',         'Julián Triviño',         'OD. Esp.',                                'Colombia','CO', false),
  ('julio-jinesta',          'Julio Jinesta',          'Ing.',                                    'Colombia','CO', false),
  ('johanna-davila',         'Johanna Dávila',         'Adm. Negocios Internacionales',           'Colombia','CO', false),
  ('sandra-medrano',         'Sandra Medrano',         'OD. PhD.',                                'Colombia','CO', true),
  ('sandra-ortiz',           'Sandra Ortiz',           'OD. Mag. Esp.',                           'Colombia','CO', false),
  ('cristina-trujillo',      'Cristina Trujillo',      'OD.',                                     'Colombia','CO', false),
  ('natali-gutierrez',       'Natali Gutiérrez',       'OD. Mag. PhD.',                           'Colombia','CO', true),
  ('ana-milena-olave',       'Ana Milena Olave',       'OD.',                                     'Colombia','CO', false),
  ('alberto-calle',          'Alberto Calle',          'MD.',                                     'Colombia','CO', false),
  ('fredy-otalora',          'Fredy Otálora',          'OD., MS., FAAO',                          'Colombia','CO', true),
  ('mauricio-pulido',        'Mauricio Pulido',        'OD., Esp.',                               'Colombia','CO', false),
  ('jose-pardo',             'José Pardo',             'OD. Mag.',                                'Colombia','CO', false),
  ('javier-prada',           'Javier Prada',           'OD. Esp.',                                'Colombia','CO', false),
  ('adela-benitez',          'Adela Benítez',          'OD.',                                     'Colombia','CO', false),
  ('marco-pardo',            'Marco Pardo',            'OD.',                                     'Colombia','CO', false),
  ('jairo-beltran',          'Jairo Beltrán',          'OD.',                                     'Colombia','CO', false),
  ('diego-luis-gomez',       'Diego Luis Gómez',       'Mag. Marketing, Publicidad e IA',         'Colombia','CO', false),
  ('allan-mora',             'Allan Mora',             'Lic. Mag.',                               'Colombia','CO', false),
  ('juan-alberto-patino',    'Juan Alberto Patiño',    'Desarrollador de Negocios',               'Colombia','CO', false),
  ('martin-giraldo',         'Martín Giraldo',         'OD. Mag. Esp.',                           'Colombia','CO', false),
  ('sandra-duran',           'Sandra Durán',           'OD. Mag.',                                'Colombia','CO', false),
  ('alejandro-leon',         'Alejandro León',         'OD. MSc. PhD.',                           'Colombia','CO', true),
  ('andres-solorzano',       'Andrés Solórzano',       'OD.',                                     'Colombia','CO', false),
  ('hugo-saenz',             'Hugo A. Sáenz',          'Experto Cx y Mkg.',                       'Colombia','CO', false),
  ('claudia-ramos',          'Claudia A. Ramos',       'OD.',                                     'Colombia','CO', false),
  ('ingryd-lorenzana',       'Ingryd Lorenzana',       'OD., FAAO',                               'Colombia','CO', false),
  ('guiomar-malaver',        'Guiomar Malaver',        'OD., PhD.',                               'Colombia','CO', true),
  ('norma-cardenas',         'Norma Cárdenas',         'OD. Esp. Mag.',                           'Colombia','CO', false),
  ('yuly-giraldo',           'Yuly Giraldo',           'Asesora de Imagen',                       'Colombia','CO', false);

-- SYMPOSIUMS — JUEVES 9 JULIO 2026
with t as (select id, slug from tracks),
     a as (select id, slug from areas)
insert into symposiums
  (slug, kind, generic_category, official_name, subtitle, track_id, area_id, day, start_time, end_time, is_exclusive, exclusive_org, sponsor_brand)
values
  ('eco-plateada',           'symposium','Simposio Adulto Mayor',         'Economía Plateada y el Adulto Mayor', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='adulto-mayor'),
   '2026-07-09','08:30','10:00', false, null, null),

  ('vender-mas',             'symposium','Simposio Ventas',               'Estrategias para Vender Más', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='ventas'),
   '2026-07-09','08:30','10:00', false, null, null),

  ('cornea-cristalino',      'symposium','Simposio Cirugía Refractiva',   'Casos Quirúrgicos de Córnea y Cristalino', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='cirugia-refractiva'),
   '2026-07-09','08:30','10:00', false, null, null),

  ('po-ophthalmics',         'taller',   null,                            'P&O Ophthalmics', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','08:30','09:10', false, null, 'P&O Ophthalmics'),

  ('taller-2',               'taller',   null,                            'Taller 2', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','09:30','10:10', false, null, null),

  ('ultrasonido-ia',         'symposium','Simposio Exámenes Especiales',  'Ultrasonido, Filtros para FO y Campimetría por IA', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='examenes-especiales'),
   '2026-07-09','11:00','12:30', false, null, null),

  ('lab-opticos-13',         'symposium','XIII Simposio',                 'XIII Simposio de Laboratorios Ópticos de América Latina', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='laboratorios'),
   '2026-07-09','10:00','13:00', false, null, null),

  ('vision-activa',          'symposium','Simposio Terapia y Entrenamiento Visual', 'Visión Activa', 'Estilos de Vida y Entrenamiento Visual',
   (select id from t where slug='grupo-franja'), (select id from a where slug='terapia-visual'),
   '2026-07-09','11:00','13:00', false, null, null),

  ('coopervision-jue',       'taller',   null,                            'Coopervision', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','11:00','11:45', false, null, 'Coopervision'),

  ('jnj-jue',                'taller',   null,                            'Johnson & Johnson', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','12:00','12:45', false, null, 'Johnson & Johnson'),

  ('asosavin-jue',           'special',  null,                            'Reunión ASOSAVIN', 'Exclusiva para miembros',
   (select id from t where slug='franja-ocular'), null,
   '2026-07-09','12:45','13:45', true, 'ASOSAVIN', null),

  ('estudiantes-jue',        'special',  null,                            'Estudiantes de Optometría', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='estudiantes'),
   '2026-07-09','13:15','14:45', false, null, null),

  ('vitrinas-seductoras',    'symposium','Simposio de Merchandising',     'Vitrinas Seductoras de Ópticas', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='merchandising'),
   '2026-07-09','14:00','15:30', false, null, null),

  ('partido-jue',            'special',  null,                            'Transmisión Partido Cuartos de Final', null,
   (select id from t where slug='franja-visual'), null,
   '2026-07-09','15:00','17:00', false, null, null),

  ('vision-infantil',        'symposium','Simposio de Pediatría',         'Visión Infantil', 'Estilos de Vida y Decisiones Clínicas',
   (select id from t where slug='grupo-franja'), (select id from a where slug='pediatria'),
   '2026-07-09','14:30','16:00', false, null, null),

  ('bausch-lomb',            'taller',   null,                            'Bausch & Lomb', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','14:00','14:45', false, null, 'Bausch & Lomb'),

  ('protesis-oculares',      'taller',   null,                            'Prótesis Oculares', '¿Qué hacer cuando te llega un paciente con prótesis?',
   (select id from t where slug='talleres-franja'), (select id from a where slug='protesis-oculares'),
   '2026-07-09','15:00','15:45', false, null, null),

  ('tendencias-evaluacion',  'symposium','Simposio Consulta de Optometría','Nuevas Tendencias de Evaluación', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='consulta-optometria'),
   '2026-07-09','16:30','18:00', false, null, null),

  ('prescripcion-montura',   'symposium','Simposio de Óptica y Anteojería','Prescripción, Lente y Montura', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='optica-anteojeria'),
   '2026-07-09','17:00','18:30', false, null, null),

  ('manejo-miopia',          'symposium','Simposio Control Miopía',       'Manejo Clínico de la Miopía', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='control-miopia'),
   '2026-07-09','16:30','18:30', false, null, null),

  ('legislacion-jue',        'taller',   null,                            'Legislación para Consultorios, Ópticas y Laboratorios', null,
   (select id from t where slug='talleres-franja'), (select id from a where slug='legislacion'),
   '2026-07-09','16:30','17:20', false, null, null),

  ('ortos-jue',              'special',  null,                            'Reunión ORTOS', 'Exclusiva para miembros',
   (select id from t where slug='talleres-franja'), null,
   '2026-07-09','17:40','18:40', true, 'ORTOS', null),

  ('ia-negocio',             'symposium','Simposio Propietarios de Óptica','Inteligencia Artificial para Mejorar tu Negocio', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='propietarios'),
   '2026-07-09','18:00','19:00', false, null, null),

  ('foro-aldoo-jue',         'special',  null,                            'Foro Crisis de la Salud Visual en América Latina', 'ALDOO',
   (select id from t where slug='franja-visual'), null,
   '2026-07-09','18:00','20:00', false, null, null),

  ('acto-inaugural',         'special',  null,                            'Acto Inaugural', 'Salón Grupo Franja',
   (select id from t where slug='grupo-franja'), null,
   '2026-07-09','19:00','19:30', false, null, null),

  ('magistral-jue',          'special',  null,                            'Conferencia Magistral', 'Salón Grupo Franja',
   (select id from t where slug='grupo-franja'), null,
   '2026-07-09','19:30','20:30', false, null, null),

-- SYMPOSIUMS — VIERNES 10 JULIO 2026

  ('baja-vision',            'symposium','Simposio Baja Visión',          'Analizar y Mejorar Estilos de Vida', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='baja-vision'),
   '2026-07-10','08:30','10:00', false, null, null),

  ('distribuidores',         'symposium','IV Simposio',                   'IV Simposio de Distribuidores del Sector Salud Visual', null,
   (select id from t where slug='franja-visual'), null,
   '2026-07-10','08:30','10:00', false, null, null),

  ('salud-mental-visual',    'symposium','Simposio Optometría y Salud Mental','Estado Emocional y Salud Visual', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='salud-mental'),
   '2026-07-10','08:30','10:00', false, null, null),

  ('taller-8',               'taller',   null,                            'Taller 8', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','08:30','09:10', false, null, null),

  ('taller-9',               'taller',   null,                            'Taller 9', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','09:30','10:10', false, null, null),

  ('superficie-360',         'symposium','Simposio Superficie Ocular',    'Análisis y Tratamiento 360°', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='superficie-ocular'),
   '2026-07-10','11:00','12:30', false, null, null),

  ('lab-opticos-13-vie',     'symposium','XIII Simposio',                 'XIII Simposio de Laboratorios Ópticos de América Latina', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='laboratorios'),
   '2026-07-10','10:00','13:00', false, null, null),

  ('presbicia-correccion',   'symposium','Simposio Presbicia',            'Opciones Actuales de Corrección', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='presbicia'),
   '2026-07-10','11:00','12:30', false, null, null),

  ('spectrum',               'taller',   null,                            'Spectrum', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','11:00','11:40', false, null, 'Spectrum'),

  ('sophia',                 'taller',   null,                            'Sophia', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','12:00','12:40', false, null, 'Sophia'),

  ('salud-docente',          'symposium','V Simposio Educadores en Optometría','Salud Mental del Docente', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='educadores'),
   '2026-07-10','12:30','14:00', false, null, null),

  ('expertos-lcb',           'special',  null,                            'Reunión de Expertos en LC Blandos', '¿Cómo Incrementar la Adaptación de LCB?',
   (select id from t where slug='grupo-franja'), (select id from a where slug='lc-blandos'),
   '2026-07-10','12:30','14:00', false, null, null),

  ('marketing-consumidor',   'symposium','Simposio Marketing',            'Marketing para el Nuevo Consumidor', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='marketing'),
   '2026-07-10','14:00','15:30', false, null, null),

  ('partido-vie',            'special',  null,                            'Transmisión Partido Cuartos de Final', null,
   (select id from t where slug='franja-visual'), null,
   '2026-07-10','14:00','16:00', false, null, null),

  ('moda-rostro',            'symposium','Simposio La Moda del Rostro',   'Cosméticos, Accesorios y Anteojos', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='moda-rostro'),
   '2026-07-10','14:00','15:30', false, null, null),

  ('taller-12',              'taller',   null,                            'Taller 12', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','14:00','14:40', false, null, null),

  ('taller-13',              'taller',   null,                            'Taller 13', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','15:00','15:40', false, null, null),

  ('neurovision',            'symposium','Simposio Neurovision',          'Estrategias Prácticas para Comprender el Cerebro', null,
   (select id from t where slug='franja-ocular'), (select id from a where slug='neurovision'),
   '2026-07-10','16:30','18:00', false, null, null),

  ('adaptacion-lentes',      'symposium','Simposio Lentes Oftálmicos',    'Adaptación Profesional de Lentes Oftálmicos', null,
   (select id from t where slug='franja-visual'), (select id from a where slug='lentes-oftalmicos'),
   '2026-07-10','16:00','17:30', false, null, null),

  ('todo-lc',                'symposium','Simposio Lentes de Contacto',   'La Importancia del "Todo" para Llegar a la Adaptación Exitosa de LC', null,
   (select id from t where slug='grupo-franja'), (select id from a where slug='lentes-contacto'),
   '2026-07-10','16:30','18:30', false, null, null),

  ('taller-14',              'taller',   null,                            'Taller 14', null,
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','16:30','17:10', false, null, null),

  ('lanzamiento-libros',     'special',  null,                            'Lanzamiento de Libros Latinoamericanos', 'Conversatorio con los autores',
   (select id from t where slug='talleres-franja'), null,
   '2026-07-10','17:30','18:30', false, null, null),

  ('imagen-personal',        'symposium','Simposio Imagen Personal',      'La Experiencia que Vende', 'Secretos de Imagen y Comunicación para Ópticas Exitosas',
   (select id from t where slug='franja-visual'), (select id from a where slug='imagen-personal'),
   '2026-07-10','18:00','19:30', false, null, null),

  ('foro-aldoo-vie',         'special',  null,                            'Foro Crisis de la Salud Visual en América Latina', 'ALDOO',
   (select id from t where slug='franja-ocular'), null,
   '2026-07-10','18:00','20:00', false, null, null),

  ('magistral-vie',          'special',  null,                            'Conferencia Magistral', 'Salón Grupo Franja',
   (select id from t where slug='grupo-franja'), null,
   '2026-07-10','19:30','20:30', false, null, null);

-- LINK DIRECTORS TO SYMPOSIUMS (sample — extend as needed)
insert into symposium_speakers (symposium_id, speaker_id, role) values
  ((select id from symposiums where slug='eco-plateada'),         (select id from speakers where slug='juan-carlos-morales'),'director'),
  ((select id from symposiums where slug='vender-mas'),           (select id from speakers where slug='cesar-erazo'),         'director'),
  ((select id from symposiums where slug='cornea-cristalino'),    (select id from speakers where slug='luis-escaf'),          'director'),
  ((select id from symposiums where slug='ultrasonido-ia'),       (select id from speakers where slug='julian-trivino'),      'director'),
  ((select id from symposiums where slug='lab-opticos-13'),       (select id from speakers where slug='julio-jinesta'),       'director'),
  ((select id from symposiums where slug='lab-opticos-13'),       (select id from speakers where slug='johanna-davila'),      'moderator'),
  ((select id from symposiums where slug='vision-activa'),        (select id from speakers where slug='sandra-medrano'),      'director'),
  ((select id from symposiums where slug='estudiantes-jue'),      (select id from speakers where slug='sandra-ortiz'),        'director'),
  ((select id from symposiums where slug='vitrinas-seductoras'),  (select id from speakers where slug='cristina-trujillo'),   'director'),
  ((select id from symposiums where slug='vision-infantil'),      (select id from speakers where slug='natali-gutierrez'),    'director'),
  ((select id from symposiums where slug='protesis-oculares'),    (select id from speakers where slug='ana-milena-olave'),    'director'),
  ((select id from symposiums where slug='protesis-oculares'),    (select id from speakers where slug='alberto-calle'),       'director'),
  ((select id from symposiums where slug='tendencias-evaluacion'),(select id from speakers where slug='fredy-otalora'),       'director'),
  ((select id from symposiums where slug='tendencias-evaluacion'),(select id from speakers where slug='mauricio-pulido'),     'director'),
  ((select id from symposiums where slug='prescripcion-montura'), (select id from speakers where slug='jose-pardo'),          'director'),
  ((select id from symposiums where slug='manejo-miopia'),        (select id from speakers where slug='javier-prada'),        'director'),
  ((select id from symposiums where slug='legislacion-jue'),      (select id from speakers where slug='adela-benitez'),       'speaker'),
  ((select id from symposiums where slug='legislacion-jue'),      (select id from speakers where slug='marco-pardo'),         'speaker'),
  ((select id from symposiums where slug='legislacion-jue'),      (select id from speakers where slug='jairo-beltran'),       'speaker'),
  ((select id from symposiums where slug='ia-negocio'),           (select id from speakers where slug='diego-luis-gomez'),    'director'),
  ((select id from symposiums where slug='baja-vision'),          (select id from speakers where slug='allan-mora'),          'director'),
  ((select id from symposiums where slug='distribuidores'),       (select id from speakers where slug='juan-alberto-patino'), 'director'),
  ((select id from symposiums where slug='salud-mental-visual'),  (select id from speakers where slug='martin-giraldo'),      'director'),
  ((select id from symposiums where slug='superficie-360'),       (select id from speakers where slug='sandra-duran'),        'director'),
  ((select id from symposiums where slug='lab-opticos-13-vie'),   (select id from speakers where slug='julio-jinesta'),       'director'),
  ((select id from symposiums where slug='lab-opticos-13-vie'),   (select id from speakers where slug='johanna-davila'),      'moderator'),
  ((select id from symposiums where slug='presbicia-correccion'), (select id from speakers where slug='alejandro-leon'),      'director'),
  ((select id from symposiums where slug='salud-docente'),        (select id from speakers where slug='andres-solorzano'),    'director'),
  ((select id from symposiums where slug='marketing-consumidor'), (select id from speakers where slug='hugo-saenz'),          'director'),
  ((select id from symposiums where slug='adaptacion-lentes'),    (select id from speakers where slug='claudia-ramos'),       'director'),
  ((select id from symposiums where slug='neurovision'),          (select id from speakers where slug='ingryd-lorenzana'),    'director'),
  ((select id from symposiums where slug='neurovision'),          (select id from speakers where slug='guiomar-malaver'),     'director'),
  ((select id from symposiums where slug='todo-lc'),              (select id from speakers where slug='norma-cardenas'),      'director'),
  ((select id from symposiums where slug='imagen-personal'),      (select id from speakers where slug='yuly-giraldo'),        'director');

-- SAMPLE ANNOUNCEMENT
insert into announcements (title, body, severity, show_as_banner, show_in_feed, is_pinned)
values ('Bienvenidos a FRANJA 2026',
        'Estilo de vida, visión, moda y negocios. 9 y 10 de julio · Corferias, Bogotá.',
        'info', false, true, true);

-- FAQ with real event info from master document
insert into faq (question, answer, category, display_order) values
  ('¿Dónde se realiza FRANJA 2026?',          'En Corferias, Bogotá, Colombia. Pabellones 10 al 17.', 'general', 1),
  ('¿Cuáles son las fechas del evento?',      'Jueves 9 y viernes 10 de julio de 2026.', 'general', 2),
  ('¿A qué hora abre el registro?',           'El registro abre a las 7:00 a.m. ambos días.', 'horarios', 3),
  ('¿A qué hora puedo ingresar a los salones de conferencias?', 'El ingreso a los salones de conferencias inicia a las 8:00 a.m.', 'horarios', 4),
  ('¿A qué hora abre el Salón de Negocios?',  'El Salón de Negocios abre a las 9:00 a.m. ambos días.', 'horarios', 5),
  ('¿A qué hora cierran las actividades?',    'Las actividades cierran a las 10:00 p.m. ambos días.', 'horarios', 6),
  ('¿Hay coctel de cierre?',                  'Sí. El viernes 10 de julio a las 10:00 p.m. en las instalaciones del evento.', 'horarios', 7),
  ('¿Cuántos simposios tiene FRANJA 2026?',   '24 simposios académicos.', 'magnitud', 8),
  ('¿Cuántos talleres habrá?',                '15 talleres especializados.', 'magnitud', 9),
  ('¿Cuántos conferencistas internacionales participan?', 'Más de 130 conferencistas internacionales.', 'magnitud', 10),
  ('¿Cuántas empresas expositoras hay?',      'Más de 120 empresas expositoras en el Salón de Negocios.', 'magnitud', 11),
  ('¿Qué incluye mi inscripción?',            'Acceso a todos los simposios, Salón de Negocios y eventos especiales según tu plan.', 'inscripcion', 12),
  ('¿Cuáles son los salones académicos?',     'Salón Franja Ocular, Salón Franja Visual, Salón Grupo Franja y Talleres Franja.', 'general', 13);

-- SAMPLE MAP POIs (replace with real coords once you have the floorplan)
insert into map_pois (name, type, x, y, pabellón) values
  ('Registro Principal',       'registration',  50, 10, '10'),
  ('Salón Grupo Franja',       'stage',        50, 30, '13'),
  ('Sala Franja Ocular',       'room',         20, 30, '11'),
  ('Sala Franja Visual',       'room',         35, 30, '12'),
  ('Sala Talleres Franja',     'room',         65, 30, '14'),
  ('Salón de Negocios',        'networking',   50, 55, '15'),
  ('Baños Pabellón 12',        'bathroom',     30, 45, '12'),
  ('Baños Pabellón 15',        'bathroom',     60, 60, '15'),
  ('Cafetería Central',        'cafe',         50, 70, '15'),
  ('Información',              'info',         50, 20, '10');
