/* ============================================================
 * 이벤트 수집 엔드포인트 — 클라이언트가 fire-and-forget POST.
 * 서버에서 거친 국가코드(Vercel `x-vercel-ip-country`)를 보강해
 * Supabase `events` 테이블에 anon insert(RLS 허용)로 적재한다.
 * 조회는 절대 하지 않는다(서비스롤 대시보드 전용). PII 저장 금지.
 * ============================================================ */

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/data/supabaseServer";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "region_view",
  "route_view",
  "plan_created",
  "naver_handoff",
  "affiliate_click",
  // 동행단 초대(Join Companion) 퍼널 6종
  "join_view",
  "join_quiz_start",
  "join_quiz_complete",
  "join_ticket_view",
  "join_why_view",
  "join_submit",
]);

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

export async function POST(request: Request) {
  try {
    const b = (await request.json()) as Record<string, unknown>;

    if (typeof b.event_type !== "string" || !ALLOWED.has(b.event_type)) {
      return NextResponse.json({ ok: false, error: "bad_event_type" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ ok: false }); // env not set → no-op

    // Coarse country from the edge (aggregation only; not PII). Header is set
    // by Vercel in production; absent locally → null.
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country") ||
      null;

    await supabase.from("events").insert({
      event_type: b.event_type,
      region: str(b.region, 80),
      route_id: str(b.route_id, 120),
      locale: str(b.locale, 35),
      country: country ? country.slice(0, 2).toUpperCase() : null,
      affiliate_partner: str(b.affiliate_partner, 60),
      referrer: str(b.referrer, 300),
      session_id: str(b.session_id, 80),
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface analytics failures to the client.
    return NextResponse.json({ ok: false });
  }
}
