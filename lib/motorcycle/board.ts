"use client";

/* ============================================================
 * 라이더챗 게시판 — 글/댓글/좋아요/신고 CRUD.
 * 스팸 방어의 진짜 방어선은 0009 마이그레이션의 RESTRICTIVE RLS
 * (간격·일일 상한·동일 내용 반복 차단) — 여기서는 그 위반(42501)을
 * "rate_limited" 로 매핑해 UI 가 친절한 안내를 띄우게만 한다.
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";

export type BoardCategory = "chat" | "question" | "info" | "meetup" | "gear";

export const BOARD_CATEGORIES: { value: BoardCategory; label: string }[] = [
  { value: "chat", label: "잡담" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보" },
  { value: "meetup", label: "모임·번개" },
  { value: "gear", label: "장비" },
];

export function boardCategoryLabel(value: string): string {
  return BOARD_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export interface MotorcyclePost {
  id: string;
  user_id: string;
  nickname: string;
  category: string;
  title: string;
  body: string;
  created_at: string;
}

export interface MotorcyclePostListItem extends MotorcyclePost {
  commentCount: number;
  likeCount: number;
}

export interface MotorcyclePostComment {
  id: string;
  post_id: string;
  user_id: string;
  nickname: string;
  body: string;
  created_at: string;
}

/** RLS 위반(도배 방지 정책 포함)을 사용자 안내용 코드로 변환. */
function mapInsertError(error: { code?: string; message: string }): string {
  if (error.code === "42501") return "rate_limited";
  if (error.code === "23505") return "already_exists";
  return error.message;
}

// ── 글 ────────────────────────────────────────────────────────

export async function listPosts(
  category?: BoardCategory | null
): Promise<MotorcyclePostListItem[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  let query = supabase
    .from("motorcycle_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error || !data) return [];
  const posts = data as MotorcyclePost[];
  if (posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase.from("motorcycle_post_comments").select("post_id").in("post_id", ids),
    supabase.from("motorcycle_post_likes").select("post_id").in("post_id", ids),
  ]);

  const commentCounts: Record<string, number> = {};
  for (const c of (comments ?? []) as { post_id: string }[]) {
    commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1;
  }
  const likeCounts: Record<string, number> = {};
  for (const l of (likes ?? []) as { post_id: string }[]) {
    likeCounts[l.post_id] = (likeCounts[l.post_id] ?? 0) + 1;
  }

  return posts.map((p) => ({
    ...p,
    commentCount: commentCounts[p.id] ?? 0,
    likeCount: likeCounts[p.id] ?? 0,
  }));
}

export async function getPost(id: string): Promise<MotorcyclePost | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("motorcycle_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as MotorcyclePost) ?? null;
}

export async function createPost(input: {
  category: BoardCategory;
  title: string;
  body: string;
  nickname: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const title = input.title.trim().slice(0, 100);
  const body = input.body.trim().slice(0, 5000);
  if (title.length < 2) return { ok: false, error: "title_required" };
  if (body.length < 2) return { ok: false, error: "body_required" };

  const { data, error } = await supabase
    .from("motorcycle_posts")
    .insert({
      user_id: user.id,
      nickname: input.nickname,
      category: input.category,
      title,
      body,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error ? mapInsertError(error) : "insert_failed" };
  }
  return { ok: true, id: data.id as string };
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase.from("motorcycle_posts").delete().eq("id", id);
  return !error;
}

// ── 댓글 ──────────────────────────────────────────────────────

export async function listPostComments(postId: string): Promise<MotorcyclePostComment[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("motorcycle_post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(300);
  if (error || !data) return [];
  return data as MotorcyclePostComment[];
}

export async function addPostComment(
  postId: string,
  nickname: string,
  body: string
): Promise<{ ok: boolean; comment?: MotorcyclePostComment; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const trimmed = body.trim().slice(0, 500);
  if (!trimmed) return { ok: false, error: "empty" };

  const { data, error } = await supabase
    .from("motorcycle_post_comments")
    .insert({ post_id: postId, user_id: user.id, nickname, body: trimmed })
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, error: error ? mapInsertError(error) : "insert_failed" };
  }
  return { ok: true, comment: data as MotorcyclePostComment };
}

export async function deletePostComment(commentId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("motorcycle_post_comments")
    .delete()
    .eq("id", commentId);
  return !error;
}

// ── 좋아요 ────────────────────────────────────────────────────

export async function getPostSocial(
  postId: string
): Promise<{ likeCount: number; likedByMe: boolean }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { likeCount: 0, likedByMe: false };
  const [{ data: likes }, userRes] = await Promise.all([
    supabase.from("motorcycle_post_likes").select("user_id").eq("post_id", postId),
    supabase.auth.getUser(),
  ]);
  const myId = userRes.data.user?.id ?? null;
  const rows = (likes ?? []) as { user_id: string }[];
  return {
    likeCount: rows.length,
    likedByMe: myId ? rows.some((l) => l.user_id === myId) : false,
  };
}

export async function togglePostLike(
  postId: string
): Promise<{ ok: boolean; liked?: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { data: existing } = await supabase
    .from("motorcycle_post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("motorcycle_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, liked: false };
  }

  const { error } = await supabase
    .from("motorcycle_post_likes")
    .insert({ post_id: postId, user_id: user.id });
  if (error) return { ok: false, error: mapInsertError(error) };
  return { ok: true, liked: true };
}

// ── 신고 ──────────────────────────────────────────────────────

export async function reportContent(
  targetType: "post" | "post_comment" | "route" | "route_comment" | "chat",
  targetId: string,
  reason?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { error } = await supabase.from("motorcycle_reports").insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason: reason?.trim().slice(0, 300) || null,
  });
  if (error) return { ok: false, error: mapInsertError(error) };
  return { ok: true };
}
