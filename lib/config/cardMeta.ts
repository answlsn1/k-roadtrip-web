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
  "misty-tea-roads": {
    badge: "3-Day Course",
    sub_en: "Tea terraces, wetlands & bamboo.",
    sub_ko: "차밭과 습지, 대숲을 잇는 남도 길.",
    chips_en: ["🍵 Boseong tea fields", "🌾 Suncheon Bay", "🎍 Damyang bamboo"],
    chips_ko: ["🍵 보성 차밭", "🌾 순천만", "🎍 담양 대숲"],
  },
  "south-sea-island-hop": {
    badge: "3-Day Course",
    sub_en: "Island to island, across the south sea.",
    sub_ko: "섬에서 섬으로, 한려수도를 따라.",
    chips_en: ["🏝 Namhae terraces", "🚡 Mireuksan view", "🌬 Geoje coast"],
    chips_ko: ["🏝 남해 다랭이", "🚡 미륵산 전망", "🌬 거제 해안"],
  },
  "danyang-river-cliffs": {
    badge: "2-Day Course",
    sub_en: "Where rivers carve and cliffs rise.",
    sub_ko: "강은 깎고, 절벽은 솟는 곳.",
    chips_en: ["🪨 Dodamsambong", "🌉 Mancheonha skywalk", "⛰ Sobaeksan"],
    chips_ko: ["🪨 도담삼봉", "🌉 만천하 스카이워크", "⛰ 소백산"],
  },
  "west-coast-sunset-line": {
    badge: "2-Day Course",
    sub_en: "Chasing the West Sea sunset.",
    sub_ko: "하루의 끝을 보러 가는 길.",
    chips_en: ["🌅 Kkotji sunset", "🏖 Sinduri dunes", "🌿 Cheollipo"],
    chips_ko: ["🌅 꽃지 노을", "🏖 신두리 사구", "🌿 천리포수목원"],
  },
  "jeongseon-snow-highlands": {
    badge: "3-Day Course",
    sub_en: "Highlands of snow and steel rails.",
    sub_ko: "가장 높은 곳에서 천천히.",
    chips_en: ["🪂 Byeongbangchi", "🚲 Rail bike", "🚂 Chujeon station"],
    chips_ko: ["🪂 병방치 전망", "🚲 레일바이크", "🚂 추전역"],
  },
};

// Course-length badge ("2-Day Course") localized for the KOR toggle.
const BADGE_KO: Record<string, string> = {
  "1-Day Course": "1일 코스",
  "2-Day Course": "2일 코스",
  "3-Day Course": "3일 코스",
};
export function badgeLabel(badge: string, lang: "en" | "ko"): string {
  return lang === "ko" ? BADGE_KO[badge] ?? "코스" : badge;
}

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

// Duration-type → badge label for routes that aren't hand-curated (Phase 1
// batch content). Keys mirror the `routes.duration_type` DB values.
const DURATION_BADGE_EN: Record<string, string> = {
  daytrip: "1-Day Course",
  "1n2d": "2-Day Course",
  "2n3d": "3-Day Course",
};

/**
 * Like `getCardMeta`, but falls back to a badge derived from `duration_type`
 * and a truncated description instead of an empty shell — for routes that
 * were never hand-curated into CARD_META (e.g. the Phase 1 batch of 30).
 */
export function getCardMetaForRoute(route: {
  slug: string;
  description_en: string | null;
  description_ko: string | null;
  duration_type: string | null;
}): CardMeta {
  const curated = CARD_META[route.slug];
  if (curated) return curated;
  const badge = (route.duration_type && DURATION_BADGE_EN[route.duration_type]) || "Course";
  const truncate = (s: string | null, max: number) =>
    s ? (s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s) : "";
  return {
    badge,
    sub_en: truncate(route.description_en, 90),
    sub_ko: truncate(route.description_ko, 90),
    chips_en: [],
    chips_ko: [],
  };
}

// ── Route hero videos ────────────────────────────────────────────────────────
// HARD RULE (CLAUDE.md §5): NO external sample/placeholder media in production.
// All sample URLs (MDN cc0 / Big Buck Bunny / learningcontainer) were removed.
// Fill each slug with a real, self-hosted Korean road-trip clip. Empty "" → the
// card shows the poster (thumbnail) only — a sample clip never ships.
//   Long-term: move to a Supabase `routes.video_url` column (migration + approval).
// See CONTENT-TODO.md.
export const ROUTE_VIDEO_URLS: Record<string, string> = {
  "gangneung-coastal-drive": "",          // TODO(content): self-hosted KR clip
  "gyeongju-heritage-loop": "",           // TODO(content): self-hosted KR clip
  "jeju-volcanic-loop": "",               // TODO(content): self-hosted KR clip
  "busan-coastal-metropolis": "",         // TODO(content): self-hosted KR clip
  "andong-scholars-riverside-drive": "",  // TODO(content): self-hosted KR clip
  "gyeongju-ancient-capital-drive": "",   // TODO(content): self-hosted KR clip
  "jeonju-wanju-hanok-drive": "",         // TODO(content): self-hosted KR clip
  "misty-tea-roads": "",                  // TODO(content): self-hosted KR clip
  "south-sea-island-hop": "",             // TODO(content): self-hosted KR clip
  "danyang-river-cliffs": "",             // TODO(content): self-hosted KR clip
  "west-coast-sunset-line": "",           // TODO(content): self-hosted KR clip
  "jeongseon-snow-highlands": "",         // TODO(content): self-hosted KR clip
};

export function getRouteVideoUrl(slug: string): string {
  return ROUTE_VIDEO_URLS[slug] ?? "";
}
