/* ============================================================
 * 1차 카페 인터뷰 가이드 — 토큰 인증 체크 전용 (데이터 없음).
 * 읽기 전용 가이드 페이지(/admin/interview)의 게이트.
 * /admin/metrics·/admin/join 과 동일한 공유 토큰 패턴.
 * ============================================================ */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    // Fail closed: 토큰 미설정이면 통과시키지 않는다.
    return NextResponse.json({ error: "admin_token_not_configured" }, { status: 503 });
  }
  const token = request.headers.get("x-admin-token");
  if (!token || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
