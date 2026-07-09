/* ============================================================
 * 라이딩 시간 추정 + 시간 포맷 — K-Riders 공용.
 *   duration_min 은 주행 기록 모드만 실측으로 채운다. 수동 등록 루트는
 *   null 이므로 표시 시점에 거리로 예상 시간을 계산해 "≈" 와 함께 보여준다
 *   (DB 에 추정치를 저장하지 않음 — 실측/추정 구분 유지).
 * ============================================================ */

/** 두 지점 사이 하버사인 직선거리(km).
 *  lib/motorcycle/routes.ts 의 haversineKm(저장 시 distance_km 계산 기준)와
 *  동일 구현 — 등록 화면의 실시간 합계가 저장값과 일치해야 하므로
 *  우회계수를 곱하지 않은 순수 직선거리를 반환한다. */
export function straightKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** 직선거리 합(km) → 예상 라이딩 시간(분).
 *  수동 루트의 distance_km 는 경유지 직선거리 합이라 실주행보다 짧다 —
 *  도로 우회계수 1.35(메인 앱 lib/domain/geo.ts 와 동일)를 곱한 뒤
 *  지방도 평균 40km/h 로 환산, 5분 단위 반올림(최소 5분). */
export function estimateRideMin(straightKm: number): number {
  const roadKm = straightKm * 1.35;
  return Math.max(5, Math.round(((roadKm / 40) * 60) / 5) * 5);
}

/** 분 → "1시간 30분" 표기. RouteCard/RouteDetailClient 에 중복돼 있던 것을 통합. */
export function formatDurationKo(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/** 루트의 표시용 시간 — 실측(duration_min)이 있으면 그대로, 없으면 거리 기반 추정.
 *  distance_km 는 Postgres numeric 이라 문자열일 수 있어 Number() 강제.
 *  둘 다 없으면 null(표시 생략). estimated 플래그로 "≈" 표기 여부를 정한다. */
export function displayDuration(
  durationMin: number | null,
  distanceKm: number | string | null
): { min: number; estimated: boolean } | null {
  if (durationMin != null) return { min: durationMin, estimated: false };
  const km = distanceKm != null ? Number(distanceKm) : null;
  if (km == null || !Number.isFinite(km) || km <= 0) return null;
  return { min: estimateRideMin(km), estimated: true };
}
