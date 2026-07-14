// ─── Google AdSense 설정 — 단일 진실 소스(single source) ─────────────────────
// 게이트 규칙(런칭 헌장 §5 준수): NEXT_PUBLIC_ADSENSE_CLIENT 값이 없으면 광고
// 관련 DOM/스크립트가 **전혀** 출력되지 않는다 — 로더(layout), 슬롯(AdSlot),
// ads.txt 라우트가 모두 이 파일의 게이트를 본다. 실값(ca-pub-…)이 들어오기
// 전까지 프로덕션 출력은 오늘과 동일해야 한다(더미 금지 헌장).
//
// 참고: AdSense 퍼블리셔 ID는 페이지 소스와 ads.txt에 공개되는 값이라
// NEXT_PUBLIC_* 노출 금지 규칙(시크릿)에 해당하지 않는다.

/** AdSense 클라이언트 ID — 형식 "ca-pub-XXXXXXXXXXXXXXXX". 미설정 시 "". */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

/** true일 때만 광고 스크립트·슬롯이 렌더된다. */
export const adsEnabled = ADSENSE_CLIENT.length > 0;

// 홈 전용 수동 배치 슬롯 ID — 슬롯 ID가 비어 있으면 해당 AdSlot은 null 렌더.
// (자동광고 금지 — 배치는 아래 수동 슬롯 2곳뿐이다. funnel 보호.)
export const ADSENSE_SLOTS = {
  homeA: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_A ?? "",
  homeB: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_B ?? "",
} as const;

export type AdSlotId = keyof typeof ADSENSE_SLOTS;
