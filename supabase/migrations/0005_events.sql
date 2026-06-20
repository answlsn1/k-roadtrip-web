-- ============================================================
--  K-RoadTrip · 지역 가치 증거 레이어 — 이벤트 계측 테이블
--  지원금 심사·지자체 제안용 funnel 증거(외국인→지방→외화) 측정.
--  적용: Supabase SQL Editor에 붙여넣고 실행, 또는 `supabase db push`.
--  PII 저장 금지 — session_id는 브라우저별 랜덤 id, country/locale은 집계용.
-- ============================================================

create table public.events (
  id               uuid        primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  session_id       text,                                   -- 익명 세션 id (PII 아님)
  event_type       text        not null check (event_type in
                     ('region_view', 'route_view', 'plan_created',
                      'naver_handoff', 'affiliate_click')),
  region           text,                                   -- 지역명 (집계용)
  route_id         text,                                   -- 코스 식별자 (slug 또는 id)
  locale           text,                                   -- 사용자 언어 (navigator.language, 집계용)
  country          text,                                   -- 거친 국가코드 (Vercel geo, 집계용. PII 아님)
  affiliate_partner text,                                  -- affiliate_click 시 파트너 종류 (rental/flight 등)
  referrer         text
);

comment on table public.events is 'B2G/grant evidence funnel events — anonymous, no PII';
comment on column public.events.session_id is 'Anonymous per-browser random id (not PII)';
comment on column public.events.country is 'Coarse country code for aggregation (not PII)';

-- 집계 쿼리 패턴(타입·시간·지역·국가별)에 맞춘 인덱스
create index events_type_time_idx on public.events (event_type, created_at);
create index events_region_idx    on public.events (region, event_type);
create index events_country_idx   on public.events (country, event_type);
create index events_session_idx   on public.events (session_id);

-- ------------------------------------------------------------
-- RLS: 누구나 기록(anon insert)만 가능, 조회는 차단(서비스롤만 우회).
--   → 대시보드는 서버에서 service_role 키로만 집계 조회.
-- ------------------------------------------------------------
alter table public.events enable row level security;

create policy "anon insert events"
  on public.events for insert
  to anon, authenticated
  with check (true);
-- select 정책 없음 → anon/authenticated 조회 차단이 기본값(서비스롤만 읽음)
