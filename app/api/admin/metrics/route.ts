/* ============================================================
 * 어드민 집계 API (창업자 전용).
 * 1) Bearer 토큰으로 로그인 사용자 검증 → 이메일 허용목록 확인
 * 2) service_role 키로 events/routes/waypoints 집계 (RLS 우회, 서버에서만)
 * 서비스롤 키는 클라이언트로 절대 나가지 않는다.
 * ============================================================ */

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/data/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";
import { ADMIN_EMAILS } from "@/lib/config/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FUNNEL = [
  "region_view",
  "route_view",
  "plan_created",
  "naver_handoff",
  "affiliate_click",
] as const;

// Capital-area regions (none in the current rural-focused seed — kept for when
// metro routes are added, so the metro-vs-rural split stays meaningful).
const METRO = new Set(["Seoul", "Gyeonggi", "Incheon"]);

export async function GET(request: Request) {
  // ── 1. founder identity ──────────────────────────────────
  const authz = request.headers.get("authorization") ?? "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const anon = getSupabaseServerClient();
  if (!anon) return NextResponse.json({ error: "supabase_unconfigured" }, { status: 503 });

  const { data: userData } = await anon.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // ── 2. service-role reads ────────────────────────────────
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "service_role_key_missing" }, { status: 503 });
  }

  const [routesRes, placesRes, eventsRes] = await Promise.all([
    admin.from("routes").select("region_name_en").eq("is_published", true),
    admin.from("waypoints").select("*", { count: "exact", head: true }),
    admin
      .from("events")
      .select("event_type, region, country, locale, session_id")
      .limit(50000),
  ]);

  const routes = (routesRes.data ?? []) as { region_name_en: string }[];
  const events = (eventsRes.data ?? []) as {
    event_type: string;
    region: string | null;
    country: string | null;
    locale: string | null;
    session_id: string | null;
  }[];

  // ── 증거 ① 지역 커버리지 (실데이터) ──
  const coverage = {
    regions: new Set(routes.map((r) => r.region_name_en)).size,
    routes: routes.length,
    places: placesRes.count ?? 0,
  };

  // ── 증거 ② 외국인 유입 (세션 단위) ──
  const bySession = new Map<string, { country: string | null; locale: string | null }>();
  for (const e of events) {
    if (e.session_id && !bySession.has(e.session_id)) {
      bySession.set(e.session_id, { country: e.country, locale: e.locale });
    }
  }
  let knownCountry = 0,
    foreignByCountry = 0,
    foreignByLocale = 0;
  for (const s of bySession.values()) {
    if (s.country) {
      knownCountry++;
      if (s.country !== "KR") foreignByCountry++;
    }
    if (s.locale && !s.locale.toLowerCase().startsWith("ko")) foreignByLocale++;
  }
  const foreign = {
    totalSessions: bySession.size,
    knownCountry,
    foreignByCountry,
    foreignByLocale,
  };

  // ── 증거 ③ 지방 분산 ──
  const regionCounts: Record<string, number> = {};
  let metro = 0,
    rural = 0;
  for (const e of events) {
    if ((e.event_type === "region_view" || e.event_type === "route_view") && e.region) {
      regionCounts[e.region] = (regionCounts[e.region] ?? 0) + 1;
      if (METRO.has(e.region)) metro++;
      else rural++;
    }
  }
  const dispersion = { regionCounts, metro, rural };

  // ── 증거 ④ 수익 funnel ──
  const counts: Record<string, number> = Object.fromEntries(FUNNEL.map((t) => [t, 0]));
  for (const e of events) if (counts[e.event_type] != null) counts[e.event_type]++;
  const funnel = FUNNEL.map((step, i) => ({
    step,
    count: counts[step],
    fromPrev:
      i === 0 || counts[FUNNEL[i - 1]] === 0 ? null : counts[step] / counts[FUNNEL[i - 1]],
  }));

  return NextResponse.json({
    coverage,
    foreign,
    dispersion,
    funnel,
    totalEvents: events.length,
    generatedAt: new Date().toISOString(),
  });
}
