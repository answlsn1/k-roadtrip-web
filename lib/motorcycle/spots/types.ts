/* ============================================================
 * K-Riders 스팟 DB — Phase 0 필드 사전.
 *   이 파일이 스키마(supabase/migrations)·CSV 템플릿·수집 폼·검증
 *   스크립트 네 곳의 단일 기준이다 — 필드를 추가/변경할 때 네 곳을
 *   전부 동기화할 것(한쪽만 고치지 말 것, lib/config/constants.ts
 *   의 TYPE_TAGS ↔ 0003_type_tag_check.sql 관례와 동일한 규율).
 *   enum 값은 전부 한국어 리터럴 — 현장에서 사람이 CSV/폼에 직접
 *   타이핑하는 값 그대로라 번역 레이어를 두지 않는다(수집 마찰 최소화).
 * ============================================================ */

export type SpotCategory =
  | "카페"
  | "전망포토"
  | "와인딩진입점"
  | "맛집"
  | "휴게쉼터"
  | "주유충전"
  | "정비"
  | "숙박"
  | "기타";

export type SpotSource = "직접방문" | "크루추천" | "인스타" | "네이버" | "유튜브" | "기타";

export type RoadSurface = "포장" | "일부비포장" | "비포장";

export type ParkingMoto = "양호" | "보통" | "협소" | "불가";

export type CrowdWeekend = "한적" | "보통" | "붐빔";

export type BestTime = "일출" | "오전" | "오후" | "일몰" | "야간";

export type SpotStatus = "draft" | "active" | "hidden";

export interface Spot {
  id: string;

  // 필수 6필드
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  region_sido: string;
  source: SpotSource;

  // 선택 필드 — 미보강 상태는 null
  slug: string | null;
  alt_name: string | null;
  tags: string[] | null;
  address_road: string | null;
  region_sigungu: string | null;
  access_note: string | null;
  road_surface: RoadSurface | null;
  parking_moto: ParkingMoto | null;
  /** 인근 와인딩 재미 등급 1~5 — 속도 지표 아님. */
  winding_grade: number | null;
  senior_friendly: boolean | null;
  photo_spot: boolean | null;
  photo_note: string | null;
  /** 추천 월 1~12. */
  best_season: number[] | null;
  best_time: BestTime[] | null;
  stay_minutes: number | null;
  crowd_weekend: CrowdWeekend | null;
  rating_personal: number | null;
  /** 실방문 검증 여부 — 기본 false. */
  verified: boolean;
  source_url: string | null;
  memo: string | null;
  /** Storage 경로 배열(spot-photos 버킷). */
  photos: string[] | null;
  status: SpotStatus;
  created_at: string;
  updated_at: string;
}

/** 신규 등록 입력 — 필수 6필드만 있으면 유효, 나머지는 전부 선택.
 *  id/created_at/updated_at 은 DB가 채우고, verified/status 는 기본값이 있다. */
export interface NewSpot {
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  region_sido: string;
  source: SpotSource;

  slug?: string;
  alt_name?: string;
  tags?: string[];
  address_road?: string;
  region_sigungu?: string;
  access_note?: string;
  road_surface?: RoadSurface;
  parking_moto?: ParkingMoto;
  winding_grade?: number;
  senior_friendly?: boolean;
  photo_spot?: boolean;
  photo_note?: string;
  best_season?: number[];
  best_time?: BestTime[];
  stay_minutes?: number;
  crowd_weekend?: CrowdWeekend;
  rating_personal?: number;
  verified?: boolean;
  source_url?: string;
  memo?: string;
  photos?: string[];
  status?: SpotStatus;
}
