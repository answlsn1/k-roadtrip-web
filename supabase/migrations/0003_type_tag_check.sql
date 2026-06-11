-- ============================================================
--  K-RoadTrip · Refactor ①: type_tag 어휘 봉인
--  lib/constants.ts의 TYPE_TAGS 레지스트리와 1:1 — 한쪽만 수정 금지
-- ============================================================

alter table public.waypoints
  add constraint waypoints_type_tag_check
  check (type_tag in
    ('cafe', 'restaurant', 'bakery', 'sights',
     'heritage', 'scenic', 'hanok_cafe', 'landmark',
     'beach', 'rest_area'));
