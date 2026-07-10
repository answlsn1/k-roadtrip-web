"use client";

/* ============================================================
 * K-Riders 소셜 로그인 버튼 — 구글 + 카카오.
 *   메인 앱 AuthModal.tsx(components/auth) 의 구글 패턴을 참고했지만
 *   K-Riders 전용 다크 카드 위에 맞춰 새로 작성 — import 하지 않는다.
 *   Naver 는 이번 스코프 제외(별도 커스텀 브릿지 필요, 미승인).
 *
 *   ⚠ 카카오는 임시로 숨김(KAKAO_ENABLED=false) — 개인 개발자 앱은
 *   account_email 스코프를 못 써서 KOE205 로 막힌다(auth.ts 의
 *   signInWithKakao 주석 참고, scopes 를 profile_nickname/profile_image
 *   로 제한해 코드는 고쳤지만 카카오 쪽 반영 확인 전까지 사용자에게는
 *   숨겨둔다). 재확인되면 이 상수만 true 로 되돌리면 된다.
 * ============================================================ */

import { useEffect, useState } from "react";
import { isInAppBrowser } from "@/lib/browserEnv";
import { signInWithGoogle, signInWithKakao } from "@/lib/motorcycle/auth";

const KAKAO_ENABLED = false;

interface SocialAuthButtonsProps {
  /** 로그인 후 도착해야 할 경로(예: "/motorcycle") — signInWithOAuth 는 풀 URL을 요구하므로
   *  클릭 핸들러 내부에서 `${window.location.origin}${redirectTo}` 로 조립한다(SSR 안전). */
  redirectTo: string;
}

export default function SocialAuthButtons({ redirectTo }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "kakao" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  // 서버(navigator 없음)와 최초 클라이언트 렌더는 항상 false로 맞춰 하이드레이션
  // 불일치를 막는다 — 실제 UA 판정은 마운트 후에만 반영(구글 버튼 ↔ 인앱 경고 전환).
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
  }, []);

  const busy = loadingProvider !== null;

  const handleGoogle = async () => {
    if (busy) return;
    setError(null);
    setLoadingProvider("google");
    const result = await signInWithGoogle(`${window.location.origin}${redirectTo}`);
    if (!result.ok) {
      console.error("motorcycle signInWithGoogle error:", result.error);
      setError("로그인 연동에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoadingProvider(null);
    }
    // 성공 시 브라우저가 구글로 이동 — 이후 코드는 실행되지 않는다.
  };

  const handleKakao = async () => {
    if (busy) return;
    setError(null);
    setLoadingProvider("kakao");
    const result = await signInWithKakao(`${window.location.origin}${redirectTo}`);
    if (!result.ok) {
      console.error("motorcycle signInWithKakao error:", result.error);
      setError("로그인 연동에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoadingProvider(null);
    }
    // 성공 시 브라우저가 카카오로 이동 — 이후 코드는 실행되지 않는다.
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* 클립보드 접근 차단 — 조용히 무시 */
    }
  };

  return (
    <div>
      <div className="space-y-2.5">
        {/* 구글 — 브랜드 가이드가 요구하는 표준 흰 배경 버튼. 다크 카드 위라도 변형하지 않는다. */}
        {inAppBrowser ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
            <p className="text-xs font-bold text-amber-400">
              지금 브라우저에서는 구글 로그인을 열 수 없어요
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-400/80">
              카카오톡 등 인앱 브라우저는 구글 정책상 로그인이 막혀 있어요. 링크를
              복사해 크롬이나 사파리 같은 기본 브라우저에서 열어주세요.
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-2 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
            >
              {linkCopied ? "링크가 복사됐어요" : "링크 복사하기"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            aria-label="구글 계정으로 계속하기"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow active:scale-[0.99] disabled:opacity-70"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {loadingProvider === "google" ? "여는 중…" : "구글 계정으로 계속하기"}
          </button>
        )}

        {/* 카카오 — 공식 브랜드 색 고정(배경 #FEE500, 심볼 #000000, 레이블 rgba(0,0,0,.85) —
            개발자 가이드 색상 규정 그대로. 다크 테마에 맞춘 임의 변형 금지).
            KOE205 재확인 전까지 KAKAO_ENABLED 로 숨김(파일 상단 주석 참고). */}
        {KAKAO_ENABLED && (
          <button
            type="button"
            onClick={handleKakao}
            disabled={busy}
            aria-label="카카오 계정으로 계속하기"
            className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.99] disabled:opacity-70"
            style={{ backgroundColor: "#FEE500", color: "rgba(0,0,0,.85)" }}
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#000000"
                d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.87 5.37 4.69 6.79-.16.6-.99 3.62-1.02 3.85 0 0-.02.17.09.24.11.07.24.02.24.02.32-.04 3.69-2.42 4.28-2.84.55.08 1.12.12 1.72.12 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
              />
            </svg>
            {loadingProvider === "kakao" ? "여는 중…" : "카카오 계정으로 계속하기"}
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--kr-line)]" />
        <span className="text-xs font-semibold text-slate-500">또는</span>
        <div className="h-px flex-1 bg-[var(--kr-line)]" />
      </div>
    </div>
  );
}
