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
  "hero.titlePre":    { en: "Take it slow. See ",  ko: "천천히, " },
  "hero.titleAccent": { en: "the real Korea",      ko: "진짜 한국" },
  "hero.titlePost":   { en: ".",                   ko: "을 보다." },
  "hero.sub": {
    en: "Discover the Korea that begins where the city ends.",
    ko: "도시가 끝나는 곳에서, 진짜 한국이 시작됩니다.",
  },
  "hero.note": {
    en: "No login · Free to use · Locally curated",
    ko: "로그인 없음 · 무료 사용 · 현지 큐레이션",
  },

  // ── Courses section ─────────────────────────────────────────
  "home.label":   { en: "Curated Routes",  ko: "현지가 검증한 코스" },
  "home.heading": {
    en: "Pick a route. We did the homework.",
    ko: "루트만 고르세요. 검증은 저희가 마쳤습니다.",
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
    ko: "지역(안동, 경주, 제주…)이나 테마(헤리티지, 해안…)로 검색해 보세요",
  },

  // ── Feed category titles ────────────────────────────────────
  "feed.trending":  { en: "🔥 Trending in Korea", ko: "🔥 한국에서 뜨는 코스" },
  "feed.beyond":    { en: "🌿 Beyond Seoul",      ko: "🌿 서울 너머" },
  "feed.heritage":  { en: "🏛 History & Culture", ko: "🏛 역사 & 문화" },
  "feed.ocean":     { en: "🌊 Ocean Views",       ko: "🌊 바다 전망 드라이브" },
  "feed.sponsored": { en: "⭐ Sponsored Picks",   ko: "⭐ 스폰서 추천" },
  "feed.partner":   { en: "Partner",              ko: "파트너" },

  // ── Cards ───────────────────────────────────────────────────
  "card.viewmap": { en: "View course on map →", ko: "지도에서 코스 보기 →" },
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
    ko: "지도 데이터 © OpenStreetMap 기여자 · 내비게이션 by 네이버 지도",
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
  "map.label":   { en: "Live Map",                   ko: "실시간 지도" },
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
  "auth.sub":     { en: "Sign in to keep your favorite drives.", ko: "로그인하고 마음에 드는 드라이브를 보관하세요." },
  "auth.inAppTitle": { en: "Google sign-in doesn't work in in-app browsers", ko: "인앱 브라우저에서는 구글 로그인이 작동하지 않습니다" },
  "auth.inAppBody": {
    en: "Tap the ⋯ menu and choose \"Open in browser\", or copy this page link into Safari/Chrome — your save will pick up right where you left off.",
    ko: "⋯ 메뉴를 눌러 '브라우저로 열기'를 선택하거나, 이 페이지 링크를 사파리·크롬에 붙여넣으세요. 저장은 떠난 자리에서 이어집니다.",
  },
  "auth.continueGoogle": { en: "Continue with Google", ko: "구글로 계속하기" },
  "auth.opening":   { en: "Opening Google…", ko: "구글 여는 중…" },
  "auth.failed":    { en: "Sign-in failed. Please try again.", ko: "로그인에 실패했습니다. 다시 시도해 주세요." },
  "auth.later":     { en: "Maybe later", ko: "나중에" },
  "auth.footnote":  { en: "Free forever · We only store your saved drives.", ko: "평생 무료 · 저장한 드라이브만 보관합니다." },

  // ── My Trip panel ───────────────────────────────────────────
  "trip.empty":     { en: "Nothing saved yet", ko: "아직 저장한 게 없습니다" },
  "trip.emptyHint": { en: "Build a route and save it, or tap ★ on any map marker.", ko: "루트를 만들어 저장하거나, 지도 마커의 ★를 눌러 장소를 저장하세요." },
  "trip.buildCta":  { en: "+ Build a route", ko: "+ 루트 만들기" },
  "trip.routesHeading": { en: "My saved routes", ko: "저장한 내 루트" },
  "trip.placesHeading": { en: "Saved places", ko: "저장한 장소" },
  "trip.openInNaver":   { en: "Open in Naver Map", ko: "네이버 지도로 열기" },
  "trip.tip": {
    en: "Traveler tip: add everything to Naver Map favorites in one sitting before the trip — not on the road.",
    ko: "여행 팁: 출발 전에 모든 장소를 네이버 지도 즐겨찾기에 한 번에 추가하세요 — 운전 중 말고요.",
  },
  "trip.copyAll":   { en: "Copy all Korean names", ko: "한국어 이름 모두 복사" },

  // ── Builder ─────────────────────────────────────────────────
  "builder.savedHint":       { en: "Build your own road trip · saved on this device", ko: "나만의 로드트립 만들기 · 이 기기에 저장됨" },
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
  "error.body":     { en: "We hit a bump on the road. Please try again in a moment.", ko: "잠시 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." },
  "error.retry":    { en: "Try again", ko: "다시 시도" },
  "notFound.title": { en: "Course not found", ko: "코스를 찾을 수 없습니다" },
  "notFound.body":  { en: "This route doesn't exist (yet) — it may be a mistyped link, or the course is still on its way.", ko: "이 코스는 (아직) 없습니다 — 링크 오타이거나, 코스가 곧 추가될 예정일 수 있습니다." },
  "notFound.back":  { en: "Back to all courses", ko: "전체 코스로 돌아가기" },
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
