-- ============================================================================
-- 0010 — K-Riders 스팟 DB (Phase 0: 수집 자산)
--
-- motorcycle_spots: 라이더 스팟 마스터 DB. 기존 motorcycle_route_stops(라이더가
-- 자기 루트에 입력하는 경유지, 개인 데이터)와 목적이 다르다 — 이쪽은 운영자가
-- 큐레이션하는 마스터 데이터로, 쓰기는 service role 전용(0001 routes 의
-- "관리자 큐레이션 콘텐츠" RLS 패턴), 익명 읽기는 status='active'만(Phase 1
-- 공개 대비).
--
-- 필드 사전의 단일 기준은 lib/motorcycle/spots/types.ts + constants.ts —
-- enum CHECK 값을 여기와 1:1 동기화한다(한쪽만 수정 금지, 0003 관례).
--
-- PostGIS 는 Phase 0 에서 도입 보류(운영자 결정) — 좌표는 기존 관례대로
-- lat/lng double precision 쌍만 저장한다. Phase 1 반경 검색이 필요해지면
-- 별도 마이그레이션으로 postgis + location geography 생성 컬럼을 추가한다.
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 이 파일 전체를 붙여넣고 Run.
-- ============================================================================

begin;

-- ── 테이블 ──────────────────────────────────────────────────────────────────

create table public.motorcycle_spots (
  id uuid primary key default gen_random_uuid(),

  -- 필수 6필드
  name text not null,
  category text not null
    constraint motorcycle_spots_category_check check (
      category in ('카페','전망포토','와인딩진입점','맛집','휴게쉼터','주유충전','정비','숙박','기타')
    ),
  lat double precision not null
    constraint motorcycle_spots_lat_check check (lat between -90 and 90),
  lng double precision not null
    constraint motorcycle_spots_lng_check check (lng between -180 and 180),
  region_sido text not null,
  source text not null
    constraint motorcycle_spots_source_check check (
      source in ('직접방문','크루추천','인스타','네이버','유튜브','기타')
    ),

  -- 선택 필드 (비워두고 나중에 보강)
  slug text,
  alt_name text,
  tags text[],
  address_road text,
  region_sigungu text,
  access_note text,
  road_surface text
    constraint motorcycle_spots_road_surface_check check (
      road_surface is null or road_surface in ('포장','일부비포장','비포장')
    ),
  parking_moto text
    constraint motorcycle_spots_parking_moto_check check (
      parking_moto is null or parking_moto in ('양호','보통','협소','불가')
    ),
  -- 와인딩 재미 등급(1~5) — 속도 지표가 아니다.
  winding_grade int
    constraint motorcycle_spots_winding_grade_check check (
      winding_grade is null or winding_grade between 1 and 5
    ),
  senior_friendly boolean,
  photo_spot boolean,
  photo_note text,
  best_season int[]
    constraint motorcycle_spots_best_season_check check (
      best_season is null or best_season <@ array[1,2,3,4,5,6,7,8,9,10,11,12]
    ),
  best_time text[]
    constraint motorcycle_spots_best_time_check check (
      best_time is null or best_time <@ array['일출','오전','오후','일몰','야간']
    ),
  stay_minutes int
    constraint motorcycle_spots_stay_minutes_check check (
      stay_minutes is null or stay_minutes > 0
    ),
  crowd_weekend text
    constraint motorcycle_spots_crowd_weekend_check check (
      crowd_weekend is null or crowd_weekend in ('한적','보통','붐빔')
    ),
  rating_personal int
    constraint motorcycle_spots_rating_personal_check check (
      rating_personal is null or rating_personal between 1 and 5
    ),
  verified boolean not null default false,
  source_url text,
  memo text,
  -- spot-photos 버킷의 Storage 경로 배열
  photos text[],
  status text not null default 'draft'
    constraint motorcycle_spots_status_check check (status in ('draft','active','hidden')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 인덱스 ──────────────────────────────────────────────────────────────────
-- slug 는 선택 필드(null 허용)이므로 partial unique — 채워진 것끼리만 유일.
create unique index motorcycle_spots_slug_key
  on public.motorcycle_spots (slug) where slug is not null;
create index motorcycle_spots_region_sido_idx on public.motorcycle_spots (region_sido);
create index motorcycle_spots_category_idx on public.motorcycle_spots (category);
create index motorcycle_spots_status_idx on public.motorcycle_spots (status);

-- ── updated_at 자동 갱신 트리거 ─────────────────────────────────────────────
-- 이 레포 첫 updated_at 트리거 — 기존 테이블들은 updated_at 컬럼 자체가 없어
-- 선례가 없다. 함수는 motorcycle_ 네임스페이스로 만들되 범용 구현이라
-- 이후 다른 테이블에도 재사용 가능.
create or replace function public.motorcycle_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger motorcycle_spots_touch_updated_at
  before update on public.motorcycle_spots
  for each row execute function public.motorcycle_touch_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- 쓰기 정책을 만들지 않는다 = insert/update/delete 는 service role 전용
-- (어드민 서버 코드만 가능 — 0001 routes 의 큐레이션 콘텐츠 패턴).
-- 일반 라이더 계정의 스팟 제보/쓰기는 Phase 1 스코프라 이번엔 열지 않는다.
alter table public.motorcycle_spots enable row level security;

create policy "Anyone can read active spots"
  on public.motorcycle_spots for select
  to anon, authenticated
  using (status = 'active');

-- ── Storage: spot-photos 버킷 ───────────────────────────────────────────────
-- public read(공개 URL 로 사진 서빙), 쓰기 정책 없음 = 업로드/삭제는
-- service role 전용(어드민 수집 폼의 서버 코드만 가능).
insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

-- 공개 버킷이라 public URL 접근은 정책 없이도 되지만, Storage API 를 통한
-- 목록/조회(list, download)도 허용되도록 select 정책을 명시해 둔다.
create policy "Public read spot photos"
  on storage.objects for select
  using (bucket_id = 'spot-photos');

commit;
