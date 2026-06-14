export type Lang = "en" | "ko";

export const dict = {
  // Navigation
  "nav.routes":   { en: "Routes",          ko: "코스" },
  "nav.map":      { en: "Map",             ko: "지도" },
  "nav.why":      { en: "Why K-RoadTrip",  ko: "K-RoadTrip 소개" },
  "nav.build":    { en: "+ Build Route",   ko: "+ 내 일정 만들기" },
  "nav.mytrip":   { en: "My Trip",         ko: "내 여행" },
  // Courses section
  "home.label":   { en: "Curated Routes",  ko: "전문가 추천 코스" },
  "home.heading": {
    en: "Pick a route. We did the homework.",
    ko: "루트만 고르세요. 검증은 저희가 마쳤습니다.",
  },
  "home.sub": {
    en: "Hand-built itineraries with only local-verified stops — swipe to explore.",
    ko: "현지 검증 장소만 담은 맞춤 코스 — 스와이프해서 살펴보세요.",
  },
  // Cards
  "card.viewmap": { en: "View course on map →", ko: "지도에서 코스 보기 →" },
  "card.add":     { en: "+ Add to Trip",         ko: "+ 내 여행에 추가" },
  "card.added":   { en: "✓ Added to Trip",       ko: "✓ 추가됨" },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}
