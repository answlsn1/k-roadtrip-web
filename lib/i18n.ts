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
  "hero.titlePre":    { en: "Escape Seoul. Discover the ", ko: "서울을 벗어나, " },
  "hero.titleAccent": { en: "Real Korea",                 ko: "진짜 한국" },
  "hero.titlePost":   { en: ".",                          ko: "을 만나보세요." },
  "hero.sub": {
    en: "Explore scenic routes, trusted local food, and hidden gems with zero navigation stress.",
    ko: "검증된 드라이브 코스, 믿을 수 있는 현지 맛집, 숨은 명소까지 — 길 찾기 스트레스 없이.",
  },
  "hero.note": {
    en: "No login · No ads · 100% free local guide",
    ko: "로그인 없음 · 광고 없음 · 100% 무료 현지 가이드",
  },

  // ── Courses section ─────────────────────────────────────────
  "home.label":   { en: "Curated Routes",  ko: "전문가 추천 코스" },
  "home.heading": {
    en: "Pick a route. We did the homework.",
    ko: "루트만 고르세요. 검증은 저희가 마쳤습니다.",
  },
  "home.sub": {
    en: "Hand-built itineraries with only local-verified stops — swipe to explore.",
    ko: "현지 검증 장소만 담은 맞춤 코스 — 스와이프해서 살펴보세요.",
  },

  // ── Feed category titles ────────────────────────────────────
  "feed.trending":  { en: "🔥 Trending in Korea", ko: "🔥 한국에서 뜨는 코스" },
  "feed.heritage":  { en: "🏛 History & Culture", ko: "🏛 역사 & 문화" },
  "feed.ocean":     { en: "🌊 Ocean Views",       ko: "🌊 바다 전망 드라이브" },
  "feed.sponsored": { en: "⭐ Sponsored Picks",   ko: "⭐ 스폰서 추천" },
  "feed.partner":   { en: "Partner",              ko: "파트너" },

  // ── Cards ───────────────────────────────────────────────────
  "card.viewmap": { en: "View course on map →", ko: "지도에서 코스 보기 →" },
  "card.add":     { en: "+ Add to Trip",         ko: "+ 내 여행에 추가" },
  "card.added":   { en: "✓ Added to Trip",       ko: "✓ 추가됨" },

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
    en: "Map data © Google · Navigation by Naver Map",
    ko: "지도 데이터 © Google · 내비게이션 by 네이버 지도",
  },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}
