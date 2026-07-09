import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";
import JoinFlow from "@/components/join/JoinFlow";
import "../join/join.css";

/* ============================================================
 * 온라인 추천(Recommend) — /join(길거리 인터뷰 전용)의 온라인 버전.
 *   k-roadtrip.app 방문자 누구나 바로 들어와 자기만의 로컬 스팟을
 *   추천할 수 있는 웹 전용 플로우. 한국어 전용(로컬 지식이 있는
 *   방문자를 대상으로 하므로), 홈페이지 배너에서 유입.
 *   - JoinFlow 를 variant="online" 으로 재사용 — 컴포넌트/로직은
 *     /join 과 100% 동일, 카피(카페 만남 관련 문구)만 다르다.
 *   - join.css 를 그대로 import(스코프가 .join-scope 라 안전) — 스타일
 *     중복 없음.
 *   - join_submissions 테이블/제출 흐름을 공유 → /admin/join 대시보드에서
 *     source 값으로 유입 경로(길거리 vs 온라인)를 구분해서 볼 수 있다.
 * ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "K-RoadTrip · 나만 아는 스팟 추천하기",
  description:
    "한국 지방 여행 앱을 만들고 있어요. 당신이 다녀온 곳 중 진짜 좋았던 스팟 하나만 알려주세요. 30초면 끝나요.",
  robots: { index: false, follow: false },
};

/** join_submissions 총건수를 안전 집계(/join 과 동일 테이블 공유). 실패/미설정/null → 0. */
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

export default async function RecommendPage({
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
      <JoinFlow initialCount={count} source={src ?? "web"} variant="online" />
    </div>
  );
}
