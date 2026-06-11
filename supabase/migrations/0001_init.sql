-- ============================================================
--  K-RoadTrip · Task 1: 지역 확장 DB 스키마 (Supabase/PostgreSQL)
--  적용 방법: Supabase Dashboard → SQL Editor에 붙여넣고 실행
--            또는 supabase CLI: `supabase db push`
-- ============================================================

-- ------------------------------------------------------------
-- 1. routes — 로드트립 전체 코스
-- ------------------------------------------------------------
create table public.routes (
  id              bigint generated always as identity primary key,
  slug            text        not null unique,            -- URL용: /routes/gangneung-coastal-drive
  region_name_en  text        not null,                   -- 'Gangneung' | 'Gyeongju' | 'Jeju' | 'Busan' ...
  region_name_ko  text,                                   -- '강릉' — KOR 모드 UI용
  title_en        text        not null,
  title_ko        text,
  description_en  text,
  description_ko  text,
  total_distance  numeric(6,1),                           -- km
  total_duration  integer,                                -- 순수 주행 시간(분)
  theme_tags      text[]      not null default '{}',      -- {'coastal','coffee','kpop'}
  thumbnail_url   text,
  is_published    boolean     not null default true,      -- 작성 중 코스 숨김용
  created_at      timestamptz not null default now()
);

comment on table  public.routes is 'Road-trip courses, one row per curated regional course';
comment on column public.routes.slug is 'Stable URL key — never change after publish';
comment on column public.routes.total_duration is 'Pure driving minutes between waypoints (sightseeing time excluded)';

-- 지역 필터링이 1순위 쿼리 패턴이므로 인덱스 필수
create index routes_region_idx     on public.routes (region_name_en);
create index routes_theme_tags_idx on public.routes using gin (theme_tags);

-- ------------------------------------------------------------
-- 2. waypoints — 코스에 포함된 세부 경유지
-- ------------------------------------------------------------
create table public.waypoints (
  id              bigint generated always as identity primary key,
  route_id        bigint  not null references public.routes (id) on delete cascade,
  sequence        integer not null check (sequence >= 1), -- 방문 순서 (1부터)
  place_name_en   text    not null,
  place_name_ko   text    not null,                       -- 네이버 딥링크 dname용 정확한 한글 상호
  latitude        double precision not null check (latitude  between -90  and 90),
  longitude       double precision not null check (longitude between -180 and 180),
  description_en  text,
  description_ko  text,
  type_tag        text    not null,                       -- 'cafe' | 'restaurant' | 'bakery' | 'sights'

  -- ▼ Local Intel — 기존 MVP에서 검증된 차별화 필드 (r/koreatravel 리서치 반영)
  address_en      text,
  address_ko      text,                                   -- 주소 복사 기능(택시/네이버 붙여넣기)용
  rating          numeric(2,1) check (rating between 0 and 5),
  review_count    integer      check (review_count >= 0), -- 별점보다 신뢰받는 지표
  parking_note_en text,
  parking_note_ko text,
  booking_note_en text,
  booking_note_ko text,

  unique (route_id, sequence)                             -- 한 코스 안에서 순서 중복 방지
);

comment on table  public.waypoints is 'Ordered stops belonging to a route';
comment on column public.waypoints.place_name_ko is 'Exact Korean name — passed to Naver Map deep link (dname) and favorites batch-copy';
comment on column public.waypoints.review_count is 'Local review volume — the trust signal we rank by (not star rating)';

create index waypoints_route_idx on public.waypoints (route_id, sequence);
create index waypoints_type_idx  on public.waypoints (type_tag);

-- ------------------------------------------------------------
-- 3. RLS — 공개 콘텐츠는 읽기 전용 (Supabase 필수 설정)
--    쓰기는 service_role(관리자/시드 스크립트)만 가능
-- ------------------------------------------------------------
alter table public.routes    enable row level security;
alter table public.waypoints enable row level security;

create policy "Anyone can read published routes"
  on public.routes for select
  using (is_published);

create policy "Anyone can read waypoints of published routes"
  on public.waypoints for select
  using (exists (
    select 1 from public.routes r
    where r.id = route_id and r.is_published
  ));
