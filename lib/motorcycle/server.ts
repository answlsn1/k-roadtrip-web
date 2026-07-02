/* ============================================================
 * 서버 전용 조회 — 루트 상세 SEO(generateMetadata·OG 이미지)용.
 * anon 키 + RLS 경유라 공개 루트만 반환된다(비공개 루트는 null →
 * 메타데이터/OG 가 일반 브랜드 카드로 폴백, 정보 누출 없음).
 * "use client" 없음 — 클라이언트 번들에 포함되지 않는다.
 * ============================================================ */

import { getSupabaseServerClient } from "@/lib/data/supabaseServer";
import type { MotorcycleRoute } from "./types";

export interface PublicRouteMeta extends MotorcycleRoute {
  author_nickname: string;
  stop_names: string[];
}

export async function getPublicRouteMeta(id: string): Promise<PublicRouteMeta | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // stops 임베드는 FK(route_id→routes.id)가 있어 동작하지만, profiles 는
  // routes 와 직접 FK 가 없어 임베드 불가 — 닉네임만 별도 조회.
  const { data, error } = await supabase
    .from("motorcycle_routes")
    .select("*, motorcycle_route_stops(name, sequence)")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;

  const r = data as any;
  const { data: profile } = await supabase
    .from("motorcycle_profiles")
    .select("nickname")
    .eq("id", r.user_id)
    .maybeSingle();

  const stops = (r.motorcycle_route_stops ?? []) as { name: string; sequence: number }[];
  return {
    ...r,
    author_nickname: (profile as { nickname: string } | null)?.nickname ?? "라이더",
    stop_names: stops.sort((a, b) => a.sequence - b.sequence).map((s) => s.name),
  };
}
