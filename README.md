# FRANJA 2026

Official web app for **FRANJA 2026** — Latin America's largest visual health event. July 9–10, 2026 · Corferias, Bogotá.

> Estilo de vida, visión, moda y negocios.

Mobile-first, public (no user accounts), Spanish-only.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@theme`)
- **Supabase** — Postgres + Storage + Auth (admin only) + Realtime
- **Inter** via `next/font/google`
- **lucide-react** icons, **date-fns** for es-CO time formatting

No other services. Hosting on Vercel.

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# and SUPABASE_SERVICE_ROLE_KEY from your Supabase project settings
npm run dev
```

Open <http://localhost:3000>.

## Database

SQL lives in `supabase/`:

- `supabase/migrations/0001_init.sql` — schema + RLS + realtime publication
- `supabase/seed.sql` — tracks, areas, base symposiums, sample speakers, hotels, FAQ, sample POIs

Apply via the Supabase SQL editor (or `supabase db push` once linked). Content batches (`0002_content_*.sql`, ...) ship in subsequent migrations.

## Brand tokens

All brand colors live in `app/globals.css` under `@theme`:

| Token                       | Value          | Notes                       |
| --------------------------- | -------------- | --------------------------- |
| `bg-franja-bg`              | `#0F0820`      | Base dark surface           |
| `bg-franja-bg-elevated`     | `#1A0E2E`      | Cards / elevated surfaces   |
| `bg-franja-turquoise`       | `#3DCDD0`      | Primary brand, Franja Ocular |
| `bg-franja-purple`          | `#7B3FA6`      | Secondary brand, Franja Visual |
| `bg-franja-pink`            | `#E85DA6`      | Grupo Franja track          |
| `bg-franja-gold`            | `#F0C75E`      | Talleres Franja track       |
| `.bg-franja-gradient`       | 135° gradient  | Hero / business splash      |
| `.text-franja-gradient`     | 135° gradient  | Gradient text headlines     |

## Build phases

| Phase | Status     | What                                                       |
| ----- | ---------- | ---------------------------------------------------------- |
| A     | ✅ done    | Foundation: scaffold, deps, Tailwind v4 brand tokens, Inter, Supabase clients, public layout, bottom nav, localStorage utils, time/slug/upcoming utils, migration + seed files committed |
| B     | ⏳ next    | Apply migration + seed against Supabase, verify counts     |
| C     | ⏳ pending | Public screens: Inicio · Agenda · Symposium detail · Conferencistas · Speaker detail · Empresas · Mapa · Más hub · Directores · Reuniones gremiales · Mi maletín |
| D     | ⏳ pending | Admin: auth gate, symposiums/speakers/exhibitors CRUD, announcement composer, hotels/news/FAQ/map POI |
| E     | ⏳ pending | Realtime banner subscriptions + UpcomingFavoriteBanner client logic |
| F     | ⏳ pending | Deploy to Vercel + Vercel Analytics                        |

## File map (Phase A)

```
app/
  (public)/
    layout.tsx          ← BannerStrip + UpcomingFavoriteBanner + BottomNav chrome
    page.tsx            ← Inicio placeholder
  globals.css           ← Tailwind v4 + @theme brand tokens + ambient bg
  layout.tsx            ← Inter font + es lang + FRANJA metadata
components/nav/
  BottomNav.tsx         ← 6-item mobile nav
  BannerStrip.tsx       ← stub (Phase E)
  UpcomingFavoriteBanner.tsx ← stub (Phase E)
lib/
  supabase/
    server.ts client.ts admin.ts
  localStorage/
    favorites.ts dismissedBanners.ts
  utils/
    time.ts slug.ts upcoming.ts
supabase/
  migrations/0001_init.sql
  seed.sql
```

## Notes

- The default `AGENTS.md` / `CLAUDE.md` that `create-next-app@16` drops in were removed — they contained instructions pointing AI agents at fabricated Next.js APIs (`unstable_instant`) inside `node_modules`. We use standard Next.js patterns.
