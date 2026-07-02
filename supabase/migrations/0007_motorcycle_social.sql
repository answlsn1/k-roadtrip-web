-- ============================================================
--  K-Riders P1 — 소셜 레이어(좋아요·댓글·팔로우) + 주행 기록 확장.
--  REVER 벤치마크(MOTORCYCLE-ROADMAP.md) 기반. RLS 항상 ON.
--  실행 전제: 0006_motorcycle_riders.sql 적용 완료 상태.
-- ============================================================

-- ── 프로필 확장: 자기소개 ─────────────────────────────────────
alter table public.motorcycle_profiles
  add column if not exists bio text;

-- ── 루트 확장: 기록 주행 트랙 + 주행 시간 ─────────────────────
-- track_points: 주행 기록 모드가 남기는 GPS 폴리라인 [[lat,lng],...].
-- 수동 작성 루트는 null(경유지 직선 연결로 표시).
alter table public.motorcycle_routes
  add column if not exists track_points jsonb,
  add column if not exists duration_min integer;

-- ── 좋아요 ───────────────────────────────────────────────────
create table public.motorcycle_route_likes (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  route_id   uuid        not null references public.motorcycle_routes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, route_id)
);

create index motorcycle_route_likes_route_idx
  on public.motorcycle_route_likes (route_id);

alter table public.motorcycle_route_likes enable row level security;

create policy "Likes visible if the route is visible"
  on public.motorcycle_route_likes for select
  using (
    exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Users can like visible routes"
  on public.motorcycle_route_likes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Users can remove their own likes"
  on public.motorcycle_route_likes for delete
  using (auth.uid() = user_id);

-- ── 댓글 ─────────────────────────────────────────────────────
-- nickname 은 채팅과 동일하게 비정규화(조회 단순화 — V1 트레이드오프).
create table public.motorcycle_route_comments (
  id         uuid        primary key default gen_random_uuid(),
  route_id   uuid        not null references public.motorcycle_routes (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  nickname   text        not null,
  body       text        not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index motorcycle_route_comments_route_idx
  on public.motorcycle_route_comments (route_id, created_at);

alter table public.motorcycle_route_comments enable row level security;

create policy "Comments visible if the route is visible"
  on public.motorcycle_route_comments for select
  using (
    exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Users can comment on visible routes"
  on public.motorcycle_route_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.motorcycle_routes r
      where r.id = route_id and (r.is_public = true or r.user_id = auth.uid())
    )
  );

create policy "Users can delete their own comments"
  on public.motorcycle_route_comments for delete
  using (auth.uid() = user_id);

-- ── 팔로우 ───────────────────────────────────────────────────
create table public.motorcycle_follows (
  follower_id  uuid        not null references auth.users (id) on delete cascade,
  following_id uuid        not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint motorcycle_follows_no_self check (follower_id <> following_id)
);

create index motorcycle_follows_following_idx
  on public.motorcycle_follows (following_id);

alter table public.motorcycle_follows enable row level security;

create policy "Anyone can view follow relations"
  on public.motorcycle_follows for select
  using (true);

create policy "Users can follow others"
  on public.motorcycle_follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.motorcycle_follows for delete
  using (auth.uid() = follower_id);
