/* ============================================================
 * 와인딩 지수 (K-Calimeter) — 기록 트랙의 "구불구불함"을 0~100
 * 점수 하나로. Calimoto Calimeter 벤치마킹, 계산은 자체 구현
 * (단위거리당 방위각 변화 합) — 라이선스 청정(TRAFFIC-STRATEGY §2-B).
 * 포인트는 15m 이상 이동 시에만 수집되므로(record 페이지) GPS
 * 지터로 인한 과대 계산은 제한적이다.
 * ============================================================ */

const EARTH_R_KM = 6371;

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

function distanceKm(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** a→b 방위각(도, 0~360). */
function bearing(a: [number, number], b: [number, number]): number {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * 와인딩 지수 계산. 트랙이 너무 짧으면(10포인트 또는 1km 미만) null —
 * 의미 없는 점수를 만들지 않는다. 스케일: 직선 국도 ≈ 한 자릿수,
 * 헤어핀 고개(이화령·성삼재급) ≈ 80~100.
 */
export function computeWindingScore(points: [number, number][]): number | null {
  if (points.length < 10) return null;

  let totalKm = 0;
  let totalTurnDeg = 0;
  let prevBearing: number | null = null;

  for (let i = 1; i < points.length; i++) {
    totalKm += distanceKm(points[i - 1], points[i]);
    const b = bearing(points[i - 1], points[i]);
    if (prevBearing !== null) {
      let delta = Math.abs(b - prevBearing);
      if (delta > 180) delta = 360 - delta;
      totalTurnDeg += delta;
    }
    prevBearing = b;
  }

  if (totalKm < 1) return null;
  const degPerKm = totalTurnDeg / totalKm;
  return Math.min(100, Math.round(degPerKm / 6));
}

export interface WindingGrade {
  label: string;
  emoji: string;
}

/** 점수 → 소비자용 등급 라벨. */
export function windingGrade(score: number): WindingGrade {
  if (score >= 80) return { label: "헤어핀 코스", emoji: "🌀" };
  if (score >= 50) return { label: "와인딩 명소", emoji: "🏔️" };
  if (score >= 20) return { label: "즐거운 커브", emoji: "〰️" };
  return { label: "순한 길", emoji: "➖" };
}
