/* ============================================================
 * K-Riders 스팟 DB — enum 값 배열 + 검증 상수.
 *   types.ts 와 함께 스키마·CSV·폼·검증 스크립트의 단일 기준.
 * ============================================================ */

import type {
  SpotCategory,
  SpotSource,
  RoadSurface,
  ParkingMoto,
  CrowdWeekend,
  BestTime,
  SpotStatus,
} from "./types";

export const SPOT_CATEGORIES: readonly SpotCategory[] = [
  "카페",
  "전망포토",
  "와인딩진입점",
  "맛집",
  "휴게쉼터",
  "주유충전",
  "정비",
  "숙박",
  "기타",
];

export const SPOT_SOURCES: readonly SpotSource[] = [
  "직접방문",
  "크루추천",
  "인스타",
  "네이버",
  "유튜브",
  "기타",
];

export const ROAD_SURFACES: readonly RoadSurface[] = ["포장", "일부비포장", "비포장"];

export const PARKING_MOTO_LEVELS: readonly ParkingMoto[] = ["양호", "보통", "협소", "불가"];

export const CROWD_WEEKEND_LEVELS: readonly CrowdWeekend[] = ["한적", "보통", "붐빔"];

export const BEST_TIMES: readonly BestTime[] = ["일출", "오전", "오후", "일몰", "야간"];

export const SPOT_STATUSES: readonly SpotStatus[] = ["draft", "active", "hidden"];

export const DEFAULT_SPOT_STATUS: SpotStatus = "draft";
export const DEFAULT_SPOT_VERIFIED = false;

// 검증 범위(4단계 spots:validate 가 그대로 재사용)
export const WINDING_GRADE_MIN = 1;
export const WINDING_GRADE_MAX = 5;
export const RATING_PERSONAL_MIN = 1;
export const RATING_PERSONAL_MAX = 5;
export const BEST_SEASON_MONTH_MIN = 1;
export const BEST_SEASON_MONTH_MAX = 12;

/** 한국 좌표 대략 범위 — 이 밖이면 좌표 오타로 간주. */
export const KOREA_LAT_MIN = 33;
export const KOREA_LAT_MAX = 39;
export const KOREA_LNG_MIN = 124;
export const KOREA_LNG_MAX = 132;

/** 동일/근접 스팟 중복 판정 반경(m) — 하버사인 거리 기준. */
export const DUPLICATE_RADIUS_M = 100;
