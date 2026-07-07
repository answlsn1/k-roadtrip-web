export type Lang = "en" | "ko";

export const dict = {
  // ── Navigation ──────────────────────────────────────────────
  "nav.routes":   { en: "Routes",          ko: "코스" },
  "nav.map":      { en: "Map",             ko: "지도" },
  "nav.why":      { en: "Why K-RoadTrip",  ko: "K-RoadTrip 소개" },
  "nav.build":    { en: "+ Build Route",   ko: "+ 내 일정 만들기" },
  "nav.mytrip":   { en: "My Trip",         ko: "내 여행" },
  "nav.back":     { en: "Back",            ko: "뒤로" },

  // ── Hero ────────────────────────────────────────────────────
  "hero.badge": {
    en: "🚗 Local-verified road trips · Sokcho → Busan + Jeju",
    ko: "🚗 현지 검증 로드트립 · 속초 → 부산 + 제주",
  },
  "hero.titlePre":    { en: "Discover ",          ko: "" },
  "hero.titleAccent": { en: "Korea beyond Seoul", ko: "서울 너머의 한국" },
  "hero.titlePost":   { en: ".",                  ko: "을 만나다." },
  "hero.sub": {
    en: "Local-verified routes, one tap to Naver Map.",
    ko: "현지 검증 코스, 원탭이면 네이버 지도 길안내까지.",
  },
  "hero.note": {
    en: "No login · Free to use · Locally curated",
    ko: "로그인 없음 · 무료 이용 · 현지 큐레이션",
  },

  // ── Courses section ─────────────────────────────────────────
  "home.label":   { en: "Curated Routes",  ko: "현지인이 검증한 코스" },
  "home.heading": {
    en: "Pick a route. We did the homework.",
    ko: "코스만 고르세요. 검증은 저희가 마쳤습니다.",
  },
  "home.sub": {
    en: "Hand-built itineraries with only local-verified stops — swipe to explore.",
    ko: "현지 검증 장소만 담은 맞춤 코스 — 스와이프해서 살펴보세요.",
  },
  "home.searchPlaceholder": {
    en: 'Try "andong" or "gyeongju heritage" — typos welcome!',
    ko: '예: "안동" 또는 "경주 헤리티지" — 오타도 괜찮아요!',
  },
  "home.noMatches":     { en: "No matches found", ko: "검색 결과가 없습니다" },
  "home.noMatchesHint": {
    en: "Try a region (Andong, Gyeongju, Jeju…) or a theme (heritage, coastal…)",
    ko: "지역(안동, 경주, 제주…)이나 테마(문화유산, 해안…)로 검색해 보세요",
  },

  // ── Feed category titles ────────────────────────────────────
  "feed.trending":  { en: "Trending in Korea", ko: "한국에서 뜨는 코스" },
  "feed.beyond":    { en: "Beyond Seoul",      ko: "서울 너머" },
  "feed.heritage":  { en: "History & Culture", ko: "역사 & 문화" },
  "feed.ocean":     { en: "Ocean Views",       ko: "해안 드라이브" },
  "feed.sponsored": { en: "Sponsored Picks",   ko: "스폰서 추천" },
  "feed.partner":   { en: "Partner",              ko: "파트너" },

  // ── Cards ───────────────────────────────────────────────────
  // Arrow lives in the card's circular affordance now (RouteVideoCard) — keep the label clean.
  "card.viewmap": { en: "View course on map", ko: "지도에서 코스 보기" },
  "card.add":     { en: "+ Add to Trip",         ko: "+ 내 여행에 추가" },
  "card.added":   { en: "✓ Added to Trip",       ko: "✓ 추가됨" },
  "card.book":    { en: "Book Now",              ko: "예약하기" },

  // ── Before You Drive ────────────────────────────────────────
  "tips.label":   { en: "Before You Drive", ko: "출발 전 체크리스트" },
  "tips.heading": {
    en: "What road-trippers wish they'd known",
    ko: "여행자들이 미리 알았으면 했던 것들",
  },

  // ── Why K-RoadTrip ──────────────────────────────────────────
  "why.label":   { en: "Why K-RoadTrip", ko: "K-RoadTrip을 쓰는 이유" },
  "why.heading": {
    en: "Built for travelers, not tourists",
    ko: "관광객이 아닌, 진짜 여행자를 위해",
  },

  // ── Footer ──────────────────────────────────────────────────
  "footer.tagline": {
    en: "© 2026 K-RoadTrip · Made for travelers who go beyond Seoul",
    ko: "© 2026 K-RoadTrip · 서울 너머를 여행하는 사람들을 위해",
  },
  "footer.attribution": {
    en: "Map data © OpenStreetMap contributors · Navigation by Naver Map",
    ko: "지도 데이터 © OpenStreetMap 기여자 · 내비게이션 제공 · 네이버 지도",
  },
  "footer.contact": {
    en: "Contact: {email}",
    ko: "문의: {email}",
  },

  // ── Affiliate / sponsor disclosure ──────────────────────────
  "disclosure.affiliate": {
    en: "Some partner links may earn us a commission at no extra cost to you. Sponsored places are labeled ⭐.",
    ko: "일부 파트너 링크는 추가 비용 없이 수수료가 발생할 수 있습니다. 스폰서 장소는 ⭐로 표시됩니다.",
  },

  // ── Common ──────────────────────────────────────────────────
  "common.cancel":     { en: "Cancel",          ko: "취소" },
  "common.reset":      { en: "Reset",           ko: "초기화" },
  "common.dismiss":    { en: "Dismiss",         ko: "닫기" },
  "common.close":      { en: "Close",           ko: "닫기" },
  "common.remove":     { en: "Remove",          ko: "삭제" },
  "common.copyLink":   { en: "Copy page link",  ko: "페이지 링크 복사" },
  "common.linkCopied": { en: "Link copied ✓",   ko: "링크 복사됨 ✓" },
  "common.copied":     { en: "✓ Copied!",       ko: "✓ 복사됨!" },
  "common.clearAll":   { en: "Clear all",       ko: "모두 지우기" },
  "common.loadingMap": { en: "Loading map…",    ko: "지도 불러오는 중…" },

  // ── Live Map section ────────────────────────────────────────
  "map.label":   { en: "Live Map",                   ko: "전체 지도" },
  "map.heading": { en: "Every stop, local-verified", ko: "모든 장소, 현지 검증 완료" },
  "map.all":     { en: "All",                        ko: "전체" },
  "map.hint": {
    en: "Tap a marker for details & Naver Map navigation",
    ko: "마커를 눌러 상세 정보와 네이버 지도 길안내를 확인하세요",
  },

  // ── Route detail (RouteViewer) ──────────────────────────────
  "route.stops":        { en: "{n} stops",             ko: "{n}개 장소" },
  "route.driveSuffix":  { en: "drive",                 ko: "주행" },
  "route.kmDrive":      { en: "{km} km · {min} min",   ko: "{km} km · {min}분" },
  "route.reviews":      { en: "{n} reviews",           ko: "리뷰 {n}개" },
  "route.navigateStop": { en: "Navigate to this stop", ko: "이 장소로 길안내" },
  "route.startNav":     { en: "Start Navigation with Naver Map", ko: "네이버 지도로 길안내 시작" },
  "route.nextStop":     { en: "Next stop",             ko: "다음 장소" },
  "route.tripComplete": { en: "Trip complete 🎉",      ko: "여행 완료 🎉" },
  "route.customOrder":  { en: "Custom order",          ko: "나만의 순서" },
  "route.restoreOrder": { en: "Restore original order", ko: "원래 순서로" },
  "route.moveUp":       { en: "Move {name} up",        ko: "{name} 위로 이동" },
  "route.moveDown":     { en: "Move {name} down",      ko: "{name} 아래로 이동" },
  "route.orderAnnounce": { en: "{name} is now stop {n}", ko: "{name} 순서가 {n}번으로 변경됨" },
  "route.orderRestored": { en: "Original order restored", ko: "원래 순서로 복원됨" },

  // ── Naver handoff bridge modal ──────────────────────────────
  "bridge.title": { en: "Opening Naver Map", ko: "네이버 지도 여는 중" },
  "bridge.body": {
    en: "We'll open your route in Naver Map for accurate turn-by-turn navigation in Korea.",
    ko: "정확한 길안내를 위해 경로를 네이버 지도에서 열어 드립니다.",
  },
  "bridge.tip": {
    en: "Your stops are already set with exact Korean names — no typing needed. Tip: Naver Map has an English mode (Settings → Language).",
    ko: "장소가 정확한 한국어 이름으로 이미 설정돼 있어 입력할 필요가 없습니다. 팁: 네이버 지도에는 영어 모드가 있습니다 (설정 → 언어).",
  },
  "bridge.fromCurrent": { en: "From your current location", ko: "현재 위치에서 출발" },
  "bridge.stopsCount":  { en: "{n} stops",       ko: "{n}개 장소" },
  "bridge.viaOne":      { en: "{n} via point",   ko: "경유지 {n}곳" },
  "bridge.viaMany":     { en: "{n} via points",  ko: "경유지 {n}곳" },
  "bridge.inAppTitle":  { en: "You seem to be in an in-app browser", ko: "인앱 브라우저로 보입니다" },
  "bridge.inAppBody": {
    en: "If the app doesn't open, tap the ⋯ menu and choose \"Open in browser\", or copy this page link into Safari/Chrome.",
    ko: "앱이 열리지 않으면 ⋯ 메뉴를 눌러 '브라우저로 열기'를 선택하거나, 이 페이지 링크를 사파리·크롬에 붙여넣으세요.",
  },
  "bridge.openApp":     { en: "Open App",  ko: "앱 열기" },
  "bridge.opening":     { en: "Opening…",  ko: "여는 중…" },
  "bridge.openFailed":  { en: "App didn't open? See other options", ko: "앱이 안 열렸나요? 다른 방법 보기" },
  "bridge.fallbackIntro": { en: "If the app didn't open, try one of these:", ko: "앱이 열리지 않았다면 다음을 시도해 보세요:" },
  "bridge.retryOpen":   { en: "Try Open App again", ko: "앱 열기 다시 시도" },
  "bridge.copyAddr":    { en: "Copy Korean Address", ko: "한국어 주소 복사" },
  "bridge.addrCopied":  { en: "Copied! ✓ Paste into any map app", ko: "복사됨! ✓ 지도 앱에 붙여넣기" },
  "bridge.openWeb":     { en: "Open Naver Map on the web", ko: "웹에서 네이버 지도 열기" },

  // ── Auth modal ──────────────────────────────────────────────
  "auth.title":   { en: "Save this route for your trip!", ko: "이 코스를 여행에 저장하세요!" },
  "auth.sub":     { en: "Sign in to keep your favorite drives.", ko: "로그인하고 마음에 드는 드라이브를 저장해 보세요." },
  "auth.inAppTitle": { en: "Google sign-in doesn't work in in-app browsers", ko: "인앱 브라우저에서는 구글 로그인이 작동하지 않습니다" },
  "auth.inAppBody": {
    en: "Tap the ⋯ menu and choose \"Open in browser\", or copy this page link into Safari/Chrome — your save will pick up right where you left off.",
    ko: "⋯ 메뉴를 눌러 '브라우저로 열기'를 선택하거나, 이 페이지 링크를 사파리·크롬에 붙여넣으세요. 하려던 저장은 그대로 이어집니다.",
  },
  "auth.continueGoogle": { en: "Continue with Google", ko: "구글로 계속하기" },
  "auth.opening":   { en: "Opening Google…", ko: "구글 여는 중…" },
  "auth.failed":    { en: "Sign-in failed. Please try again.", ko: "로그인에 실패했습니다. 다시 시도해 주세요." },
  "auth.later":     { en: "Maybe later", ko: "나중에" },
  "auth.footnote":  { en: "Free forever · We only store your saved drives.", ko: "평생 무료 · 저장한 드라이브만 보관합니다." },

  // ── My Trip panel ───────────────────────────────────────────
  "trip.empty":     { en: "Nothing saved yet", ko: "아직 저장한 게 없습니다" },
  "trip.emptyHint": { en: "Build a route and save it, or tap ★ on any map marker.", ko: "일정을 만들어 저장하거나, 지도 마커의 ★를 눌러 장소를 저장하세요." },
  "trip.buildCta":  { en: "+ Build a route", ko: "+ 내 일정 만들기" },
  "trip.routesHeading": { en: "My saved routes", ko: "저장한 내 일정" },
  "trip.placesHeading": { en: "Saved places", ko: "저장한 장소" },
  "trip.openInNaver":   { en: "Open in Naver Map", ko: "네이버 지도로 열기" },
  "trip.tip": {
    en: "Traveler tip: add everything to Naver Map favorites in one sitting before the trip — not on the road.",
    ko: "여행 팁: 출발 전에 모든 장소를 네이버 지도 즐겨찾기에 한 번에 추가하세요 — 운전 중 말고요.",
  },
  "trip.copyAll":   { en: "Copy all Korean names", ko: "한국어 이름 모두 복사" },

  // ── Travel Expense Ledger ───────────────────────────────────
  "ledger.openLabel": { en: "Open expense ledger", ko: "여행경비 기록부 열기" },
  "ledger.title":     { en: "Trip Expenses",       ko: "여행 경비" },
  "ledger.summaryExpected": { en: "Expected",  ko: "예상" },
  "ledger.summaryActual":   { en: "Actual",    ko: "실제" },
  "ledger.cat.rental": { en: "Rental car",   ko: "렌터카" },
  "ledger.cat.fuel":   { en: "Fuel & tolls", ko: "주유·통행료" },
  "ledger.cat.stay":   { en: "Lodging",      ko: "숙박" },
  "ledger.cat.food":   { en: "Food",         ko: "식비" },
  "ledger.cat.entry":  { en: "Entry fees",   ko: "입장료" },
  "ledger.cat.other":  { en: "Other",        ko: "기타" },
  "ledger.approxBadge": { en: "est.", ko: "추정" },
  "ledger.approxHint": {
    en: "Estimates are rough nationwide averages — edit anytime.",
    ko: "예상 금액은 전국 평균을 기준으로 한 추정치입니다 — 언제든 수정하세요.",
  },
  "ledger.overwriteHint": {
    en: "Saving here replaces this category's logged total.",
    ko: "여기에 저장하면 이 항목의 기존 기록이 새 값으로 바뀝니다.",
  },
  "ledger.withinBudget": { en: "Within budget · {pct}", ko: "예산 내 · {pct}" },
  "ledger.overBy":       { en: "Over by {amt} · {pct}",  ko: "{amt} 초과 · {pct}" },
  "ledger.notLogged":    { en: "Not logged yet",          ko: "아직 기록 없음" },
  "ledger.rateLabel":    { en: "approx · rates as of {date}", ko: "추정 · {date} 기준 환율" },
  "ledger.todaySoFar":   { en: "Logged so far: {amt}",    ko: "지금까지 기록: {amt}" },
  "ledger.amountPlaceholder": { en: "Amount", ko: "금액" },
  "ledger.save":      { en: "Save",            ko: "저장" },
  "ledger.logCta":    { en: "+ Log an expense", ko: "+ 경비 기록하기" },
  "ledger.empty":     { en: "No expenses logged", ko: "기록된 경비가 없습니다" },
  "ledger.emptyHint": {
    en: "Tap a category and enter what you spent — we'll compare it to the estimate.",
    ko: "항목을 누르고 지출한 금액을 입력하세요 — 예상치와 비교해 드립니다.",
  },
  "ledger.phase2Note": {
    en: "Figures stay on this device. Currency conversions are approximate.",
    ko: "기록은 이 기기에만 저장됩니다. 환율 환산은 근사치입니다.",
  },

  // ── Builder ─────────────────────────────────────────────────
  "builder.savedHint":       { en: "Build your own road trip · saved on this device", ko: "나만의 로드트립 만들기 · 이 기기에 저장됨" },
  "builder.untitled":        { en: "Untitled Route", ko: "제목 없는 코스" },
  "builder.namePlaceholder": { en: "Name your route", ko: "코스 이름을 입력하세요" },
  "builder.clearConfirm":    { en: "Clear all?", ko: "모두 지울까요?" },
  "builder.openRoute":       { en: "Open route in Naver Map", ko: "네이버 지도로 코스 열기" },
  "builder.needTwo":         { en: "Add at least 2 stops", ko: "장소를 2개 이상 추가하세요" },
  "builder.routePart":       { en: "Route Part {n}", ko: "코스 {n}부" },
  "builder.copyKorean":      { en: "Copy Korean names", ko: "한국어 이름 복사" },
  "builder.summary":         { en: "{n} stops · ≈ {km} km · {dur} drive", ko: "{n}개 장소 · ≈ {km} km · {dur} 주행" },
  "builder.verified":        { en: "verified", ko: "검증됨" },
  "builder.minSuffix":       { en: "min", ko: "분" },
  "builder.noStops":         { en: "No stops yet", ko: "아직 장소가 없습니다" },
  "builder.noStopsHint":     { en: "Search above or tap a pin on the map to start building your route.", ko: "위에서 검색하거나 지도의 핀을 눌러 코스를 만들어 보세요." },
  "builder.dragReorder":     { en: "Drag to reorder", ko: "드래그하여 순서 변경" },
  "builder.pinHint":         { en: "Click anywhere on the map to add that spot to your route", ko: "지도를 클릭하면 그 지점을 루트에 추가할 수 있어요" },
  "builder.pinResolving":    { en: "Looking up address…", ko: "주소 확인 중…" },
  "builder.pinAdd":          { en: "+ Add to route", ko: "+ 루트에 추가" },
  "builder.pinBadge":        { en: "pinned", ko: "핀 지정" },
  "builder.saveTrip":        { en: "★ Save to My Trip", ko: "★ 내 여행에 저장" },
  "builder.savedTrip":       { en: "✓ Saved to My Trip", ko: "✓ 내 여행에 저장됨" },

  // ── Place search ────────────────────────────────────────────
  "search.placeholder":    { en: "Search — e.g. Gyeongbokgung, Haeundae", ko: "검색 — 예: 경복궁, 해운대" },
  "search.clear":          { en: "Clear", ko: "지우기" },
  "search.partnerPicks":   { en: "⭐ Partner Picks · Sponsored", ko: "⭐ 파트너 추천 · 스폰서" },
  "search.verifiedPicks":  { en: "✓ Local-verified picks", ko: "✓ 현지 검증 장소" },
  "search.searchingKorea": { en: "Searching all of Korea…", ko: "한국 전역 검색 중…" },
  "search.allKorea":       { en: "All of Korea · Powered by OSM", ko: "한국 전역 · OSM 제공" },
  "search.searching":      { en: "Searching…", ko: "검색 중…" },
  "search.noResults":      { en: "No results — try another keyword.", ko: "결과가 없습니다 — 다른 키워드로 시도해 보세요." },
  "search.noMore":         { en: "No additional places found.", ko: "추가 장소를 찾지 못했습니다." },
  "search.alreadyAdded":   { en: "Already added.", ko: "이미 추가했습니다." },

  // ── Error / not-found ───────────────────────────────────────
  "error.title":    { en: "Something went wrong", ko: "문제가 발생했습니다" },
  "error.body":     { en: "We hit a bump on the road. Please try again in a moment.", ko: "가는 길에 작은 문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
  "error.retry":    { en: "Try again", ko: "다시 시도" },
  "notFound.title": { en: "Course not found", ko: "코스를 찾을 수 없습니다" },
  "notFound.body":  { en: "This route doesn't exist (yet) — it may be a mistyped link, or the course is still on its way.", ko: "이 코스는 (아직) 없습니다 — 링크 오타이거나, 코스가 곧 추가될 예정일 수 있습니다." },
  "notFound.back":  { en: "Back to all courses", ko: "전체 코스로 돌아가기" },

  // ── Mode toggle (Car / Bike) ─────────────────────────────────
  "mode.car":  { en: "🚗 Car", ko: "🚗 자동차" },
  "mode.bike": { en: "🚴 Bike", ko: "🚴 자전거" },

  // ── Bike — nav ───────────────────────────────────────────────
  "bike.nav.passport": { en: "🎖 Passport",    ko: "🎖 인증수첩" },
  "bike.nav.routes":   { en: "Routes",         ko: "노선" },
  "bike.nav.why":      { en: "Why Bike-RoadTrip", ko: "Bike-RoadTrip 소개" },

  // ── Bike — hero ──────────────────────────────────────────────
  "bike.hero.badge": {
    en: "🚴 Korea's national cycling network · 12 official routes",
    ko: "🚴 대한민국 국토종주 자전거길 · 공식 노선 12개",
  },
  "bike.hero.titlePre":    { en: "Cycle ",         ko: "" },
  "bike.hero.titleAccent": { en: "the real Korea", ko: "진짜 한국을" },
  "bike.hero.titlePost":   { en: ".",              ko: " 페달로 만나다." },
  "bike.hero.sub": {
    en: "1,700+ km of government-built river, coastal & mountain bike paths — with the real certification-stamp system explained for visitors.",
    ko: "정부가 조성한 강변·해안·고갯길 자전거길 1,700km 이상 — 외국인도 이해하기 쉽게 인증수첩 시스템까지 설명합니다.",
  },
  "bike.hero.note": {
    en: "No login · Free to use · Based on Korea's official bike path network",
    ko: "로그인 없음 · 무료 이용 · 대한민국 공식 자전거길 네트워크 기반",
  },
  "bike.hero.cta": { en: "See all 12 routes ↓", ko: "12개 노선 모두 보기 ↓" },

  // ── Bike — routes section ────────────────────────────────────
  "bike.routes.label":   { en: "Official National Bike Paths", ko: "공식 국토종주 자전거길" },
  "bike.routes.heading": { en: "Pick a river, a coast, or a challenge.", ko: "강, 해안, 혹은 도전 — 골라보세요." },
  "bike.routes.sub": {
    en: "Every route below is part of Korea's real, government-built cycling network — not a curated suggestion, an actual path that exists on the ground.",
    ko: "아래 노선은 전부 대한민국 정부가 실제로 조성한 자전거길입니다 — 추천 경로가 아니라 실제로 존재하는 길입니다.",
  },
  "bike.cat.fourRivers": { en: "🏞 The Four Rivers", ko: "🏞 4대강 노선" },
  "bike.cat.coastal":    { en: "🌊 Coastal Routes",  ko: "🌊 해안 노선" },
  "bike.cat.mountain":   { en: "⛰ The Mountain Pass", ko: "⛰ 고갯길 도전" },
  "bike.cat.island":     { en: "🏝 Jeju Island Loop", ko: "🏝 제주 환상 코스" },
  "bike.cat.more":       { en: "🌿 More Routes",      ko: "🌿 그 외 노선" },

  // ── Bike — route card / detail ───────────────────────────────
  "bike.card.viewRoute":     { en: "View route details →", ko: "노선 자세히 보기 →" },
  "bike.card.km":            { en: "{km} km",              ko: "{km}km" },
  "bike.difficulty.easy":        { en: "Easy",        ko: "쉬움" },
  "bike.difficulty.moderate":    { en: "Moderate",    ko: "보통" },
  "bike.difficulty.challenging": { en: "Challenging", ko: "도전적" },
  "bike.route.highlights":   { en: "Highlights",              ko: "하이라이트" },
  "bike.route.certCenters":  { en: "Key certification centers", ko: "대표 인증센터" },
  "bike.route.fourRiversBadge": { en: "Four Rivers route", ko: "4대강 노선" },
  "bike.route.back":         { en: "All bike routes", ko: "전체 자전거길" },

  // ── Bike — passport tracker (delight feature) ────────────────
  "bike.passport.title": { en: "My Bike Passport", ko: "내 인증수첩" },
  "bike.passport.sub": {
    en: "Real riders carry a paper passport and stamp it at red certification booths along the way. Track your own progress here — tap a route once you've ridden it.",
    ko: "실제 라이더들은 종이 인증수첩을 들고 다니며 빨간 인증센터에서 도장을 찍습니다. 여기서도 똑같이 — 완주한 노선을 눌러 나만의 진행 상황을 기록해 보세요.",
  },
  "bike.passport.progress":   { en: "{n}/12 routes ridden", ko: "{n}/12 노선 완주" },
  "bike.passport.totalKm":    { en: "{km} km logged",       ko: "{km}km 기록" },
  "bike.passport.markDone":   { en: "Mark as ridden",       ko: "완주 체크" },
  "bike.passport.doneBadge":  { en: "✓ Ridden",              ko: "✓ 완주함" },
  "bike.passport.fourRivers": { en: "🏅 Four Rivers Medal",  ko: "🏅 4대강 메달" },
  "bike.passport.grandSlam":  { en: "🏆 Grand Slam Medal",   ko: "🏆 그랜드슬램 메달" },
  "bike.passport.locked":     { en: "locked",                ko: "잠김" },
  "bike.passport.unlocked":   { en: "unlocked!",             ko: "달성!" },
  "bike.passport.reset":      { en: "Reset progress",        ko: "기록 초기화" },

  // ── Bike — before you ride ────────────────────────────────────
  "bike.tips.label":   { en: "Before You Ride", ko: "출발 전 체크리스트" },
  "bike.tips.heading": {
    en: "What foreign cyclists wish they'd known",
    ko: "외국인 라이더들이 미리 알았으면 했던 것들",
  },

  // ── Bike — why section ────────────────────────────────────────
  "bike.why.label":   { en: "Why ride with this guide", ko: "이 가이드로 라이딩해야 하는 이유" },
  "bike.why.heading": {
    en: "Built for cyclists, not just road-trippers",
    ko: "자동차 여행자가 아닌, 자전거 라이더를 위해",
  },

  // ── Bike — not found ──────────────────────────────────────────
  "bike.notFound.title": { en: "Route not found", ko: "노선을 찾을 수 없습니다" },
  "bike.notFound.body": {
    en: "This bike route doesn't exist — check the 12 official national routes instead.",
    ko: "이 자전거 노선은 존재하지 않습니다 — 공식 국토종주 노선 12개를 확인해 보세요.",
  },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}

/** Like `t`, but replaces `{name}` placeholders with `vars.name`. */
export function tf(
  key: DictKey,
  lang: Lang,
  vars: Record<string, string | number>
): string {
  return dict[key][lang].replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}
