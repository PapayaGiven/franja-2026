-- =============================================================
-- FRANJA 2026 — initial schema
-- =============================================================

create extension if not exists "uuid-ossp";

-- TRACKS (4 physical rooms = 4 tracks)
create table tracks (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  color       text not null,
  display_order int not null default 0,
  created_at  timestamptz default now()
);

-- AREAS (academic areas for filtering: Contactología, Baja Visión, etc.)
create table areas (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  color       text,
  created_at  timestamptz default now()
);

-- SPEAKERS (130 ponentes)
create table speakers (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  full_name    text not null,
  photo_url    text,
  country      text,
  country_code text,
  specialty    text,
  institution  text,
  credentials  text,
  bio          text,
  website      text,
  linkedin     text,
  instagram    text,
  is_featured  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- SYMPOSIUMS (includes simposios, talleres, special events)
create table symposiums (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  kind              text not null check (kind in ('symposium','taller','special','business_hour')),
  generic_category  text,
  official_name     text not null,
  subtitle          text,
  description       text,
  track_id          uuid references tracks(id) on delete set null,
  area_id           uuid references areas(id) on delete set null,
  day               date not null,
  start_time        time not null,
  end_time          time not null,
  is_exclusive      boolean default false,
  exclusive_org     text,
  sponsor_brand     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index idx_symposiums_day on symposiums(day);
create index idx_symposiums_track on symposiums(track_id);
create index idx_symposiums_area on symposiums(area_id);

-- SYMPOSIUM <-> SPEAKERS (director, moderator, speaker)
create table symposium_speakers (
  symposium_id uuid references symposiums(id) on delete cascade,
  speaker_id   uuid references speakers(id) on delete cascade,
  role         text not null check (role in ('director','moderator','speaker')),
  display_order int default 0,
  primary key (symposium_id, speaker_id, role)
);

-- CONFERENCES (individual talks inside a symposium — populated later)
create table conferences (
  id           uuid primary key default uuid_generate_v4(),
  symposium_id uuid references symposiums(id) on delete cascade,
  title        text not null,
  start_time   time,
  duration_min int,
  display_order int default 0,
  created_at   timestamptz default now()
);

create table conference_speakers (
  conference_id uuid references conferences(id) on delete cascade,
  speaker_id    uuid references speakers(id) on delete cascade,
  primary key (conference_id, speaker_id)
);

-- EXHIBITORS (~120 brands)
create table exhibitor_categories (
  id    uuid primary key default uuid_generate_v4(),
  slug  text unique not null,
  name  text not null,
  display_order int default 0
);

create table exhibitors (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  logo_url      text,
  country       text,
  booth_number  text,
  pabellón      text,
  category_id   uuid references exhibitor_categories(id) on delete set null,
  description   text,
  website       text,
  whatsapp      text,
  email         text,
  instagram     text,
  is_sponsor    boolean default false,
  sponsor_tier  text,
  map_x         numeric,
  map_y         numeric,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index idx_exhibitors_category on exhibitors(category_id);
create index idx_exhibitors_sponsor on exhibitors(is_sponsor) where is_sponsor = true;

-- ORGANIZATIONS (ASOSAVIN, ORTOS, ALDOO, universities)
create table organizations (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  acronym     text,
  type        text,
  description text,
  logo_url    text,
  website     text,
  created_at  timestamptz default now()
);

-- ANNOUNCEMENTS (banners + news feed)
create table announcements (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  body            text,
  image_url       text,
  severity        text not null default 'info' check (severity in ('info','success','warning','urgent')),
  show_as_banner  boolean default false,
  show_in_feed    boolean default true,
  is_pinned       boolean default false,
  action_url      text,
  action_label    text,
  scheduled_for   timestamptz default now(),
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

create index idx_announcements_active on announcements(scheduled_for, expires_at);

-- MAP POIs
create table map_pois (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  type      text not null check (type in ('bathroom','cafe','registration','networking','info','entrance','room','stage')),
  x         numeric not null,
  y         numeric not null,
  pabellón  text,
  icon      text
);

-- HOTELS
create table hotels (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  name            text not null,
  address         text,
  distance_km     numeric,
  walking_minutes int,
  image_url       text,
  contact_phone   text,
  contact_email   text,
  preferred_rate  text,
  booking_url     text,
  perks           text[]
);

-- NEWS POSTS
create table news_posts (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body_md      text,
  cover_image  text,
  author       text,
  published_at timestamptz default now(),
  tags         text[]
);

-- FAQ
create table faq (
  id        uuid primary key default uuid_generate_v4(),
  question  text not null,
  answer    text not null,
  category  text,
  display_order int default 0
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
-- Public read on everything. Writes only via service role (admin).

alter table tracks enable row level security;
alter table areas enable row level security;
alter table speakers enable row level security;
alter table symposiums enable row level security;
alter table symposium_speakers enable row level security;
alter table conferences enable row level security;
alter table conference_speakers enable row level security;
alter table exhibitor_categories enable row level security;
alter table exhibitors enable row level security;
alter table organizations enable row level security;
alter table announcements enable row level security;
alter table map_pois enable row level security;
alter table hotels enable row level security;
alter table news_posts enable row level security;
alter table faq enable row level security;

-- Public read policies
create policy "public read" on tracks for select using (true);
create policy "public read" on areas for select using (true);
create policy "public read" on speakers for select using (true);
create policy "public read" on symposiums for select using (true);
create policy "public read" on symposium_speakers for select using (true);
create policy "public read" on conferences for select using (true);
create policy "public read" on conference_speakers for select using (true);
create policy "public read" on exhibitor_categories for select using (true);
create policy "public read" on exhibitors for select using (true);
create policy "public read" on organizations for select using (true);
create policy "public read" on announcements for select using (
  scheduled_for <= now()
  and (expires_at is null or expires_at > now())
);
create policy "public read" on map_pois for select using (true);
create policy "public read" on hotels for select using (true);
create policy "public read" on news_posts for select using (
  published_at <= now()
);
create policy "public read" on faq for select using (true);

-- Authenticated write policies (admin only — single user)
create policy "authed all" on tracks for all using (auth.role() = 'authenticated');
create policy "authed all" on areas for all using (auth.role() = 'authenticated');
create policy "authed all" on speakers for all using (auth.role() = 'authenticated');
create policy "authed all" on symposiums for all using (auth.role() = 'authenticated');
create policy "authed all" on symposium_speakers for all using (auth.role() = 'authenticated');
create policy "authed all" on conferences for all using (auth.role() = 'authenticated');
create policy "authed all" on conference_speakers for all using (auth.role() = 'authenticated');
create policy "authed all" on exhibitor_categories for all using (auth.role() = 'authenticated');
create policy "authed all" on exhibitors for all using (auth.role() = 'authenticated');
create policy "authed all" on organizations for all using (auth.role() = 'authenticated');
create policy "authed all" on announcements for all using (auth.role() = 'authenticated');
create policy "authed all" on map_pois for all using (auth.role() = 'authenticated');
create policy "authed all" on hotels for all using (auth.role() = 'authenticated');
create policy "authed all" on news_posts for all using (auth.role() = 'authenticated');
create policy "authed all" on faq for all using (auth.role() = 'authenticated');

-- Enable realtime on announcements (banners appear live)
alter publication supabase_realtime add table announcements;
