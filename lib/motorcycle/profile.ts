"use client";

/* ============================================================
 * K-Riders 프로필 — 공개 프로필 조회, 내 프로필 수정, 라이더 통계.
 * 통계는 RLS 를 그대로 통과한 루트만 집계 — 타인 조회 시 자동으로
 * 공개 루트만 계산된다(비공개 주행 노출 없음).
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import type { MotorcycleProfile, MotorcycleRouteWithAuthor } from "./types";

export async function getProfileById(userId: string): Promise<MotorcycleProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("motorcycle_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return (data as MotorcycleProfile) ?? null;
}

export async function updateMyProfile(patch: {
  nickname?: string;
  bike_model?: string | null;
  bio?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const update: Record<string, string | null> = {};
  if (patch.nickname !== undefined) {
    const nickname = patch.nickname.trim().slice(0, 40);
    if (!nickname) return { ok: false, error: "nickname_required" };
    update.nickname = nickname;
  }
  if (patch.bike_model !== undefined) {
    update.bike_model = patch.bike_model?.trim().slice(0, 80) || null;
  }
  if (patch.bio !== undefined) {
    update.bio = patch.bio?.trim().slice(0, 300) || null;
  }

  const { error } = await supabase
    .from("motorcycle_profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface RiderStats {
  routeCount: number;
  totalKm: number;
}

/** 라이더 누적 통계 — RLS 로 인해 타인은 공개 루트만 집계됨. */
export async function getRiderStats(userId: string): Promise<RiderStats> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { routeCount: 0, totalKm: 0 };
  const { data } = await supabase
    .from("motorcycle_routes")
    .select("distance_km")
    .eq("user_id", userId);
  const rows = (data ?? []) as { distance_km: number | null }[];
  const totalKm = rows.reduce((sum, r) => sum + (Number(r.distance_km) || 0), 0);
  return { routeCount: rows.length, totalKm: Math.round(totalKm * 10) / 10 };
}

/** 특정 라이더의 루트 목록 — 타인 조회 시 RLS 가 공개 루트만 반환. */
export async function listRoutesByUser(
  userId: string
): Promise<MotorcycleRouteWithAuthor[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("motorcycle_routes")
    .select("*, motorcycle_profiles(nickname)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    ...r,
    author_nickname: r.motorcycle_profiles?.nickname ?? "라이더",
  }));
}
