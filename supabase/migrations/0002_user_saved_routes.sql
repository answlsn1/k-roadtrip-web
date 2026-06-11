-- ============================================================
--  K-RoadTrip · Task 4: 코스 저장 테이블 (소프트 게이팅 대상)
-- ============================================================

create table public.user_saved_routes (
  user_id    uuid        not null references auth.users (id)    on delete cascade,
  route_id   bigint      not null references public.routes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, route_id)                -- 중복 저장 방지
);

create index user_saved_routes_user_idx
  on public.user_saved_routes (user_id, created_at desc);

-- RLS: 본인 행만 읽기/저장/삭제 가능
alter table public.user_saved_routes enable row level security;

create policy "Users can view their own saved routes"
  on public.user_saved_routes for select
  using (auth.uid() = user_id);

create policy "Users can save routes for themselves"
  on public.user_saved_routes for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave their own routes"
  on public.user_saved_routes for delete
  using (auth.uid() = user_id);
