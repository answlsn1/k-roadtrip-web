-- ============================================================
--  K-RoadTrip · Task 6: Traditional & Heritage 테마 코스 시드
--  실행 순서: 0001_init.sql 적용 후 실행 (seed.sql과 독립)
--
--  좌표 출처: OpenStreetMap Nominatim 지오코딩으로 검증
--    (하회마을 36.5390,128.5181 / 병산서원 36.5405,128.5527 /
--     월영교 36.5766,128.7609 / 불국사 35.7890,129.3309 /
--     첨성대 35.8347,129.2190 / 동궁과월지 35.8347,129.2264 /
--     경기전 35.8157,127.1498 / 아원고택 35.9033,127.2443)
--  아원고택 운영정보 출처:
--    https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=199730
--    https://in.trip.com/travel-guide/attraction/wanju-gun/awon-museum-and-hanok-stay-150751303
-- ============================================================

-- ------------------------------------------------------------
-- ROUTES (3) — Traditional & Heritage theme
-- ------------------------------------------------------------
insert into public.routes
  (slug, region_name_en, region_name_ko, title_en, title_ko, description_en, description_ko,
   total_distance, total_duration, theme_tags, thumbnail_url)
values
  ('andong-scholars-riverside-drive', 'Andong', '안동',
   'Scholar''s Path & Riverbend Drive', '안동 선비의 길과 낙동강 물돌이 드라이브',
   'Follow the Nakdong River as it loops around Korea''s best-preserved clan village, past a UNESCO Confucian academy — ending with jjimdak alleys and a moonlit wooden bridge.',
   '낙동강 물돌이가 감싸 안은 하회마을과 유네스코 서원을 지나, 찜닭 골목과 달빛 월영교에서 마무리하는 선비의 길.',
   34.8, 75, array['heritage','unesco','scenic'],
   'https://images.unsplash.com/photo-1700061036086-414b47f08913?auto=format&fit=crop&w=1400&q=80'),

  ('gyeongju-ancient-capital-drive', 'Gyeongju', '경주',
   'Ancient Capital Timeless Drive', '천년고도 경주 역사 탐방 드라이브',
   'A thousand years of Silla in one day: a mountainside UNESCO temple, royal tomb mounds downtown, hanok-cafe alleys, and a palace pond that glows after dark.',
   '하루에 담는 신라 천 년 — 불국사에서 시작해 대릉원과 황리단길을 지나, 밤이 켜지는 동궁과 월지에서 끝나는 코스.',
   15.5, 35, array['heritage','unesco','night_view'],
   'https://images.unsplash.com/photo-1653632445006-0ed9bbe32672?auto=format&fit=crop&w=1400&q=80'),

  ('jeonju-wanju-hanok-drive', 'Jeonju', '전주·완주',
   'Hanok Village to Mountain Hanok Drive', '전주 한옥마을과 완주 자연 속 전통 드라이브',
   'Start in Korea''s largest hanok village — royal shrine, century-old cathedral, street food — then drive into Wanju''s quiet mountains where a 250-year-old hanok serves tea.',
   '한국 최대 한옥마을의 골목과 길거리 음식에서 시작해, 완주 산자락의 250년 고택 찻집으로 이어지는 드라이브.',
   21.4, 45, array['heritage','hanok','nature'],
   'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1400&q=80');

-- ------------------------------------------------------------
-- WAYPOINTS · Andong (5)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'andong-scholars-riverside-drive'), 1,
   'Hahoe Folk Village', '안동 하회마을', 36.5390, 128.5181,
   'A 600-year-old riverside clan village where Joseon-era life continues — thatched roofs, tile-roofed manors and the famous mask dance. UNESCO World Heritage.',
   '낙동강이 휘감아 도는 600년 풍산 류씨 집성촌. 초가와 고택, 하회별신굿탈놀이까지 — 유네스코 세계유산.',
   'heritage', '186 Jeonseo-ro, Pungcheon-myeon, Andong-si, Gyeongsangbuk-do', '경상북도 안동시 풍천면 전서로 186',
   4.8, 9840, 'Large lot at the ticket office (shuttle to the village)', '매표소 대형 주차장 (마을까지 셔틀)',
   '9am-6pm (W5,000); mask-dance performances on weekends', '09-18시 (5,000원) · 주말 탈춤 공연'),

  ((select id from public.routes where slug = 'andong-scholars-riverside-drive'), 2,
   'Byeongsan Seowon Confucian Academy', '병산서원', 36.5405, 128.5527,
   'A UNESCO Confucian academy whose wooden pavilion frames the river cliff like a painting — Joseon architecture at its most poetic. The gravel road in is part of the charm.',
   '만대루가 강 건너 병산 절벽을 액자처럼 담아내는 곳 — 조선 서원 건축의 절정. 들어가는 비포장길도 운치입니다.',
   'heritage', '386 Byeongsan-gil, Pungcheon-myeon, Andong-si, Gyeongsangbuk-do', '경상북도 안동시 풍천면 병산길 386',
   4.7, 3120, 'Free lot before the gate', '정문 앞 무료 주차장',
   '9am-6pm, free entry', '09-18시 · 무료 입장'),

  ((select id from public.routes where slug = 'andong-scholars-riverside-drive'), 3,
   'Andong Jjimdak Alley (Gu Market)', '안동구시장 찜닭골목', 36.5647, 128.7287,
   'The braised-chicken dish Korea knows as jjimdak was born in this market alley — order one pan and share it like the locals do.',
   '안동찜닭이 태어난 골목. 현지인처럼 한 판 시켜 나눠 드세요.',
   'landmark', 'Beonyeong 1-gil, Andong-si, Gyeongsangbuk-do', '경상북도 안동시 번영1길 일대',
   4.5, 5210, 'Public garage by the market', '시장 공영주차타워',
   'Walk-in; most shops close around 8pm', '워크인 · 대부분 20시 무렵 마감'),

  ((select id from public.routes where slug = 'andong-scholars-riverside-drive'), 4,
   'Woryeonggyo Bridge', '안동 월영교', 36.5766, 128.7609,
   'Korea''s longest wooden footbridge, built around a love story — at night the moon-greeting lights double on the water.',
   '사랑 이야기를 품은 국내 최장 목책교. 밤이면 달맞이 조명이 물 위에 겹칩니다.',
   'scenic', 'Sanga-dong, Andong-si, Gyeongsangbuk-do', '경상북도 안동시 상아동 월영교',
   4.7, 6890, 'Free lots on both banks', '양안 무료 주차장',
   'Open 24/7 — fountain shows on summer evenings', '상시 개방 · 여름 저녁 분수 운영'),

  ((select id from public.routes where slug = 'andong-scholars-riverside-drive'), 5,
   'Cafe Gureume (Hanok Stay)', '카페 구름에', 36.5786, 128.7626,
   'Tea and coffee inside a hanok stay overlooking the bridge — sit on the wooden maru floor and watch the river slow down below.',
   '월영교가 내려다보이는 한옥 스테이의 찻집. 마루에 앉아 느려지는 강을 바라보세요.',
   'hanok_cafe', '190 Minsokchon-gil, Andong-si, Gyeongsangbuk-do', '경상북도 안동시 민속촌길 190',
   4.6, 1480, 'Free lot at the resort', '리조트 무료 주차장',
   '10am-9pm, walk-in', '10-21시 · 워크인');

-- ------------------------------------------------------------
-- WAYPOINTS · Gyeongju (5)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'gyeongju-ancient-capital-drive'), 1,
   'Bulguksa Temple', '불국사', 35.7890, 129.3309,
   'The masterpiece of Silla Buddhism, home to two national-treasure pagodas — arrive at opening to hear the valley before the crowds. UNESCO World Heritage.',
   '신라 불교 예술의 정수, 다보탑과 석가탑의 절 — 유네스코 세계유산. 개장 직후의 고요를 추천합니다.',
   'heritage', '385 Bulguk-ro, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 불국로 385',
   4.8, 14230, 'Paid lot at the entrance (W1,000-2,000)', '입구 유료 주차장 (1,000-2,000원)',
   '9am-6pm; last entry 5pm', '09-18시 · 입장 마감 17시'),

  ((select id from public.routes where slug = 'gyeongju-ancient-capital-drive'), 2,
   'Daereungwon Tomb Complex', '대릉원', 35.8385, 129.2089,
   'Giant grassy burial mounds of Silla kings rising in the middle of the city — walk it at dusk when the lights come on.',
   '도심 한가운데 솟아오른 신라 왕들의 거대한 고분 — 조명이 켜지는 해질녘 산책을 추천합니다.',
   'heritage', '9 Gyerim-ro, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 계림로 9',
   4.9, 8410, 'Public lot at main gate (W2,000)', '정문 공영주차장 (2,000원)',
   'Tickets at the gate, 9am-10pm daily', '현장 매표 · 매일 09-22시'),

  ((select id from public.routes where slug = 'gyeongju-ancient-capital-drive'), 3,
   'Hwangnidan-gil Hanok Cafe Street', '황리단길', 35.8364, 129.2105,
   'Hanok houses reborn as cafes and craft shops with royal tombs for a backdrop — coffee first, hanbok rental optional.',
   '고분을 배경으로 한옥이 카페와 공방으로 다시 태어난 거리 — 커피 먼저, 한복 대여는 옵션.',
   'hanok_cafe', 'Poseok-ro, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 포석로 일대',
   4.7, 7156, 'Park at Daereungwon lot and walk over', '대릉원 주차장 이용 후 도보 추천',
   'Free to stroll — busiest 2-6pm', '자유 산책 · 14-18시 가장 붐빔'),

  ((select id from public.routes where slug = 'gyeongju-ancient-capital-drive'), 4,
   'Cheomseongdae Observatory', '경주 첨성대', 35.8347, 129.2190,
   'East Asia''s oldest surviving astronomical observatory — a 7th-century stone tower standing in a field of royal tombs, magical at golden hour.',
   '7세기에 세워진 동양에서 가장 오래된 천문대. 왕릉 들판 한가운데, 해질녘이 가장 아름답습니다.',
   'landmark', 'Inwang-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 인왕동 839-1',
   4.6, 10320, 'Public lots along Cheomseong-ro', '첨성로 변 공영주차장',
   'Open 24/7, free — illuminated until 10pm', '상시 개방 · 무료 · 22시까지 야간 조명'),

  ((select id from public.routes where slug = 'gyeongju-ancient-capital-drive'), 5,
   'Donggung Palace & Wolji Pond', '경주 동궁과 월지', 35.8347, 129.2264,
   'The Silla crown prince''s palace reflected in its lotus pond — Korea''s definitive night view. Arrive 30 minutes before sunset and stay.',
   '연못에 비친 신라 동궁 — 한국 야경의 정석. 일몰 30분 전에 도착해 어두워질 때까지 머무르세요.',
   'heritage', '102 Wonhwa-ro, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 원화로 102',
   4.9, 15870, 'Paid lot at the entrance', '입구 유료 주차장',
   '9am-10pm (W3,000); best after dark', '09-22시 (3,000원) · 야간 관람 추천');

-- ------------------------------------------------------------
-- WAYPOINTS · Jeonju & Wanju (5)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'jeonju-wanju-hanok-drive'), 1,
   'Jeonju Hanok Village', '전주한옥마을', 35.8146, 127.1530,
   'Over 700 hanok roofs in one neighborhood — bibimbap originals, hanbok strolls, craft workshops and Korea''s best street food.',
   '한옥 700여 채가 모인 동네. 원조 비빔밥과 한복 산책, 공방 체험, 그리고 길거리 음식까지.',
   'heritage', '99 Girin-daero, Wansan-gu, Jeonju-si, Jeonbuk', '전북특별자치도 전주시 완산구 기린대로 99',
   4.7, 21340, 'Use the village indoor public garage — streets are pedestrian-heavy', '한옥마을 실내공영주차장 이용 · 골목은 보행 위주',
   'Open all day; shops 10am-9pm', '상시 개방 · 상점 10-21시'),

  ((select id from public.routes where slug = 'jeonju-wanju-hanok-drive'), 2,
   'Gyeonggijeon Shrine', '전주 경기전', 35.8157, 127.1498,
   'The shrine keeping the portrait of King Taejo, founder of Joseon, under 600-year-old trees — the bamboo grove at the back is the quiet photo spot.',
   '조선 태조 어진을 모신 사당. 뒤편 대나무숲이 조용한 포토 스팟입니다.',
   'heritage', '44 Taejo-ro, Wansan-gu, Jeonju-si, Jeonbuk', '전북특별자치도 전주시 완산구 태조로 44',
   4.8, 9120, 'No own lot — walk from the village garage', '전용 주차장 없음 · 한옥마을 주차장에서 도보',
   '9am-7pm (W3,000)', '09-19시 (3,000원)'),

  ((select id from public.routes where slug = 'jeonju-wanju-hanok-drive'), 3,
   'Jeondong Catholic Cathedral', '전동성당', 35.8135, 127.1490,
   'A century-old Romanesque-Byzantine cathedral facing the hanok rooftops — East meets West in a single frame.',
   '한옥 지붕을 마주 보는 백 년의 로마네스크 성당 — 동서양이 한 프레임에 담깁니다.',
   'landmark', '51 Taejo-ro, Wansan-gu, Jeonju-si, Jeonbuk', '전북특별자치도 전주시 완산구 태조로 51',
   4.7, 8450, 'Small lot; better to walk over from the village', '소규모 주차장 · 한옥마을에서 도보 추천',
   'Exterior open daily; mind mass times on weekends', '외부 상시 관람 · 주말 미사 시간 유의'),

  ((select id from public.routes where slug = 'jeonju-wanju-hanok-drive'), 4,
   'Oseong Hanok Village', '완주 오성한옥마을', 35.9020, 127.2440,
   'A hillside hanok hamlet beneath Jongnamsan mountain — the village BTS chose for its 2019 retreat. Mist settles between the roofs at dawn.',
   '종남산 자락의 한옥 마을 — BTS가 2019 서머패키지를 촬영한 곳. 새벽이면 지붕 사이로 안개가 내립니다.',
   'scenic', 'Songgwangsuman-ro, Soyang-myeon, Wanju-gun, Jeonbuk', '전북특별자치도 완주군 소양면 송광수만로 일대',
   4.6, 3870, 'Village lot at the entrance', '마을 입구 주차장',
   'Free to stroll; quiet hours after sunset', '자유 산책 · 일몰 후 정숙'),

  ((select id from public.routes where slug = 'jeonju-wanju-hanok-drive'), 5,
   'Awon Gotaek (Museum & Tea House)', '아원고택', 35.9033, 127.2443,
   'A 250-year-old hanok moved here beam by beam from Jinju — now a gallery, tea house and stay. The mountain frames itself in the open daecheong hall.',
   '진주에서 통째로 옮겨 지은 250년 고택 — 갤러리이자 찻집, 스테이. 대청마루에 앉으면 산이 액자가 됩니다.',
   'hanok_cafe', '516-7 Songgwangsuman-ro, Soyang-myeon, Wanju-gun, Jeonbuk', '전북특별자치도 완주군 소양면 송광수만로 516-7',
   4.7, 4920, 'Small lot below the gallery', '갤러리 아래 소규모 주차장',
   '11am-5pm; W10,000 entry includes gallery (last order 3:40pm)', '11-17시 · 입장 10,000원(갤러리 포함) · 라스트오더 15:40');
