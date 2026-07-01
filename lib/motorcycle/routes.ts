"use client";

/* ============================================================
 * K-Riders 루트(라이딩 기록) CRUD — 전부 클라이언트에서 Supabase 호출,
 * RLS(motorcycle 마이그레이션 참고)가 보안 경계.
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import type {
  MotorcycleRoute,
  MotorcycleRouteWithAuthor,
  MotorcycleRouteWithStops,
  NewMotorcycleRoute,
} from "./types";

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

  const { data: route, error: routeError } = await supabase
    .from("motorcycle_routes")
    .insert({
      user_id: user.id,
      title,
      description: input.description?.trim().slice(0, DESC_MAX) || null,
      region: input.region?.trim().slice(0, 80) || null,
      distance_km: totalDistanceKm(input.stops),
      is_public: input.isPublic,
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
    .select("*, motorcycle_profiles(nickname)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    ...r,
    author_nickname: r.motorcycle_profiles?.nickname ?? "라이더",
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
    .select("*, motorcycle_profiles(nickname)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    ...r,
    author_nickname: r.motorcycle_profiles?.nickname ?? "라이더",
  }));
}

export async function getRouteWithStops(id: string): Promise<MotorcycleRouteWithStops | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data: route, error } = await supabase
    .from("motorcycle_routes")
    .select("*, motorcycle_profiles(nickname)")
    .eq("id", id)
    .maybeSingle();
  if (error || !route) return null;

  const { data: stops } = await supabase
    .from("motorcycle_route_stops")
    .select("*")
    .eq("route_id", id)
    .order("sequence", { ascending: true });

  const r = route as any;
  return {
    ...r,
    author_nickname: r.motorcycle_profiles?.nickname ?? "라이더",
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
