"use client";

/* ============================================================
 * K-Riders 루트(라이딩 기록) CRUD — 전부 클라이언트에서 Supabase 호출,
 * RLS(motorcycle 마이그레이션 참고)가 보안 경계.
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import { computeWindingScore } from "./windingScore";
import type {
  MotorcycleRoute,
  MotorcycleRouteWithAuthor,
  MotorcycleRouteWithStops,
  NewMotorcycleRoute,
} from "./types";

// 목록 쿼리 전용 컬럼 — track_points(수십 KB jsonb)를 빼서 피드 페이로드를 줄인다.
const LIST_COLUMNS =
  "id, user_id, title, description, region, distance_km, is_public, duration_min, route_type, winding_score, moto_safe, created_at";

// ⚠️ routes.user_id 와 profiles.id 는 서로 FK 가 없어(둘 다 auth.users 참조)
// PostgREST 임베드가 불가 — 닉네임은 별도 쿼리로 가져와 클라이언트에서 합친다.
async function fetchNicknames(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  userIds: string[]
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(userIds));
  if (unique.length === 0) return {};
  const { data } = await supabase
    .from("motorcycle_profiles")
    .select("id, nickname")
    .in("id", unique);
  const map: Record<string, string> = {};
  for (const p of (data ?? []) as { id: string; nickname: string }[]) {
    map[p.id] = p.nickname;
  }
  return map;
}

const TITLE_MAX = 80;
const DESC_MAX = 500;
const STOP_NAME_MAX = 80;

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function totalDistanceKm(stops: { latitude: number; longitude: number }[]): number {
  let sum = 0;
  for (let i = 1; i < stops.length; i++) sum += haversineKm(stops[i - 1], stops[i]);
  return Math.round(sum * 10) / 10;
}

/** [[lat,lng],...] 트랙 폴리라인의 총 길이(km) — 기록 주행은 경유지 직선보다 이게 정확. */
function trackDistanceKm(points: [number, number][]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += haversineKm(
      { latitude: points[i - 1][0], longitude: points[i - 1][1] },
      { latitude: points[i][0], longitude: points[i][1] }
    );
  }
  return Math.round(sum * 10) / 10;
}

export async function createRoute(
  input: NewMotorcycleRoute
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const title = input.title.trim().slice(0, TITLE_MAX);
  if (!title) return { ok: false, error: "title_required" };
  if (input.stops.length < 2) return { ok: false, error: "need_two_stops" };

  const track =
    input.trackPoints && input.trackPoints.length >= 2 ? input.trackPoints : null;

  const { data: route, error: routeError } = await supabase
    .from("motorcycle_routes")
    .insert({
      user_id: user.id,
      title,
      description: input.description?.trim().slice(0, DESC_MAX) || null,
      region: input.region?.trim().slice(0, 80) || null,
      distance_km: track ? trackDistanceKm(track) : totalDistanceKm(input.stops),
      is_public: input.isPublic,
      track_points: track,
      duration_min: input.durationMin ?? null,
      route_type: input.routeType ?? null,
      winding_score: track ? computeWindingScore(track) : null,
      moto_safe: input.motoSafe ?? null,
    })
    .select("id")
    .single();
  if (routeError || !route) return { ok: false, error: "route_insert_failed" };

  const stopRows = input.stops.map((s, i) => ({
    route_id: route.id,
    sequence: i,
    name: s.name.trim().slice(0, STOP_NAME_MAX) || `Stop ${i + 1}`,
    latitude: s.latitude,
    longitude: s.longitude,
    note: s.note?.trim().slice(0, 200) || null,
  }));
  const { error: stopsError } = await supabase.from("motorcycle_route_stops").insert(stopRows);
  if (stopsError) {
    // 부분 실패 시 방금 만든 루트를 정리(고아 루트 방지).
    await supabase.from("motorcycle_routes").delete().eq("id", route.id);
    return { ok: false, error: "stops_insert_failed" };
  }

  return { ok: true, id: route.id as string };
}

export async function listPublicRoutes(): Promise<MotorcycleRouteWithAuthor[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("motorcycle_routes")
    .select(LIST_COLUMNS)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  const rows = data as any[];
  const nicknames = await fetchNicknames(supabase, rows.map((r) => r.user_id));
  return rows.map((r) => ({
    ...r,
    track_points: null,
    author_nickname: nicknames[r.user_id] ?? "라이더",
  }));
}

export async function listMyRoutes(): Promise<MotorcycleRouteWithAuthor[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("motorcycle_routes")
    .select(LIST_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const rows = data as any[];
  const nicknames = await fetchNicknames(supabase, [user.id]);
  return rows.map((r) => ({
    ...r,
    track_points: null,
    author_nickname: nicknames[user.id] ?? "라이더",
  }));
}

export async function getRouteWithStops(id: string): Promise<MotorcycleRouteWithStops | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data: route, error } = await supabase
    .from("motorcycle_routes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !route) return null;

  const r = route as any;
  const [{ data: stops }, nicknames] = await Promise.all([
    supabase
      .from("motorcycle_route_stops")
      .select("*")
      .eq("route_id", id)
      .order("sequence", { ascending: true }),
    fetchNicknames(supabase, [r.user_id]),
  ]);

  return {
    ...r,
    author_nickname: nicknames[r.user_id] ?? "라이더",
    stops: stops ?? [],
  };
}

export async function deleteRoute(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase.from("motorcycle_routes").delete().eq("id", id);
  return !error;
}

export type { MotorcycleRoute };
