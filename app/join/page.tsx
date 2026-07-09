import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";
import JoinFlow from "@/components/join/JoinFlow";
import "./join.css";

/* ============================================================
 * 동행단 초대(Join Companion) — Phase 2 공개 플로우 셸 (Server Component)
 *   길거리 인터뷰 대상(한국 대학생·20대) 전용 모바일 웹. 한국어 전용.
 *   - searchParams.src 로 유입 출처(예: ?src=홍대) 수집 → 제출 source 로 전달.
 *   - 라이브 참여 카운트는 service-role admin 으로 안전 집계(head/count).
 *     실패·미설정·null 이면 0 으로 graceful 폴백(마이그레이션 미적용에도 페이지는 뜬다).
 *   - 인터뷰 전용 페이지라 검색 노출 불필요 → noindex.
 *   ⚠️ admin 클라이언트는 서버 전용. 이 페이지는 Server Component 라 import OK.
 * ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "K-RoadTrip · 0기 동행단 초대",
  description:
    "한국 지방 여행 앱을 만들고 있어요. 당신의 진짜 여행 경험이 필요해요. 30초만 도와줄래요?",
  robots: { index: false, follow: false },
};

/** join_submissions 총건수를 안전 집계. 실패/미설정/null → 0. */
async function getLiveCount(): Promise<number> {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) return 0;
    const { count, error } = await admin
      .from("join_submissions")
      .select("id", { count: "exact", head: true });
    if (error || typeof count !== "number") return 0;
    return count;
  } catch {
    return 0;
  }
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { src?: string | string[] };
}) {
  const count = await getLiveCount();

  const rawSrc = searchParams.src;
  const src =
    typeof rawSrc === "string"
      ? rawSrc
      : Array.isArray(rawSrc)
        ? (rawSrc[0] ?? null)
        : null;

  return (
    <div className="join-scope">
      <JoinFlow initialCount={count} source={src} />
    </div>
  );
}
