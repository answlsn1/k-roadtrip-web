"use client";

/* ============================================================
 * K-Riders 실시간 채팅 — 단일 라운지(V1). Supabase Realtime
 * (Postgres Changes, 무료 티어)로 새 메시지를 구독자에게 브로드캐스트.
 * 로그인 사용자만 읽기/쓰기(RLS) — 소수 인원용 소통 공간이라 별도
 * 방 개념 없이 하나의 공용 라운지로 단순화했다.
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import type { MotorcycleChatMessage } from "./types";

const BODY_MAX = 500;

export async function listRecentMessages(limit = 50): Promise<MotorcycleChatMessage[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("motorcycle_chat_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as MotorcycleChatMessage[]).reverse();
}

export async function sendMessage(
  nickname: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const trimmed = body.trim().slice(0, BODY_MAX);
  if (!trimmed) return { ok: false, error: "empty" };

  const { error } = await supabase.from("motorcycle_chat_messages").insert({
    user_id: user.id,
    nickname,
    body: trimmed,
  });
  // 42501 = RLS 거부 — 0009 의 도배 방지(간격 3초·동일 내용 2분) 정책 위반 포함.
  if (error) return { ok: false, error: error.code === "42501" ? "rate_limited" : error.message };
  return { ok: true };
}

/** 새 메시지 실시간 구독. 반환값 함수를 unmount 시 호출해 해제한다. */
export function subscribeToNewMessages(
  onInsert: (msg: MotorcycleChatMessage) => void
): () => void {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel("motorcycle-lounge")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "motorcycle_chat_messages" },
      (payload) => onInsert(payload.new as MotorcycleChatMessage)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
