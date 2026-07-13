/* ============================================================
 * K-Riders 스팟 DB — 어드민 스팟 API 공용 헬퍼 (Phase 0 · 5단계).
 *   app/api/admin/spots/ 하위 route.ts 3개(목록·등록 / 수정 / 사진)가
 *   함께 쓴다. route 파일이 아니므로 라우팅되지 않는다(_prefix = 비공개).
 *
 *   토큰 게이트는 app/api/admin/join/route.ts 의 표준 패턴을 그대로
 *   미러링: ADMIN_DASHBOARD_TOKEN 미설정 시 503 fail-closed,
 *   x-admin-token 헤더 === 비교, 불일치 401.
 *
 *   검증 기준은 lib/motorcycle/spots/validate.ts 단일 소스 —
 *   여기서는 요청 파싱·응답 포맷·DB 행 변환만 담당한다.
 * ============================================================ */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewSpot } from "@/lib/motorcycle/spots/types";
import { DEFAULT_SPOT_STATUS, DEFAULT_SPOT_VERIFIED } from "@/lib/motorcycle/spots/constants";
import type { ExistingSpotRef, SpotValidationError } from "@/lib/motorcycle/spots/validate";

export const SPOTS_TABLE = "motorcycle_spots";
export const SPOT_PHOTOS_BUCKET = "spot-photos";

/** 토큰 게이트. 통과면 null, 막히면 에러 응답을 반환(admin/join 패턴). */
export function tokenGate(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    // Fail closed: 토큰 미설정이면 절대 데이터를 서빙하지 않는다.
    return NextResponse.json(
      {
        error: "admin_token_not_configured",
        message: "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }
  const token = request.headers.get("x-admin-token");
  if (!token || token !== expected) {
    return NextResponse.json(
      { error: "unauthorized", message: "관리자 토큰이 올바르지 않습니다." },
      { status: 401 }
    );
  }
  return null;
}

export function serviceRoleMissingResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "service_role_key_missing",
      message: "서버에 SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.",
    },
    { status: 503 }
  );
}

/** 요청 body 에서 폼 raw 레코드({ raw: Record<string,string> })를 추출.
 *  문자열이 아닌 값은 버린다 — 값 검증은 validateSpots 가 담당한다.
 *  형식이 아예 아니면 null(호출부에서 badRequestBody 응답). */
export async function readRawRecord(request: Request): Promise<Record<string, string> | null> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as Record<string, unknown>).raw;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}

export function badRequestBody(): NextResponse {
  return NextResponse.json(
    {
      error: "bad_request",
      message: "요청 형식이 올바르지 않습니다 — { raw: { 필드: 문자열 } } JSON 이어야 합니다.",
    },
    { status: 400 }
  );
}

/** 검증 실패 400 — 한국어 사유 배열(reasons)로 반환. */
export function validationFailedResponse(errors: SpotValidationError[]): NextResponse {
  return NextResponse.json(
    {
      error: "validation_failed",
      message: "입력값 검증에 실패했습니다.",
      reasons: errors.map((e) => (e.field ? `${e.field}: ${e.reason}` : e.reason)),
    },
    { status: 400 }
  );
}

/** 교차 중복 검사용 기존 스팟 조회(이름/좌표/slug).
 *  excludeId 를 주면 그 행은 제외 — 수정 시 자기 자신과의 중복 오탐 방지. */
export async function fetchExistingRefs(
  admin: SupabaseClient,
  excludeId?: string
): Promise<{ refs: ExistingSpotRef[] } | { errorResponse: NextResponse }> {
  const base = admin.from(SPOTS_TABLE).select("name, lat, lng, slug");
  const { data, error } = excludeId ? await base.neq("id", excludeId) : await base;
  if (error) {
    console.error("[admin/spots] existing select failed:", error.message);
    return {
      errorResponse: NextResponse.json(
        {
          error: "query_failed",
          message: "기존 스팟 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 500 }
      ),
    };
  }
  return { refs: (data ?? []) as ExistingSpotRef[] };
}

/** 검증 통과 NewSpot → DB 행. 미입력(undefined)은 null 로 명시한다.
 *  [결정 기록] insert/update 공용 — PATCH 는 "전 편집 필드 교체(full replace)"
 *  의미(클라이언트가 항상 전체 raw 레코드를 보냄)라 undefined 를 "유지"로
 *  해석할 여지를 남기지 않는다. id/created_at/updated_at 은 포함하지 않는다
 *  (updated_at 은 DB 트리거 motorcycle_spots_touch_updated_at 가 갱신). */
export function spotToRow(spot: NewSpot & { slug: string }) {
  return {
    name: spot.name,
    category: spot.category,
    lat: spot.lat,
    lng: spot.lng,
    region_sido: spot.region_sido,
    source: spot.source,
    slug: spot.slug,
    alt_name: spot.alt_name ?? null,
    tags: spot.tags ?? null,
    address_road: spot.address_road ?? null,
    region_sigungu: spot.region_sigungu ?? null,
    access_note: spot.access_note ?? null,
    road_surface: spot.road_surface ?? null,
    parking_moto: spot.parking_moto ?? null,
    winding_grade: spot.winding_grade ?? null,
    senior_friendly: spot.senior_friendly ?? null,
    photo_spot: spot.photo_spot ?? null,
    photo_note: spot.photo_note ?? null,
    best_season: spot.best_season ?? null,
    best_time: spot.best_time ?? null,
    stay_minutes: spot.stay_minutes ?? null,
    crowd_weekend: spot.crowd_weekend ?? null,
    rating_personal: spot.rating_personal ?? null,
    verified: spot.verified ?? DEFAULT_SPOT_VERIFIED,
    source_url: spot.source_url ?? null,
    memo: spot.memo ?? null,
    photos: spot.photos ?? null,
    status: spot.status ?? DEFAULT_SPOT_STATUS,
  };
}
