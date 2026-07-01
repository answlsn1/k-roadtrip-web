"use client";

/* ============================================================
 * K-Riders 인증 — Supabase Auth(email/password) 클라이언트 호출.
 *   메인 앱의 Google OAuth(AuthModal.tsx)와 별개 — K-Riders 는
 *   독립 서비스라 이메일/비밀번호 자체 회원가입을 기본으로 한다.
 *   세션은 Supabase JS 가 localStorage 로 자체 관리(이 프로젝트엔
 *   서버 쿠키 세션 인프라가 없어 클라이언트 호출 + RLS 를 보안
 *   경계로 삼는다 — builder/saved-trips 등 기존 패턴과 동일).
 * ============================================================ */

import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import type { MotorcycleProfile } from "./types";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface SignUpResult extends AuthResult {
  /** true면 이메일 확인 없이 세션이 즉시 발급됨(호출자가 바로 로그인 처리해야 함). */
  hasSession?: boolean;
}

/** 회원가입 + 라이더 프로필 생성(닉네임). 이메일 확인이 켜져 있으면 세션이 바로 안 생길 수 있음. */
export async function signUp(
  email: string,
  password: string,
  nickname: string
): Promise<SignUpResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };

  // 세션이 즉시 발급된 경우(이메일 확인 비활성)에만 프로필을 바로 만든다.
  // 확인 메일이 필요한 프로젝트 설정이면, 최초 로그인 시 ensureProfile() 이 처리한다.
  if (data.user && data.session) {
    await ensureProfile(data.user.id, nickname);
    return { ok: true, hasSession: true };
  }
  return { ok: true, hasSession: false };
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function logOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** 프로필이 없으면 만든다(최초 로그인/이메일 확인 후 복귀 시 호출). */
export async function ensureProfile(
  userId: string,
  fallbackNickname: string
): Promise<MotorcycleProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("motorcycle_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (existing) return existing as MotorcycleProfile;

  const { data, error } = await supabase
    .from("motorcycle_profiles")
    .insert({ id: userId, nickname: fallbackNickname.trim().slice(0, 40) || "라이더" })
    .select("*")
    .single();
  if (error) return null;
  return data as MotorcycleProfile;
}

export async function getMyProfile(): Promise<MotorcycleProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("motorcycle_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as MotorcycleProfile) ?? null;
}
