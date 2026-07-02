/* ============================================================
 * K-Riders 배지 — 누적 주행거리/루트 수 기반 마일스톤(클라이언트 계산).
 * REVER 의 챌린지/뱃지를 경량으로 벤치마킹 — 별도 테이블 없이
 * getRiderStats() 결과에서 즉시 산출한다. 633km = 인천→부산
 * 국토종주 거리(메인 앱 /bike 콘텐츠와 세계관 공유).
 * ============================================================ */

export interface RiderBadge {
  id: string;
  emoji: string;
  name: string;
  /** 달성 조건 설명(미달성 시 잠금 카드에 그대로 노출). */
  condition: string;
  earned: (stats: { totalKm: number; routeCount: number }) => boolean;
}

export const RIDER_BADGES: RiderBadge[] = [
  {
    id: "first-ignition",
    emoji: "🔑",
    name: "첫 시동",
    condition: "첫 루트 등록",
    earned: (s) => s.routeCount >= 1,
  },
  {
    id: "weekend-rider",
    emoji: "🛵",
    name: "주말 라이더",
    condition: "누적 100km",
    earned: (s) => s.totalKm >= 100,
  },
  {
    id: "winding-hunter",
    emoji: "🏔️",
    name: "와인딩 헌터",
    condition: "누적 300km",
    earned: (s) => s.totalKm >= 300,
  },
  {
    id: "cross-country",
    emoji: "🇰🇷",
    name: "국토종주급",
    condition: "누적 633km (인천→부산 거리)",
    earned: (s) => s.totalKm >= 633,
  },
  {
    id: "iron-butt",
    emoji: "🦾",
    name: "아이언 라이더",
    condition: "누적 1,500km",
    earned: (s) => s.totalKm >= 1500,
  },
  {
    id: "grand-tour",
    emoji: "🏆",
    name: "전국일주",
    condition: "누적 3,000km",
    earned: (s) => s.totalKm >= 3000,
  },
];

/** 이달의 챌린지 목표(km) — 시즌제 도입 전까지 고정값. */
export const MONTHLY_CHALLENGE_KM = 500;

/** created_at(ISO)들이 이번 달인 루트의 거리 합계 — 이달의 챌린지 진행률용. */
export function monthlyKm(
  routes: { created_at: string; distance_km: number | null }[]
): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const sum = routes.reduce((acc, r) => {
    const d = new Date(r.created_at);
    if (d.getFullYear() === y && d.getMonth() === m) {
      return acc + (Number(r.distance_km) || 0);
    }
    return acc;
  }, 0);
  return Math.round(sum * 10) / 10;
}
