export interface CardMeta {
  badge: string;
  sub_en: string;
  sub_ko: string;
  chips_en: string[];
  chips_ko: string[];
}

export const CARD_META: Record<string, CardMeta> = {
  "gangneung-coastal-drive": {
    badge: "3-Day Course",
    sub_en: "Gangneung → Donghae · Coastal drives & K-pop spots",
    sub_ko: "강릉 → 동해 · 해안 드라이브 & K-팝 명소",
    chips_en: ["🌊 Sea-view cafés", "🎤 BTS bus stop", "🍲 Tofu village"],
    chips_ko: ["🌊 오션뷰 카페", "🎤 BTS 버스정류장", "🍲 초당 순두부마을"],
  },
  "gyeongju-heritage-loop": {
    badge: "2-Day Course",
    sub_en: "Gyeongju · Hanok vibes & UNESCO World Heritage",
    sub_ko: "경주 · 전통 한옥 바이브 & 유네스코 세계유산",
    chips_en: ["🏛 UNESCO tombs", "🏮 Hanok streets", "🥟 1939 bakery"],
    chips_ko: ["🏛 유네스코 고분", "🏮 한옥 거리", "🥟 1939년 황남빵"],
  },
  "jeju-volcanic-loop": {
    badge: "2-Day Course",
    sub_en: "Jeju · Sunrise crater, tea fields & emerald coves",
    sub_ko: "제주 · 일출 분화구, 녹차밭, 에메랄드 해변",
    chips_en: ["🌋 Sunrise peak", "🍵 Tea fields", "🏖 Hyeopjae beach"],
    chips_ko: ["🌋 성산일출봉", "🍵 오설록", "🏖 협재해변"],
  },
  "busan-coastal-metropolis": {
    badge: "2-Day Course",
    sub_en: "Busan · Hillside art villages & an ocean temple",
    sub_ko: "부산 · 언덕 위 예술 마을과 바다 위 사찰",
    chips_en: ["🎨 Gamcheon village", "🐟 Jagalchi market", "🌊 Haeundae"],
    chips_ko: ["🎨 감천문화마을", "🐟 자갈치시장", "🌊 해운대"],
  },
  "andong-scholars-riverside-drive": {
    badge: "2-Day Course",
    sub_en: "Andong · Folk village, Confucian academy & moonlit bridge",
    sub_ko: "안동 · 하회마을, 병산서원, 달빛 월영교",
    chips_en: ["🏯 Hahoe village", "📜 Confucian academy", "🌕 Moonlit bridge"],
    chips_ko: ["🏯 하회마을", "📜 병산서원", "🌕 월영교"],
  },
  "gyeongju-ancient-capital-drive": {
    badge: "1-Day Course",
    sub_en: "Gyeongju · UNESCO temple, royal tombs & night palace",
    sub_ko: "경주 · 불국사, 대릉원, 동궁과 월지 야경",
    chips_en: ["⛩ Bulguksa", "🏛 Royal tombs", "🌙 Night palace"],
    chips_ko: ["⛩ 불국사", "🏛 대릉원", "🌙 동궁과 월지"],
  },
  "jeonju-wanju-hanok-drive": {
    badge: "2-Day Course",
    sub_en: "Jeonju & Wanju · Hanok streets to mountain tea house",
    sub_ko: "전주 & 완주 · 한옥 골목부터 산속 고택까지",
    chips_en: ["🏘 Hanok village", "⛪ Cathedral", "🍵 250-yr hanok"],
    chips_ko: ["🏘 한옥마을", "⛪ 전동성당", "🍵 아원고택"],
  },
};

export function getCardMeta(slug: string): CardMeta {
  return (
    CARD_META[slug] ?? {
      badge: "Course",
      sub_en: "",
      sub_ko: "",
      chips_en: [],
      chips_ko: [],
    }
  );
}

// ── Video URLs for route cards ──────────────────────────────────────────────
// DEV: CC0 public-domain videos (no auth required) for local verification.
// PROD: replace with Pexels API responses:
//   GET https://api.pexels.com/videos/videos/{id}  →  video_files[].link
//   Free tier: 200 req/hr — cache signed links server-side (they expire).
const MDN = (f: string) =>
  `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/${f}`;
const WM = (path: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/transcoded/${path}`;

export const ROUTE_VIDEO_URLS: Record<string, string> = {
  "gangneung-coastal-drive":
    MDN("flower.mp4"),
  "gyeongju-heritage-loop":
    MDN("friday.mp4"),
  "jeju-volcanic-loop":
    WM("c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.webm"),
  "busan-coastal-metropolis":
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
  "andong-scholars-riverside-drive":
    MDN("flower.mp4"),
  "gyeongju-ancient-capital-drive":
    MDN("friday.mp4"),
  "jeonju-wanju-hanok-drive":
    WM("c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.webm"),
};

export function getRouteVideoUrl(slug: string): string {
  return ROUTE_VIDEO_URLS[slug] ?? MDN("flower.mp4");
}
