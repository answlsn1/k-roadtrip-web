"use client";

import { useEffect, useState } from "react";

/* ============================================================
 * 소셜 로그인 실패/취소 안내 — Supabase 는 OAuth 동의 화면에서
 * 사용자가 취소하거나 provider 가 에러를 반환하면 redirectTo 로
 * ?error=...&error_description=... (또는 해시)를 붙여 돌려보낸다.
 * SocialAuthButtons 는 그 시점 이후로는 실행되지 않으므로, 도착
 * 페이지(/motorcycle)에서 한 번 파싱해 보여주고 URL 을 정리한다.
 * ============================================================ */
export default function OAuthErrorBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const description =
      params.get("error_description") ?? hashParams.get("error_description");
    const error = params.get("error") ?? hashParams.get("error");
    if (!error && !description) return;

    setMessage(
      error === "access_denied"
        ? "로그인을 취소했어요."
        : "소셜 로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요."
    );

    // 새로고침 시 배너가 다시 뜨지 않도록 쿼리·해시를 지운다.
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    window.history.replaceState({}, "", url.toString());
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-auto mt-4 max-w-6xl px-5"
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400">
        {message}
      </div>
    </div>
  );
}
