/* ============================================================
 * K-Riders 스팟 DB — 어드민 수정 API (Phase 0 · 5단계).
 *   PATCH: 토큰 게이트 → 편집 가능 필드 전체 + status 전환 수정.
 *   [결정 기록] 의미상 "부분 수정"이지만 프로토콜은 full replace —
 *   클라이언트(같은 폼 컴포넌트)가 항상 전체 raw 레코드를 보내므로
 *   "미전송=유지 vs 삭제" 모호성이 없고, 검증도 등록과 문자 그대로
 *   같은 경로(validateSpots)를 태울 수 있다. 자기 자신은 교차 중복
 *   검사에서 제외한다. updated_at 은 DB 트리거가 갱신 — 손대지 않는다.
 * ============================================================ */

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";
import { validateSpots } from "@/lib/motorcycle/spots/validate";
import {
  SPOTS_TABLE,
  badRequestBody,
  fetchExistingRefs,
  readRawRecord,
  serviceRoleMissingResponse,
  spotToRow,
  tokenGate,
  validationFailedResponse,
} from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const gate = tokenGate(request);
  if (gate) return gate;

  const admin = getSupabaseAdminClient();
  if (!admin) return serviceRoleMissingResponse();

  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { error: "id_required", message: "스팟 id 가 필요합니다." },
      { status: 400 }
    );
  }
  // uuid 선검사 — 형식이 틀리면 아래 fetchExistingRefs 의 .neq("id", ...) 가
  // 먼저 22P02 로 터져 500 query_failed 로 오인 보고된다(update 단계의
  // 22P02→400 분기는 사실상 도달 불가). 진입부에서 400 으로 확정.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json(
      { error: "bad_id", message: "스팟 id 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const raw = await readRawRecord(request);
  if (!raw) return badRequestBody();

  // 자기 자신 제외 — 이름/좌표를 안 바꿔도 수정이 통과해야 한다.
  const existing = await fetchExistingRefs(admin, id);
  if ("errorResponse" in existing) return existing.errorResponse;

  const { valid, errors } = validateSpots([raw], existing.refs);
  if (errors.length > 0 || valid.length === 0) {
    return validationFailedResponse(errors);
  }

  const row = spotToRow(valid[0].spot);
  const { data, error } = await admin
    .from(SPOTS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // PGRST116 = .single() 인데 0행 — 해당 id 없음.
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "not_found", message: "해당 스팟을 찾을 수 없습니다 (이미 삭제됐을 수 있어요)." },
        { status: 404 }
      );
    }
    // 22P02 = uuid 형식 오류.
    if (error.code === "22P02") {
      return NextResponse.json(
        { error: "bad_id", message: "스팟 id 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }
    console.error("[admin/spots/:id] update failed:", error.message);
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "conflict",
          message: "같은 slug 의 스팟이 이미 있습니다 — slug 를 바꾸거나 비워(자동 생성) 다시 시도해 주세요.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "update_failed", message: "스팟 수정에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ spot: data });
}
