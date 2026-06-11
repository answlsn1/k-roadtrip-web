-- ============================================================
--  K-RoadTrip · Refactor ③: B2G 익명 이벤트 로그
--  지자체 어필용 핵심 데이터: 지역별 조회→내비 실행 전환 퍼널.
--  PII 없음 (session_key = 브라우저별 랜덤 id).
-- ============================================================

create table public.route_events (
  id              bigint generated always as identity primary key,
  event_type      text   not null check (event_type in
                    ('route_view', 'deeplink_launch', 'route_save', 'waypoint_open')),
  route_id        bigint references public.routes (id) on delete set null,
  region_name_en  text,            -- 빠른 지역별 집계용 비정규화 컬럼
  lang            text,            -- navigator.language (유저 언어 분포)
  country         text,            -- Vercel x-vercel-ip-country (서버에서 채움, 클라이언트는 null)
  session_key     text,            -- 익명 세션 식별자 (PII 아님)
  created_at      timestamptz not null default now()
);

create index route_events_region_idx on public.route_events (region_name_en, event_type, created_at);
create index route_events_route_idx  on public.route_events (route_id, created_at);

-- RLS: 누구나 기록 가능, 클라이언트 조회는 불가 (집계는 service_role 대시보드에서)
alter table public.route_events enable row level security;

create policy "Anyone can log events"
  on public.route_events for insert
  with check (true);
-- select 정책 없음 → anon/authenticated 조회 차단이 기본값
