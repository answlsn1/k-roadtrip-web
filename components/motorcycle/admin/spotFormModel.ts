/* ============================================================
 * K-Riders 스팟 어드민 폼 — 상태 모델·변환 헬퍼 (클라이언트 전용).
 *   검증 기준은 lib/motorcycle/spots/validate.ts 단일 소스 — 여기서는
 *   "폼 상태 ↔ raw 레코드 ↔ 표시" 변환만 담당하고 규칙을 재정의하지 않는다.
 *
 *   [결정 기록] 폼 상태는 전부 문자열(칩/입력)과 배열(다중 칩)로 유지하고,
 *   저장 직전 formStateToRaw → validateSpots(parseCsvSpotRow 경유)에 태운다.
 *   CSV 검증 스크립트와 문자 그대로 같은 경로를 타므로 기준이 갈라질 수 없고,
 *   서버(POST/PATCH)도 같은 raw 레코드를 받아 같은 함수로 재검증한다.
 * ============================================================ */

import type { Spot } from "@/lib/motorcycle/spots/types";
import {
  CSV_LIST_SEPARATOR,
  type ExistingSpotRef,
  type SpotValidationError,
} from "@/lib/motorcycle/spots/validate";

/* ── 폼 상태 ───────────────────────────────────────────────── */

export interface SpotFormState {
  name: string;
  category: string;
  lat: string;
  lng: string;
  region_sido: string;
  source: string;
  slug: string;
  alt_name: string;
  /** 쉼표/세미콜론 자유 입력 — raw 변환 때 세미콜론으로 정규화. */
  tags: string;
  address_road: string;
  region_sigungu: string;
  access_note: string;
  road_surface: string;
  parking_moto: string;
  winding_grade: string;
  /** ""=미입력 · "true" · "false" — 3칩. 명시적 false 를 보존해야 해서 토글이 아니다. */
  senior_friendly: string;
  photo_spot: string;
  photo_note: string;
  best_season: number[];
  best_time: string[];
  stay_minutes: string;
  crowd_weekend: string;
  rating_personal: string;
  /** DB not null(기본 false) — 토글. */
  verified: boolean;
  source_url: string;
  memo: string;
  /** spot-photos 버킷 Storage 경로 배열. */
  photos: string[];
  /** ""(등록 시 = DB 기본 draft) 또는 enum — 전환은 목록의 전용 버튼이 담당. */
  status: string;
}

export function emptySpotFormState(): SpotFormState {
  return {
    name: "",
    category: "",
    lat: "",
    lng: "",
    region_sido: "",
    source: "",
    slug: "",
    alt_name: "",
    tags: "",
    address_road: "",
    region_sigungu: "",
    access_note: "",
    road_surface: "",
    parking_moto: "",
    winding_grade: "",
    senior_friendly: "",
    photo_spot: "",
    photo_note: "",
    best_season: [],
    best_time: [],
    stay_minutes: "",
    crowd_weekend: "",
    rating_personal: "",
    verified: false,
    source_url: "",
    memo: "",
    photos: [],
    status: "",
  };
}

export function spotToFormState(spot: Spot): SpotFormState {
  return {
    name: spot.name,
    category: spot.category,
    lat: String(spot.lat),
    lng: String(spot.lng),
    region_sido: spot.region_sido,
    source: spot.source,
    slug: spot.slug ?? "",
    alt_name: spot.alt_name ?? "",
    // 세미콜론 표시 — 리스트 구분자(CSV_LIST_SEPARATOR)와 동일해 왕복 손실이 없다.
    tags: (spot.tags ?? []).join("; "),
    address_road: spot.address_road ?? "",
    region_sigungu: spot.region_sigungu ?? "",
    access_note: spot.access_note ?? "",
    road_surface: spot.road_surface ?? "",
    parking_moto: spot.parking_moto ?? "",
    winding_grade: spot.winding_grade === null ? "" : String(spot.winding_grade),
    senior_friendly: spot.senior_friendly === null ? "" : String(spot.senior_friendly),
    photo_spot: spot.photo_spot === null ? "" : String(spot.photo_spot),
    photo_note: spot.photo_note ?? "",
    best_season: [...(spot.best_season ?? [])].sort((a, b) => a - b),
    best_time: [...(spot.best_time ?? [])],
    stay_minutes: spot.stay_minutes === null ? "" : String(spot.stay_minutes),
    crowd_weekend: spot.crowd_weekend ?? "",
    rating_personal: spot.rating_personal === null ? "" : String(spot.rating_personal),
    verified: spot.verified,
    source_url: spot.source_url ?? "",
    memo: spot.memo ?? "",
    photos: [...(spot.photos ?? [])],
    status: spot.status,
  };
}

/** tags 자유 입력 분해 — 세미콜론 단독(CSV 경로 parseCsvSpotRow 와 동일 규약).
 *  쉼표까지 분리하면 CSV 로 들어온 "쉼표 포함 태그"가 폼 왕복(수정·상태전환의
 *  full-replace PATCH)만으로 두 개로 쪼개져 저장돼 무손실성이 깨진다. */
function splitFreeList(text: string): string[] {
  return text
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 폼 상태 → CSV 와 동일한 raw 레코드(전부 문자열).
 *  이 결과를 클라이언트 선검증과 서버 검증(validateSpots)이 그대로 쓴다. */
export function formStateToRaw(s: SpotFormState): Record<string, string> {
  return {
    name: s.name.trim(),
    category: s.category,
    lat: s.lat.trim(),
    lng: s.lng.trim(),
    region_sido: s.region_sido.trim(),
    source: s.source,
    slug: s.slug.trim(),
    alt_name: s.alt_name.trim(),
    tags: splitFreeList(s.tags).join(CSV_LIST_SEPARATOR),
    address_road: s.address_road.trim(),
    region_sigungu: s.region_sigungu.trim(),
    access_note: s.access_note.trim(),
    road_surface: s.road_surface,
    parking_moto: s.parking_moto,
    winding_grade: s.winding_grade,
    senior_friendly: s.senior_friendly,
    photo_spot: s.photo_spot,
    photo_note: s.photo_note.trim(),
    best_season: [...s.best_season].sort((a, b) => a - b).join(CSV_LIST_SEPARATOR),
    best_time: s.best_time.join(CSV_LIST_SEPARATOR),
    stay_minutes: s.stay_minutes.trim(),
    crowd_weekend: s.crowd_weekend,
    rating_personal: s.rating_personal,
    verified: s.verified ? "true" : "false",
    source_url: s.source_url.trim(),
    memo: s.memo.trim(),
    photos: s.photos.join(CSV_LIST_SEPARATOR),
    status: s.status,
  };
}

/** 교차 중복 검사용 ExistingSpotRef 목록 — excludeId 는 수정 대상 자신 제외. */
export function spotsToExistingRefs(spots: readonly Spot[], excludeId?: string): ExistingSpotRef[] {
  return spots
    .filter((s) => s.id !== excludeId)
    .map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, slug: s.slug }));
}

/* ── 검증 에러 표시 ─────────────────────────────────────────── */

/** 필드 → 한국어 라벨(폼 에러 표시용 — enum 값 자체는 constants.ts 기준). */
export const FIELD_LABELS: Record<string, string> = {
  name: "이름",
  category: "카테고리",
  lat: "위도",
  lng: "경도",
  region_sido: "지역(시·도)",
  source: "수집 출처",
  slug: "슬러그",
  alt_name: "별칭",
  tags: "태그",
  address_road: "도로명 주소",
  region_sigungu: "시·군·구",
  access_note: "접근 메모",
  road_surface: "노면",
  parking_moto: "이륜차 주차",
  winding_grade: "와인딩 재미 등급",
  senior_friendly: "초보·시니어 친화",
  photo_spot: "포토 스팟",
  photo_note: "촬영 메모",
  best_season: "추천 월",
  best_time: "추천 시간대",
  stay_minutes: "체류 시간(분)",
  crowd_weekend: "주말 혼잡도",
  rating_personal: "개인 평점",
  verified: "실방문 검증",
  source_url: "출처 URL",
  memo: "메모",
  photos: "사진",
  status: "상태",
};

export function validationErrorText(e: SpotValidationError): string {
  return e.field ? `${FIELD_LABELS[e.field] ?? e.field}: ${e.reason}` : e.reason;
}

/* ── KST 시간 표시 ─────────────────────────────────────────── */

// 기기 타임존과 무관하게 한국 표준시 고정 — 해외 로밍/타임존 오설정에도 일관.
const KST_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatKst(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : KST_FORMAT.format(d);
}

/* ── 사진 ──────────────────────────────────────────────────── */

/** spot-photos 는 public 버킷 — Storage 경로 → 공개 URL. */
export function spotPhotoUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/spot-photos/${path}`;
}

/** 이미지 디코드 — createImageBitmap 우선(EXIF 회전 반영), 실패 시 <img> 폴백. */
async function decodeImage(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // 일부 브라우저/포맷 미지원 — <img> 폴백으로 진행.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** 업로드 전 클라이언트 리사이즈 — 긴 변 1600px, JPEG q0.85.
 *  새 의존성 금지 규칙에 따라 canvas/createImageBitmap 만 사용한다. */
export async function resizeImageToJpeg(
  file: File,
  maxEdge = 1600,
  quality = 0.85
): Promise<Blob> {
  const { source, width, height, cleanup } = await decodeImage(file);
  try {
    if (width === 0 || height === 0) throw new Error("빈 이미지");
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d 컨텍스트 없음");
    ctx.drawImage(source, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) throw new Error("JPEG 인코딩 실패");
    return blob;
  } finally {
    cleanup();
  }
}
