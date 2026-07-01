-- ============================================================
--  K-Riders (motorcycle) — 메인 K-RoadTrip 과 분리된 별도 서비스.
--  회원가입/로그인(Supabase Auth 재사용) + 라이더 프로필 + 루트 기록·
--  공유 + 실시간 채팅(단일 라운지, V1).
--  테이블명은 전부 motorcycle_ 접두사로 기존 routes/waypoints(자동차)와
--  충돌 방지. RLS 항상 ON(CLAUDE.md §5).
-- ============================================================

-- ── 라이더 프로필 (auth.users 1:1) ───────────────────────────
create table public.motorcycle_profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  nickname   text        not null,
  bike_model text,
  created_at timestamptz not null default now()
);

alter table public.motorcycle_profiles enable row level security;

create policy "Anyone can view rider profiles"
  on public.motorcycle_profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.motorcycle_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.motorcycle_profiles for update
  using (auth.uid() = id);

-- ── 루트(라이딩 기록) ─────────────────────────────────────────
create table public.motorcycle_routes (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  title        text        not null,
  description  text,
  region       text,
  distance_km  numeric,
  is_public    boolean     not null default true,
  created_at   timestamptz not null default now()
);

create index motorcycle_routes_public_idx
  on public.motorcycle_routes (is_public, created_at desc);
create index motorcycle_routes_user_idx
  on public.motorcycle_routes (user_id, created_at desc);

alter table public.motorcycle_routes enable row level security;

create policy "Anyone can view public routes, owners can view their own"
  on public.motorcycle_routes for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can create their own routes"
  on public.motorcycle_routes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own routes"
  on public.motorcycle_routes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own routes"
  on public.motorcycle_routes for delete
  using (auth.uid() = user_id);

-- ── 루트 경유지(스톱) ─────────────────────────────────────────
create table public.motorcycle_route_stops (
  id        uuid              primary key default gen_random_uuid(),
  route_id  uuid              not null references public.motorcycle_routes (id) on delete cascade,
  sequence  int               not null,
  name      text              not null,
  latitude  double precision  not null,
  longitude double precision  not null,
  note      text
);

create index motorcycle_route_stops_route_idx
  on public.motorcycle_route_stops (route_id, sequence);

alter table public.motorcycle_route_stops enable row level security;

create policy "Stops visible if the parent route is visible"
  on public.motorcycle_route_stops for select
  using (
    exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Owners can add stops to their own routes"
  on public.motorcycle_route_stops for insert
  with check (
    exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and r.user_id = auth.uid()
    )
  );

create policy "Owners can delete stops from their own routes"
  on public.motorcycle_route_stops for delete
  using (
    exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and r.user_id = auth.uid()
    )
  );

-- ── 실시간 채팅(단일 라운지, V1 — 로그인 사용자만 읽기/쓰기) ──
create table public.motorcycle_chat_messages (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  nickname   text        not null,
  body       text        not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index motorcycle_chat_messages_time_idx
  on public.motorcycle_chat_messages (created_at desc);

alter table public.motorcycle_chat_messages enable row level security;

create policy "Logged-in riders can read the lounge"
  on public.motorcycle_chat_messages for select
  using (auth.role() = 'authenticated');

create policy "Logged-in riders can post to the lounge"
  on public.motorcycle_chat_messages for insert
  with check (auth.uid() = user_id);

-- Realtime: 채팅 메시지 INSERT 를 구독자에게 브로드캐스트(Supabase 무료 티어).
alter publication supabase_realtime add table public.motorcycle_chat_messages;
