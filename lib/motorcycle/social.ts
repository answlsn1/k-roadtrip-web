"use client";

/* ============================================================
 * K-Riders 소셜 레이어 — 좋아요·댓글·팔로우.
 * 전부 클라이언트 Supabase 호출 + RLS(0007 마이그레이션)가 보안 경계.
 * 집계(count)는 피드 규모(≤100루트)에서 행을 받아 클라이언트에서 센다
 * — PostgREST aggregate 의존 없이 무료 티어에서 확실히 동작.
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import type { MotorcycleComment, RouteSocial } from "./types";

const COMMENT_MAX = 500;

// ── 좋아요 ────────────────────────────────────────────────────

/** 여러 루트의 좋아요/댓글 집계를 한 번에. 피드·상세 공용. */
export async function getSocialForRoutes(
  routeIds: string[]
): Promise<Record<string, RouteSocial>> {
  const result: Record<string, RouteSocial> = {};
  for (const id of routeIds) {
    result[id] = { likeCount: 0, likedByMe: false, commentCount: 0 };
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase || routeIds.length === 0) return result;

  const [{ data: likes }, { data: comments }, userRes] = await Promise.all([
    supabase.from("motorcycle_route_likes").select("route_id, user_id").in("route_id", routeIds),
    supabase.from("motorcycle_route_comments").select("route_id").in("route_id", routeIds),
    supabase.auth.getUser(),
  ]);

  const myId = userRes.data.user?.id ?? null;
  for (const like of likes ?? []) {
    const s = result[like.route_id];
    if (!s) continue;
    s.likeCount++;
    if (myId && like.user_id === myId) s.likedByMe = true;
  }
  for (const c of comments ?? []) {
    const s = result[c.route_id];
    if (s) s.commentCount++;
  }
  return result;
}

/** 좋아요 토글. 반환값 = 토글 후 상태(성공 시). */
export async function toggleLike(
  routeId: string
): Promise<{ ok: boolean; liked?: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { data: existing } = await supabase
    .from("motorcycle_route_likes")
    .select("route_id")
    .eq("route_id", routeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("motorcycle_route_likes")
      .delete()
      .eq("route_id", routeId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, liked: false };
  }

  const { error } = await supabase
    .from("motorcycle_route_likes")
    .insert({ route_id: routeId, user_id: user.id });
  if (error) return { ok: false, error: error.message };
  return { ok: true, liked: true };
}

// ── 댓글 ──────────────────────────────────────────────────────

export async function listComments(routeId: string): Promise<MotorcycleComment[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("motorcycle_route_comments")
    .select("*")
    .eq("route_id", routeId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error || !data) return [];
  return data as MotorcycleComment[];
}

export async function addComment(
  routeId: string,
  nickname: string,
  body: string
): Promise<{ ok: boolean; comment?: MotorcycleComment; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const trimmed = body.trim().slice(0, COMMENT_MAX);
  if (!trimmed) return { ok: false, error: "empty" };

  const { data, error } = await supabase
    .from("motorcycle_route_comments")
    .insert({ route_id: routeId, user_id: user.id, nickname, body: trimmed })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  return { ok: true, comment: data as MotorcycleComment };
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("motorcycle_route_comments")
    .delete()
    .eq("id", commentId);
  return !error;
}

// ── 팔로우 ────────────────────────────────────────────────────

export async function followRider(
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };
  if (user.id === targetUserId) return { ok: false, error: "self_follow" };

  const { error } = await supabase
    .from("motorcycle_follows")
    .insert({ follower_id: user.id, following_id: targetUserId });
  // 중복 팔로우(PK 충돌)는 이미 팔로우 중 — 성공으로 취급.
  if (error && !error.message.includes("duplicate")) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unfollowRider(
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { error } = await supabase
    .from("motorcycle_follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("motorcycle_follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();
  return !!data;
}

export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { followers: 0, following: 0 };
  const [followersRes, followingRes] = await Promise.all([
    supabase
      .from("motorcycle_follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("motorcycle_follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  return {
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}
