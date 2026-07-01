/* ============================================================
 * 어드민 집계 API (창업자 전용).
 * 1) 공유 관리자 토큰(ADMIN_DASHBOARD_TOKEN)으로 게이트 — 구글 로그인 불필요
 * 2) service_role 키로 events/routes/waypoints 집계 (RLS 우회, 서버에서만)
 * 토큰·서비스롤 키는 클라이언트로 절대 나가지 않는다.
 * ============================================================ */

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";

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
  // ── 1. founder gate: shared admin token ──────────────────
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    // Fail closed: no token configured → never serve data.
    return NextResponse.json({ error: "admin_token_not_configured" }, { status: 503 });
  }
  const token = request.headers.get("x-admin-token");
  if (!token || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
  const countryCounts: Record<string, number> = {};
  for (const s of bySession.values()) {
    if (s.country) {
      knownCountry++;
      if (s.country !== "KR") foreignByCountry++;
      countryCounts[s.country] = (countryCounts[s.country] ?? 0) + 1;
    }
    if (s.locale && !s.locale.toLowerCase().startsWith("ko")) foreignByLocale++;
  }
  const countryBreakdown = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
  const foreign = {
    totalSessions: bySession.size,
    knownCountry,
    foreignByCountry,
    foreignByLocale,
    countryBreakdown,
  };

  // ── 증거 ③ 지역 관심 (전체 vs 외국어 설정 방문자만) ──
  // "region"이 붙는 조회 이벤트를 지역별로 집계 — 언어가 한국어가 아닌 방문자만
  // 따로 세어야 "외국인이 실제로 어디에 관심 있는지"를 볼 수 있다(그냥 전체
  // 합산은 국내 방문자 조회에 묻혀 버려서 수요 파악에 못 쓴다).
  const regionCounts: Record<string, number> = {};
  const foreignRegionCounts: Record<string, number> = {};
  let metro = 0,
    rural = 0,
    foreignMetro = 0,
    foreignRural = 0;
  for (const e of events) {
    if ((e.event_type === "region_view" || e.event_type === "route_view") && e.region) {
      const isForeignLocale = !!e.locale && !e.locale.toLowerCase().startsWith("ko");
      regionCounts[e.region] = (regionCounts[e.region] ?? 0) + 1;
      if (METRO.has(e.region)) metro++;
      else rural++;
      if (isForeignLocale) {
        foreignRegionCounts[e.region] = (foreignRegionCounts[e.region] ?? 0) + 1;
        if (METRO.has(e.region)) foreignMetro++;
        else foreignRural++;
      }
    }
  }
  const dispersion = {
    regionCounts,
    foreignRegionCounts,
    metro,
    rural,
    foreignMetro,
    foreignRural,
  };

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
