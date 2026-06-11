-- ============================================================
--  K-RoadTrip · Task 1: Mock 데이터 시드 (4개 지역 × 코스 1개)
--  좌표·설명·주차/예약 정보는 기존 MVP에서 검증된 데이터를 승계
--  실행 순서: 0001_init.sql 적용 후 이 파일 실행
-- ============================================================

-- ------------------------------------------------------------
-- ROUTES (4)
-- ------------------------------------------------------------
insert into public.routes
  (slug, region_name_en, region_name_ko, title_en, title_ko, description_en, description_ko,
   total_distance, total_duration, theme_tags, thumbnail_url)
values
  ('gangneung-coastal-drive', 'Gangneung', '강릉',
   'East Coast Ocean Drive', '동해안 오션 드라이브',
   'Pine-lined beaches, Korea''s coffee capital and a K-pop pilgrimage stop — the classic east coast cruise.',
   '소나무 숲 해변과 커피의 도시, 그리고 K-팝 성지까지 — 동해안 드라이브의 클래식.',
   39.8, 80, array['coastal','coffee','kpop'],
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'),

  ('gyeongju-heritage-loop', 'Gyeongju', '경주',
   'Golden City Heritage Loop', '골든 시티 헤리티지 루프',
   'Royal tombs, hanok streets and a 1939 bakery — a UNESCO open-air museum you can drive in one day.',
   '왕릉과 한옥 거리, 1939년 베이커리 — 하루에 도는 유네스코 야외 박물관.',
   3.5, 15, array['history','unesco','hanok'],
   'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1400&q=80'),

  ('jeju-volcanic-loop', 'Jeju', '제주',
   'Volcanic Island Loop', '화산섬 일주 드라이브',
   'Sunrise crater, horizon-wide tea fields and emerald coves — Korea''s definitive rental-car island.',
   '일출 분화구와 지평선까지 이어진 녹차밭, 에메랄드 해변 — 렌터카 여행의 정석, 제주.',
   116.0, 180, array['island','nature','beach'],
   'https://images.unsplash.com/photo-1562680802-9cf8b15f419d?auto=format&fit=crop&w=1400&q=80'),

  ('busan-coastal-metropolis', 'Busan', '부산',
   'Coastal Metropolis Course', '바다의 도시 부산 코스',
   'Hillside art villages, Korea''s largest fish market and a temple built on ocean rocks.',
   '언덕 위 예술 마을, 한국 최대 수산시장, 그리고 바닷바위 위의 사찰.',
   37.5, 85, array['city','ocean','market'],
   'https://images.unsplash.com/photo-1672671187899-a10f547341f1?auto=format&fit=crop&w=1400&q=80');

-- ------------------------------------------------------------
-- WAYPOINTS · Gangneung (4)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'gangneung-coastal-drive'), 1,
   'Chodang Halmeoni Sundubu', '초당할머니순두부', 37.7912, 128.9171,
   'The original soft-tofu house of Chodang village — silky sundubu made with East Sea seawater since the 1950s.',
   '초당마을 원조 순두부집. 1950년대부터 동해 바닷물로 간수를 잡아 온 보드라운 순두부.',
   'restaurant', '77 Chodangsundubu-gil, Gangneung-si, Gangwon-do', '강원특별자치도 강릉시 초당순두부길 77',
   4.7, 3650, 'Free lot — fills up at lunch', '무료 주차장 · 점심시간 만차 주의',
   'Walk-in; kitchen closes early (~7pm)', '워크인 · 저녁 7시면 마감'),

  ((select id from public.routes where slug = 'gangneung-coastal-drive'), 2,
   'Gyeongpo Beach', '경포해변', 37.8057, 128.9085,
   'Six kilometers of white sand lined with pine trees — the classic first stop of every east coast road trip.',
   '소나무 숲을 따라 6km 펼쳐진 백사장. 동해안 로드트립의 클래식한 첫 코스.',
   'sights', '514 Changhae-ro, Gangneung-si, Gangwon-do', '강원특별자치도 강릉시 창해로 514',
   4.7, 5234, 'Large free lots along Changhae-ro', '창해로 변 무료 주차장 다수',
   'Public beach — always open', '공공 해변 · 상시 개방'),

  ((select id from public.routes where slug = 'gangneung-coastal-drive'), 3,
   'Terarosa Coffee Factory', '테라로사 커피공장', 37.7106, 128.8956,
   'Korea''s most legendary specialty roastery, set inside a converted factory surrounded by pine forest.',
   '소나무 숲에 둘러싸인 공장을 개조한 한국 스페셜티 커피의 성지.',
   'cafe', '7 Hyeoncheon-gil, Gujeong-myeon, Gangneung-si, Gangwon-do', '강원특별자치도 강릉시 구정면 현천길 7',
   4.8, 4821, 'Free on-site lot', '무료 전용 주차장',
   'Walk-in only — arrive before 11am on weekends', '예약 불가 워크인 · 주말엔 오전 11시 전 방문 추천'),

  ((select id from public.routes where slug = 'gangneung-coastal-drive'), 4,
   'BTS Bus Stop (Hyangho Beach)', '향호해변 BTS 버스정류장', 37.8990, 128.8245,
   'The seaside bus stop from BTS''s ''You Never Walk Alone'' album cover — sunrise here is pure magic.',
   '방탄소년단 ''You Never Walk Alone'' 앨범 커버 속 그 바닷가 버스정류장. 일출이 압권.',
   'sights', 'Hyangho-ri, Jumunjin-eup, Gangneung-si, Gangwon-do', '강원특별자치도 강릉시 주문진읍 향호리',
   4.6, 1980, 'Free beach lot, 100m walk', '해변 무료 주차장 · 도보 100m',
   'Open 24/7 — sunrise is the magic hour', '상시 개방 · 일출 시간이 황금 타이밍');

-- ------------------------------------------------------------
-- WAYPOINTS · Gyeongju (4)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'gyeongju-heritage-loop'), 1,
   'Daereungwon Tomb Complex', '대릉원', 35.8385, 129.2089,
   'Giant grassy burial mounds of Silla kings rising in the middle of the city — a UNESCO World Heritage site.',
   '도심 한가운데 솟아오른 신라 왕들의 거대한 고분 — 유네스코 세계유산.',
   'sights', '9 Gyerim-ro, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 계림로 9',
   4.9, 8410, 'Public lot at main gate (W2,000)', '정문 공영주차장 (2,000원)',
   'Tickets at the gate, 9am-10pm daily', '현장 매표 · 매일 09-22시'),

  ((select id from public.routes where slug = 'gyeongju-heritage-loop'), 2,
   'Hwangnidan-gil Street', '황리단길', 35.8364, 129.2105,
   'Gyeongju''s trendiest street: hanok houses reborn as cafes, craft shops and photo studios.',
   '경주에서 가장 힙한 거리. 한옥이 카페와 공방, 사진관으로 다시 태어났습니다.',
   'sights', 'Poseok-ro, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 포석로 일대',
   4.7, 7156, 'Park at Daereungwon lot and walk over', '대릉원 주차장 이용 후 도보 추천',
   'Free to stroll — busiest 2-6pm', '자유 산책 · 14-18시 가장 붐빔'),

  ((select id from public.routes where slug = 'gyeongju-heritage-loop'), 3,
   'Gyeongju Gukbap', '경주국밥', 35.8340, 129.2092,
   'A no-frills, steam-filled gukbap institution near Hwangnidan-gil. English menu available.',
   '황리단길 근처 김이 모락모락 나는 국밥 노포. 영어 메뉴도 있습니다.',
   'restaurant', 'Poseok-ro area, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 황남동 포석로 일대',
   4.8, 2147, 'Public lot 200m (W1,000/30min)', '공영주차장 도보 200m (30분 1,000원)',
   'Walk-in; short queue at noon', '워크인 · 정오엔 짧은 웨이팅'),

  ((select id from public.routes where slug = 'gyeongju-heritage-loop'), 4,
   'Hwangnam Bread', '황남빵', 35.8419, 129.2143,
   'Gyeongju''s signature red-bean pastry, baked the same way since 1939 — buy a warm box for the road.',
   '1939년부터 같은 방식으로 굽는 경주 대표 팥빵. 따끈한 한 상자를 여행길에.',
   'bakery', '347 Taejong-ro, Gyeongju-si, Gyeongsangbuk-do', '경상북도 경주시 태종로 347',
   4.6, 6892, 'Free lot behind the shop', '매장 뒤 무료 주차장',
   'No reservations — sells out by late afternoon', '예약 없음 · 늦은 오후엔 품절 주의');

-- ------------------------------------------------------------
-- WAYPOINTS · Jeju (4)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'jeju-volcanic-loop'), 1,
   'Seongsan Ilchulbong', '성산일출봉', 33.4587, 126.9425,
   'A volcanic crater rising straight out of the sea — UNESCO listed. The 25-minute climb earns Jeju''s definitive sunrise.',
   '바다에서 그대로 솟아오른 화산 분화구 — 유네스코 세계자연유산. 25분 오르면 제주 최고의 일출.',
   'sights', '284-12 Ilchul-ro, Seongsan-eup, Seogwipo-si, Jeju', '제주특별자치도 서귀포시 성산읍 일출로 284-12',
   4.9, 16780, 'Free lot at the base', '입구 무료 주차장',
   '7am-7pm (W5,000); sunrise entry from 1hr before', '07-19시 (5,000원) · 일출 1시간 전 입장 가능'),

  ((select id from public.routes where slug = 'jeju-volcanic-loop'), 2,
   'O''sulloc Tea Museum', '오설록 티 뮤지엄', 33.3057, 126.2895,
   'Green-tea fields to the horizon, matcha soft-serve in hand.',
   '지평선까지 이어지는 녹차밭과 손에 든 말차 소프트아이스크림.',
   'cafe', '15 Sinhwayeoksa-ro, Andeok-myeon, Seogwipo-si, Jeju', '제주특별자치도 서귀포시 안덕면 신화역사로 15',
   4.6, 9870, 'Free on-site lot', '무료 전용 주차장',
   '9am-6pm, no reservation needed', '09-18시 · 예약 불필요'),

  ((select id from public.routes where slug = 'jeju-volcanic-loop'), 3,
   'Hyeopjae Beach', '협재해수욕장', 33.3940, 126.2400,
   'Emerald shallows over white sand with Biyangdo island offshore — Jeju''s postcard beach.',
   '흰 모래 위 에메랄드빛 얕은 바다, 그 너머의 비양도 — 제주의 엽서 같은 해변.',
   'sights', 'Hyeopjae-ri, Hallim-eup, Jeju-si, Jeju', '제주특별자치도 제주시 한림읍 협재리',
   4.7, 12410, 'Free beach lot', '해변 무료 주차장',
   'Public beach; cafes line the shore', '공공 해변 · 해변가 카페 다수'),

  ((select id from public.routes where slug = 'jeju-volcanic-loop'), 4,
   'Jeju Black Pork Street', '제주 흑돼지거리', 33.5141, 126.5256,
   'A whole alley devoted to Jeju''s heukdwaeji — thick-cut, charcoal-grilled, dipped in anchovy meljeot.',
   '제주 흑돼지만을 위한 골목. 두툼하게 썰어 숯불에 굽고 멜젓에 찍어 먹습니다.',
   'restaurant', 'Gwandeok-ro 15-gil, Jeju-si, Jeju', '제주특별자치도 제주시 관덕로15길',
   4.5, 8640, 'Public lot at Tapdong (5min walk)', '탑동 공영주차장 도보 5분',
   'Walk-in; queues form after 7pm', '워크인 · 19시 이후 웨이팅');

-- ------------------------------------------------------------
-- WAYPOINTS · Busan (4)
-- ------------------------------------------------------------
insert into public.waypoints
  (route_id, sequence, place_name_en, place_name_ko, latitude, longitude,
   description_en, description_ko, type_tag, address_en, address_ko,
   rating, review_count, parking_note_en, parking_note_ko, booking_note_en, booking_note_ko)
values
  ((select id from public.routes where slug = 'busan-coastal-metropolis'), 1,
   'Gamcheon Culture Village', '감천문화마을', 35.0975, 129.0106,
   'A hillside of candy-colored houses and alley art — Busan''s most photographed neighborhood.',
   '파스텔색 집들이 층층이 쌓인 언덕과 골목 예술 — 부산에서 가장 많이 찍히는 동네.',
   'sights', '203 Gamnae 2-ro, Saha-gu, Busan', '부산광역시 사하구 감내2로 203',
   4.7, 15320, 'Streets are tight — use the public lot below and walk up', '골목이 좁아요 — 아래 공영주차장 이용 후 도보',
   'Free to wander; shops open 9am-6pm', '자유 관람 · 상점은 09-18시'),

  ((select id from public.routes where slug = 'busan-coastal-metropolis'), 2,
   'Jagalchi Market', '자갈치시장', 35.0967, 129.0306,
   'Korea''s largest seafood market — pick your fish downstairs, have it sliced upstairs.',
   '한국 최대 수산시장. 1층에서 고른 생선을 2층에서 바로 회로.',
   'restaurant', '52 Jagalchihaean-ro, Jung-gu, Busan', '부산광역시 중구 자갈치해안로 52',
   4.6, 11240, 'Market garage (W1,000/30min)', '시장 주차타워 (30분 1,000원)',
   'Walk-in; liveliest just before sunset', '워크인 · 해 지기 전이 가장 활기'),

  ((select id from public.routes where slug = 'busan-coastal-metropolis'), 3,
   'Haedong Yonggungsa Temple', '해동용궁사', 35.1884, 129.2233,
   'A 14th-century temple built straight into the ocean rocks — come at sunrise.',
   '바닷바위 위에 지어진 14세기 사찰. 일출에 가보면 이유를 알게 됩니다.',
   'sights', '86 Yonggung-gil, Gijang-eup, Gijang-gun, Busan', '부산광역시 기장군 기장읍 용궁길 86',
   4.8, 13680, 'Paid lot at the entrance (W3,000)', '입구 유료 주차장 (3,000원)',
   'Open 5am-sunset, free entry', '05시-일몰 · 무료 입장'),

  ((select id from public.routes where slug = 'busan-coastal-metropolis'), 4,
   'Haeundae Beach', '해운대해수욕장', 35.1587, 129.1604,
   'Korea''s most famous beach: skyline behind you, open blue ahead, pojangmacha tents glowing after dark.',
   '한국에서 가장 유명한 해변. 뒤로는 스카이라인, 앞으로는 탁 트인 바다.',
   'sights', '264 Haeundaehaebyeon-ro, Haeundae-gu, Busan', '부산광역시 해운대구 해운대해변로 264',
   4.7, 18950, 'Public lots fill on summer weekends — arrive early', '여름 주말 공영주차장 만차 — 일찍 도착 추천',
   'Public beach — always open', '공공 해변 · 상시 개방');
