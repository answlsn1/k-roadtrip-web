-- ============================================================
--  K-RoadTrip · Curated v2 시드 — 신규 큐레이션 루트 5개
--  실행 순서: 0001_init.sql + 0003_type_tag_check.sql 적용 후 실행
--  (seed.sql / seed_heritage.sql 와 독립)
--
--  적용 방법: Supabase Dashboard → SQL Editor 에 이 파일 전체를 붙여넣고 Run.
--  안전성: 트랜잭션으로 감싸고, slug / (route_id,sequence) 충돌 시 skip.
--          → 같은 파일을 두 번 실행해도 중복 INSERT 안 됨 (idempotent).
--
--  좌표 출처: OpenStreetMap Nominatim 지오코딩으로 실측 (2026-06, krt-seed/1.0).
--    모두 한국 범위(위도 33~39 / 경도 124~132) sanity check 통과.
--    개별 좌표·주의사항은 각 루트 주석 참조.
--  별점/리뷰수/주소/운영시간: 검증 데이터 없음 → 전부 NULL (가짜 수치 금지).
--  thumbnail_url: 전부 curl -sI HTTP 200 확인된 Unsplash 핫링크.
--    R1·R2 는 한국 풍경 사진(검증), R3·R4·R5 는 기존 시드의 검증된 URL 재사용(TEMP).
-- ============================================================

begin;

-- ------------------------------------------------------------
-- ROUTES (5) — Curated v2
--   total_distance / total_duration 은 지오코딩 좌표 기반 추정치
--   (직선거리 × 1.3 도로계수, 평균 50km/h 가정). 실측 아님 — 운영 중 보정 권장.
-- ------------------------------------------------------------
insert into public.routes
  (slug, region_name_en, region_name_ko, title_en, title_ko, description_en, description_ko,
   total_distance, total_duration, theme_tags, thumbnail_url, is_published)
values
  ('misty-tea-roads', 'Boseong', '보성',
   'Misty Tea Roads', '안개 어린 차밭 길',
   'Green tea terraces, reed wetlands and a bamboo forest — Korea''s slow, green south.',
   '초록 차밭과 갈대 습지, 대숲까지 — 천천히 흐르는 남도의 초록.',
   150.7, 181, array['tea','slow','forest','scenic'],
   -- region-specific Korean photo (Jeju green-tea field) — verified HTTP 200
   'https://images.unsplash.com/photo-1668755930355-3d89aa8b4c8b?auto=format&fit=crop&w=1400&q=80',
   true),

  ('south-sea-island-hop', 'Tongyeong', '통영',
   'South Sea Island Hop', '남해, 섬과 섬 사이',
   'Terraced sea-villages, island gardens and cable-car views across the Hallyeo waterway.',
   '다랭이마을과 섬 정원, 케이블카 전망까지 — 한려수도를 잇는 바다 종주.',
   113.0, 136, array['coastal','island','scenic','seafood'],
   -- region-specific Korean photo (Jeju Udo coast & cliff) — verified HTTP 200
   'https://images.unsplash.com/photo-1730898652585-bda492ae1b41?auto=format&fit=crop&w=1400&q=80',
   true),

  ('danyang-river-cliffs', 'Danyang', '단양',
   'Cliff & River Country', '강과 절벽의 나라',
   'River peaks, a clifftop skywalk and a limestone cave — inland Korea at its most dramatic.',
   '강 위 봉우리와 절벽 스카이워크, 석회 동굴까지 — 내륙의 가장 드라마틱한 풍경.',
   41.2, 49, array['river','cliff','nature','scenic'],
   -- TEMP thumbnail (swap for region-specific Korean photo)
   'https://images.unsplash.com/photo-1562680802-9cf8b15f419d?auto=format&fit=crop&w=1400&q=80',
   true),

  ('west-coast-sunset-line', 'Taean', '태안',
   'West Coast Sunset Line', '노을이 지는 끝',
   'A tidal hermitage, a walled town and coastal dunes — the West Sea remembered in sunset.',
   '갯벌 위 암자와 읍성, 해안 사구까지 — 노을로 기억되는 서해안.',
   124.1, 149, array['coastal','sunset','slow','scenic'],
   -- TEMP thumbnail (swap for region-specific Korean photo)
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
   true),

  ('jeongseon-snow-highlands', 'Jeongseon', '정선',
   'Snow & Steel Highlands', '눈과 철길의 고원',
   'Clifftop skywalks, old rail lines and the highest station — Korea''s Baekdudaegan highlands.',
   '절벽 전망대와 옛 철길, 가장 높은 기차역까지 — 백두대간 고원을 가로지르다.',
   93.1, 112, array['mountain','railway','scenic','retro'],
   -- TEMP thumbnail (swap for region-specific Korean photo)
   'https://images.unsplash.com/photo-1700061036086-414b47f08913?auto=format&fit=crop&w=1400&q=80',
   true)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- WAYPOINTS · Route 1 — Boseong / misty-tea-roads (4)
--   Nominatim 실측 좌표:
--     1 대한다원(보성 녹차밭, 녹차로 763) 34.7158, 127.0779
--     2 순천만습지                         34.8866, 127.5074
--     3 낙안읍성(낙안면 일대)               34.9057, 127.3430  ※ 마을 footprint 내 지점
--     4 죽녹원(담양 향교리)                 35.3286, 126.9855
--   rating/review_count/주소/운영시간 = 검증 데이터 없음 → NULL/미입력.
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag)
values
  ((select id from public.routes where slug = 'misty-tea-roads'), 1,
   'Boseong Daehan Tea Plantation', '보성 대한다원', 34.7158, 127.0779,
   'Tiered emerald terraces climbing the hillside — the symbol of Korean green tea.',
   '계단식 초록 차밭, 한국 녹차의 상징.',
   'scenic'),

  ((select id from public.routes where slug = 'misty-tea-roads'), 2,
   'Suncheonman Bay Wetland', '순천만습지', 34.8866, 127.5074,
   'Vast reed beds and migratory birds — the slow, breathing nature of the south.',
   '갈대밭과 철새, 남도의 느린 자연.',
   'scenic'),

  ((select id from public.routes where slug = 'misty-tea-roads'), 3,
   'Naganeupseong Folk Village', '낙안읍성', 34.9057, 127.3430,
   'A living Joseon walled town of thatched roofs where village life still goes on.',
   '초가지붕이 살아 있는 조선 읍성 마을.',
   'heritage'),

  ((select id from public.routes where slug = 'misty-tea-roads'), 4,
   'Juknokwon Bamboo Forest', '죽녹원', 35.3286, 126.9855,
   'A rustling sea of bamboo — Damyang''s cool green refuge.',
   '사그락거리는 대숲, 담양의 청량함.',
   'scenic')
on conflict (route_id, sequence) do nothing;

-- ------------------------------------------------------------
-- WAYPOINTS · Route 2 — Tongyeong / south-sea-island-hop (5)
--   Nominatim 실측 좌표:
--     1 가천다랭이마을(남해군)        34.7291, 127.8946
--     2 동피랑벽화마을(통영)          34.8456, 128.4275
--     3 미륵산 케이블카 하부역(통영)   34.8100, 128.4184  ※ Nominatim "Cable car" node
--     4 외도보타니아(거제)            34.7692, 128.7119
--     5 거제 바람의언덕               34.7432, 128.6633
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag)
values
  ((select id from public.routes where slug = 'south-sea-island-hop'), 1,
   'Gacheon Darangyi Village', '가천다랭이마을', 34.7291, 127.8946,
   'Stone-walled rice terraces tumbling toward the sea — Namhae''s archetypal view.',
   '바다로 흘러내리는 계단식 논, 남해의 원형 풍경.',
   'scenic'),

  ((select id from public.routes where slug = 'south-sea-island-hop'), 2,
   'Dongpirang Mural Village', '동피랑벽화마을', 34.8456, 128.4275,
   'A hillside warren of painted alleys looking down over the fishing harbor.',
   '항구를 내려다보는 언덕 골목, 통영의 색채.',
   'landmark'),

  ((select id from public.routes where slug = 'south-sea-island-hop'), 3,
   'Mireuksan Cable Car', '미륵산 케이블카', 34.8100, 128.4184,
   'Ride up for a sweeping view of the Hallyeo waterway and its scattered islands.',
   '한려수도 다도해를 한눈에.',
   'scenic'),

  ((select id from public.routes where slug = 'south-sea-island-hop'), 4,
   'Oedo Botania', '외도보타니아', 34.7692, 128.7119,
   'A landscaped island garden floating on the South Sea.',
   '남해에 떠 있는 섬 정원.',
   'scenic'),

  ((select id from public.routes where slug = 'south-sea-island-hop'), 5,
   'Geoje Windy Hill', '거제 바람의언덕', 34.7432, 128.6633,
   'Open coastal grassland combed by the sea wind.',
   '탁 트인 해안 초지와 바닷바람.',
   'scenic')
on conflict (route_id, sequence) do nothing;

-- ------------------------------------------------------------
-- WAYPOINTS · Route 3 — Danyang / danyang-river-cliffs (5)
--   Nominatim 실측 좌표:
--     1 도담삼봉(단양)              37.0001, 128.3438
--     2 만천하 스카이워크(단양)      36.9804, 128.3397
--     3 고수동굴(단양)              36.9887, 128.3816
--     4 사인암(단양)                36.8948, 128.3409
--     5 소백산 비로봉(단양)          36.9574, 128.4848
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag)
values
  ((select id from public.routes where slug = 'danyang-river-cliffs'), 1,
   'Dodamsambong Peaks', '도담삼봉', 37.0001, 128.3438,
   'Three rock peaks rising from the river — the face of Danyang''s eight scenic wonders.',
   '강 위 세 봉우리, 단양팔경의 얼굴.',
   'scenic'),

  ((select id from public.routes where slug = 'danyang-river-cliffs'), 2,
   'Mancheonha Skywalk', '만천하스카이워크', 36.9804, 128.3397,
   'A clifftop deck that puts the Namhan River far beneath your feet.',
   '남한강을 발아래 두는 절벽 전망대.',
   'scenic'),

  ((select id from public.routes where slug = 'danyang-river-cliffs'), 3,
   'Gosu Cave', '고수동굴', 36.9887, 128.3816,
   'A limestone cave hundreds of thousands of years in the making.',
   '수십만 년이 빚은 석회 동굴.',
   'sights'),

  ((select id from public.routes where slug = 'danyang-river-cliffs'), 4,
   'Sainam Rock', '사인암', 36.8948, 128.3409,
   'Sheer cliff and clear stream in harmony — another of Danyang''s eight scenes.',
   '절벽과 계류가 어우러진 단양팔경.',
   'scenic'),

  ((select id from public.routes where slug = 'danyang-river-cliffs'), 5,
   'Sobaeksan Mountain', '소백산', 36.9574, 128.4848,
   'A four-season ridgeline cradling the town below.',
   '사계절 능선, 단양을 감싸는 산세.',
   'scenic')
on conflict (route_id, sequence) do nothing;

-- ------------------------------------------------------------
-- WAYPOINTS · Route 4 — Taean / west-coast-sunset-line (5)
--   Nominatim 실측 좌표:
--     1 간월암      36.6037, 126.4112  ※ 행정구역상 서산시(태안 인접)
--     2 해미읍성    36.7131, 126.5490  ※ 행정구역상 서산시(태안 인접)
--     3 꽃지해변(태안 안면읍)        36.4871, 126.3355
--     4 신두리해안사구(태안)         36.8333, 126.2071  ※ 신두리 마을 centroid(사구센터 노드 없음)
--     5 천리포수목원(태안 소원면)     36.7980, 126.1490
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag)
values
  ((select id from public.routes where slug = 'west-coast-sunset-line'), 1,
   'Ganwolam Hermitage', '간월암', 36.6037, 126.4112,
   'A tidal hermitage that becomes an island each time the sea comes in.',
   '물때마다 섬이 되는 갯벌 위 암자.',
   'heritage'),

  ((select id from public.routes where slug = 'west-coast-sunset-line'), 2,
   'Haemieupseong Walled Town', '해미읍성', 36.7131, 126.5490,
   'A Joseon walled town set in broad open fields.',
   '너른 들판에 둘러진 조선 읍성.',
   'heritage'),

  ((select id from public.routes where slug = 'west-coast-sunset-line'), 3,
   'Kkotji Beach', '꽃지해변', 36.4871, 126.3355,
   'The West Sea sun setting between the Grandmother and Grandfather rocks.',
   '할미·할아비 바위 사이로 지는 서해 노을.',
   'beach'),

  ((select id from public.routes where slug = 'west-coast-sunset-line'), 4,
   'Sinduri Coastal Dunes', '신두리해안사구', 36.8333, 126.2071,
   'Wind-built sand dunes — among the only ones of their scale in the country.',
   '바람이 만든 모래 언덕, 국내 유일급 사구.',
   'scenic'),

  ((select id from public.routes where slug = 'west-coast-sunset-line'), 5,
   'Cheollipo Arboretum', '천리포수목원', 36.7980, 126.1490,
   'A botanical garden that meets the sea.',
   '바다와 맞닿은 식물원.',
   'scenic')
on conflict (route_id, sequence) do nothing;

-- ------------------------------------------------------------
-- WAYPOINTS · Route 5 — Jeongseon / jeongseon-snow-highlands (5)
--   Nominatim 실측 좌표:
--     1 병방치스카이워크(정선)        37.3621, 128.6356
--     2 아우라지(정선 여량면)          37.4728, 128.7221
--     3 정선레일바이크(구절리역 기점)   37.5166, 128.7269  ※ 구절리역↔아우라지역 구간 기점
--     4 추전역(태백, 국내 최고 高도역)   37.2000, 128.9494
--     5 태백산 천제단(태백)            37.0963, 128.9165
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag)
values
  ((select id from public.routes where slug = 'jeongseon-snow-highlands'), 1,
   'Byeongbangchi Skywalk', '병방치스카이워크', 37.3621, 128.6356,
   'A clifftop platform gazing down on a peninsula-shaped river bend.',
   '한반도 지형을 굽어보는 절벽 전망.',
   'scenic'),

  ((select id from public.routes where slug = 'jeongseon-snow-highlands'), 2,
   'Auraji', '아우라지', 37.4728, 128.7221,
   'The river confluence where the old log rafts and the Arirang song began.',
   '뗏목과 아리랑이 시작된 강 합수머리.',
   'scenic'),

  ((select id from public.routes where slug = 'jeongseon-snow-highlands'), 3,
   'Jeongseon Rail Bike', '정선레일바이크', 37.5166, 128.7269,
   'Pedal a disused rail line through the highlands — pure retro mood.',
   '폐철로를 달리는 고원 레트로 감성.',
   'sights'),

  ((select id from public.routes where slug = 'jeongseon-snow-highlands'), 4,
   'Chujeon Station', '추전역', 37.2000, 128.9494,
   'The highest railway station in the country.',
   '국내 가장 높은 기차역.',
   'landmark'),

  ((select id from public.routes where slug = 'jeongseon-snow-highlands'), 5,
   'Taebaeksan Cheonjedan', '태백산천제단', 37.0963, 128.9165,
   'A stone altar on the crest of the Baekdudaegan ridge.',
   '백두대간 마루의 제단.',
   'heritage')
on conflict (route_id, sequence) do nothing;

commit;
