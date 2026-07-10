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

/**
 * 구글 소셜 로그인 — 브라우저를 구글 동의 화면으로 리다이렉트한다(성공 시 이 함수 이후 코드는 실행되지 않음).
 * ⚠ Supabase 대시보드 > Authentication > Providers 에서 Google 을 활성화하고,
 * Authentication > URL Configuration 의 Redirect URLs 에 사이트 도메인이 등록돼 있어야
 * 실제로 세션이 생긴다. 미설정 상태에서는 signInWithOAuth 가 provider 관련 에러를
 * 반환하거나, 리다이렉트 후에도 세션이 생성되지 않는다("코드는 있는데 왜 안 되지" 방지용 메모).
 */
export async function signInWithGoogle(redirectTo: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * 카카오 소셜 로그인 — 인앱 웹뷰(카카오톡 포함) 제약이 없는 provider.
 * ⚠ signInWithGoogle 과 동일하게 Supabase 대시보드에서 Kakao provider 를
 * 활성화하고 Redirect URL 을 등록해야 동작한다.
 * ⚠ scopes 를 반드시 명시한다 — Supabase 가 Kakao 에 기본 요청하는 스코프에는
 * account_email 이 포함되는데, 이건 카카오 "비즈 앱"(사업자/본인인증 전환)만
 * 쓸 수 있어 개인 개발자 앱에서는 KOE205(잘못된 요청)로 로그인 자체가 막힌다
 * (Supabase 이슈 #36878). 우리는 이메일을 안 쓰므로(닉네임 우선, deriveOAuthNickname
 * 참고) 애초에 요청하지 않는다 — signInWithOAuth 의 scopes 옵션은 기본값을
 * 대체(override)하므로 이렇게 넘기면 account_email 이 요청에서 빠진다.
 */
export async function signInWithKakao(redirectTo: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, error: "service_unavailable" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo, scopes: "profile_nickname profile_image" },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * OAuth 최초 로그인 시 프로필 닉네임 폴백을 유도한다.
 * 주의: Kakao/Google 이 Supabase user_metadata 에 정확히 어떤 키로 값을 채우는지는
 * 실제 provider 활성화 후 실계정으로 1회 확인이 필요하다 — 그래서 여러 후보 키를
 * 순서대로 시도하는 방어적 구현으로 둔다.
 */
export function deriveOAuthNickname(user: import("@supabase/supabase-js").User): string {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    metadata.nickname,
    metadata.name,
    metadata.full_name,
    metadata.preferred_username,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim().slice(0, 40);
    }
  }
  const emailLocalPart = user.email?.split("@")[0];
  if (emailLocalPart && emailLocalPart.trim().length > 0) {
    return emailLocalPart.trim().slice(0, 40);
  }
  return "라이더";
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
  if (error) {
    // 이 컴포넌트 트리에 useMotorcycleSession() 이 여러 곳(헤더+페이지)에서 동시에
    // 마운트돼 있으면 둘 다 거의 동시에 ensureProfile 을 호출할 수 있다 — insert 실패가
    // 곧 "진짜 실패"는 아니라, 다른 인스턴스가 먼저 만들었을 뿐일 수 있으므로 재조회한다.
    const { data: existing2 } = await supabase
      .from("motorcycle_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return (existing2 as MotorcycleProfile) ?? null;
  }
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
