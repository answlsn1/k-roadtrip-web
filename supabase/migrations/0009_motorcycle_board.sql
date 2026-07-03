-- ============================================================
--  K-Riders 라이더챗 게시판 + 스팸 방어.
--  ① 네이버 카페식 게시판(말머리·제목·본문·댓글·좋아요) — 글은
--     비로그인도 읽기 가능(오픈웹 SEO, TRAFFIC-STRATEGY §1-2).
--  ② 신고(report) 테이블 — 운영자는 service role 로 열람.
--  ③ 도배 방지: RESTRICTIVE RLS 정책으로 DB 레벨 강제
--     (클라이언트 검사는 우회 가능하므로 여기가 진짜 방어선).
--     기존 테이블(채팅·루트·루트댓글)에도 소급 적용.
--  실행 전제: 0008 적용 완료.
-- ============================================================

-- ── 게시글 ───────────────────────────────────────────────────
create table public.motorcycle_posts (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  nickname   text        not null,
  category   text        not null check (category in ('chat', 'question', 'info', 'meetup', 'gear')),
  title      text        not null check (char_length(title) between 2 and 100),
  body       text        not null check (char_length(body) between 2 and 5000),
  created_at timestamptz not null default now()
);

create index motorcycle_posts_time_idx on public.motorcycle_posts (created_at desc);
create index motorcycle_posts_user_time_idx on public.motorcycle_posts (user_id, created_at desc);
create index motorcycle_posts_category_idx on public.motorcycle_posts (category, created_at desc);

alter table public.motorcycle_posts enable row level security;

create policy "Anyone can read posts"
  on public.motorcycle_posts for select
  using (true);

create policy "Riders can write their own posts"
  on public.motorcycle_posts for insert
  with check (auth.uid() = user_id);

create policy "Authors can delete their own posts"
  on public.motorcycle_posts for delete
  using (auth.uid() = user_id);

-- 도배 방지(RESTRICTIVE — 위 permissive 와 AND 로 결합):
--   ① 글 간격 최소 2분 ② 24시간 15개 상한 ③ 동일 본문 24시간 내 재등록 금지
create policy "Post spam guard"
  on public.motorcycle_posts
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_posts prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '2 minutes'
    )
    and (
      select count(*) from public.motorcycle_posts prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '24 hours'
    ) < 15
    and not exists (
      select 1 from public.motorcycle_posts prev
      where prev.user_id = auth.uid()
        and prev.body = motorcycle_posts.body
        and prev.created_at > now() - interval '24 hours'
    )
  );

-- ── 게시글 댓글 ──────────────────────────────────────────────
create table public.motorcycle_post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.motorcycle_posts (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  nickname   text        not null,
  body       text        not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index motorcycle_post_comments_post_idx on public.motorcycle_post_comments (post_id, created_at);
create index motorcycle_post_comments_user_time_idx on public.motorcycle_post_comments (user_id, created_at desc);

alter table public.motorcycle_post_comments enable row level security;

create policy "Anyone can read post comments"
  on public.motorcycle_post_comments for select
  using (true);

create policy "Riders can write their own post comments"
  on public.motorcycle_post_comments for insert
  with check (auth.uid() = user_id);

create policy "Authors can delete their own post comments"
  on public.motorcycle_post_comments for delete
  using (auth.uid() = user_id);

-- 댓글 도배 방지: 간격 10초 + 동일 내용 10분 내 반복 금지 + 24시간 200개 상한
create policy "Post comment spam guard"
  on public.motorcycle_post_comments
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_post_comments prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '10 seconds'
    )
    and not exists (
      select 1 from public.motorcycle_post_comments prev
      where prev.user_id = auth.uid()
        and prev.body = motorcycle_post_comments.body
        and prev.created_at > now() - interval '10 minutes'
    )
    and (
      select count(*) from public.motorcycle_post_comments prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '24 hours'
    ) < 200
  );

-- ── 게시글 좋아요 ────────────────────────────────────────────
create table public.motorcycle_post_likes (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  post_id    uuid        not null references public.motorcycle_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index motorcycle_post_likes_post_idx on public.motorcycle_post_likes (post_id);

alter table public.motorcycle_post_likes enable row level security;

create policy "Anyone can read post likes"
  on public.motorcycle_post_likes for select
  using (true);

create policy "Riders can like posts"
  on public.motorcycle_post_likes for insert
  with check (auth.uid() = user_id);

create policy "Riders can remove their own post likes"
  on public.motorcycle_post_likes for delete
  using (auth.uid() = user_id);

-- ── 신고 ─────────────────────────────────────────────────────
-- 본인 신고 내역만 조회 가능(중복 신고 방지용) — 운영자 열람은 service role.
create table public.motorcycle_reports (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  target_type text        not null check (target_type in ('post', 'post_comment', 'route', 'route_comment', 'chat')),
  target_id   uuid        not null,
  reason      text        check (reason is null or char_length(reason) <= 300),
  created_at  timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index motorcycle_reports_target_idx on public.motorcycle_reports (target_type, target_id);

alter table public.motorcycle_reports enable row level security;

create policy "Users can view their own reports"
  on public.motorcycle_reports for select
  using (auth.uid() = user_id);

create policy "Users can file reports"
  on public.motorcycle_reports for insert
  with check (auth.uid() = user_id);

create policy "Report spam guard"
  on public.motorcycle_reports
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_reports prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '1 minute'
    )
    and (
      select count(*) from public.motorcycle_reports prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '24 hours'
    ) < 20
  );

-- ── 기존 테이블 소급 도배 방지 ───────────────────────────────

-- 채팅: 간격 3초 + 동일 내용 2분 내 반복 금지
create index motorcycle_chat_messages_user_time_idx
  on public.motorcycle_chat_messages (user_id, created_at desc);

create policy "Chat spam guard"
  on public.motorcycle_chat_messages
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_chat_messages prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '3 seconds'
    )
    and not exists (
      select 1 from public.motorcycle_chat_messages prev
      where prev.user_id = auth.uid()
        and prev.body = motorcycle_chat_messages.body
        and prev.created_at > now() - interval '2 minutes'
    )
  );

-- 루트 댓글: 간격 10초 + 동일 내용 10분 내 반복 금지
create index motorcycle_route_comments_user_time_idx
  on public.motorcycle_route_comments (user_id, created_at desc);

create policy "Route comment spam guard"
  on public.motorcycle_route_comments
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_route_comments prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '10 seconds'
    )
    and not exists (
      select 1 from public.motorcycle_route_comments prev
      where prev.user_id = auth.uid()
        and prev.body = motorcycle_route_comments.body
        and prev.created_at > now() - interval '10 minutes'
    )
  );

-- 루트 등록: 간격 1분 + 24시간 30개 상한
create policy "Route spam guard"
  on public.motorcycle_routes
  as restrictive for insert to authenticated
  with check (
    not exists (
      select 1 from public.motorcycle_routes prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '1 minute'
    )
    and (
      select count(*) from public.motorcycle_routes prev
      where prev.user_id = auth.uid()
        and prev.created_at > now() - interval '24 hours'
    ) < 30
  );
