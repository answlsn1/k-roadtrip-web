import type { Metadata } from "next";
import { getPublicRouteMeta } from "@/lib/motorcycle/server";
import { windingGrade } from "@/lib/motorcycle/windingScore";
import RouteDetailClient from "./RouteDetailClient";

/* ============================================================
 * 루트 상세 — 서버 셸(SEO) + 클라이언트 본문.
 *   TRAFFIC-STRATEGY §2-D: 공유 링크가 카톡/카페/검색에서 "코스
 *   카드"로 보이는 것이 트래픽 코어. generateMetadata 는 공개
 *   루트만 채워진다(비공개는 RLS 로 null → 일반 브랜드 메타 폴백).
 *   OG 이미지는 같은 폴더의 opengraph-image.tsx 가 동적 생성.
 * ============================================================ */

export const dynamic = "force-dynamic";

interface RoutePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const route = await getPublicRouteMeta(params.id);
  if (!route) {
    return {
      title: "K-Riders — 라이더를 위한 라이딩 커뮤니티",
      description: "라이딩 루트를 기록하고 공유하고, 다른 라이더와 실시간으로 이야기하세요.",
    };
  }

  const bits: string[] = [];
  if (route.region) bits.push(route.region);
  if (route.distance_km != null) bits.push(`${route.distance_km}km`);
  if (route.winding_score != null) {
    const grade = windingGrade(Number(route.winding_score));
    bits.push(`와인딩 지수 ${Math.round(Number(route.winding_score))} · ${grade.label}`);
  }
  if (route.moto_safe) bits.push("이륜차 안전 경로 확인");
  const description =
    `${route.author_nickname}님의 라이딩 루트` +
    (bits.length > 0 ? ` — ${bits.join(" · ")}` : "") +
    ". K-Riders에서 지도와 GPX로 확인하세요.";

  return {
    title: `${route.title} — K-Riders`,
    description,
    openGraph: {
      title: `${route.title} — K-Riders`,
      description,
      type: "article",
    },
  };
}

export default function MotorcycleRoutePage({ params }: RoutePageProps) {
  return <RouteDetailClient id={params.id} />;
}
