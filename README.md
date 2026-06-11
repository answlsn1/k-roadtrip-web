# K-RoadTrip

Curated Korean road-trip courses for foreign travelers — explore on a Google
Map, navigate with one tap in Naver Map.

## Stack

Next.js (App Router) · Tailwind CSS · Supabase (PostgreSQL + Auth) ·
Google Maps JS API · Naver Map deep links (`nmap://`) · Vercel

## Setup

1. **Supabase**: create a free project, then run in the SQL Editor, in order:
   `supabase/migrations/0001…0004` → `supabase/seed.sql` → `supabase/seed_heritage.sql`
2. **Env**: copy `.env.example` to `.env.local` and fill the three keys.
3. **Run**: `npm install && npm run dev`

## Scripts

| command             | purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | local dev server                 |
| `npm run build`     | production build + type check    |
| `npm run typecheck` | `tsc --noEmit` only              |
| `npm run smoke`     | runtime tests for pure logic     |
