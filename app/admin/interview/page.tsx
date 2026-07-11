"use client";

/* ============================================================
 * 동행단 카페 인터뷰 — 같이 보는 세션 (/admin/interview).
 * 토큰 게이트는 /admin/metrics·/admin/join 패턴 그대로 미러
 * (krt-admin-token 재사용 → 토큰 하나로 모든 어드민 화면 열림).
 * ready 이후에는 구 "읽기 전용 대본" 대신, 인터뷰어와 대상자가
 * 카페 테이블에서 폰 화면을 "함께 보며" 진행하는 InterviewSession
 * 을 렌더 — 대화 가이드 + 구조화 기록(localStorage 전용, 서버 기록 없음).
 * join.css 는 .join-scope 하위로 완전 스코프 → 여기서 import 해도
 * 다른 화면에 새지 않는다(/recommend 와 동일한 재사용 패턴).
 * ============================================================ */

import { useEffect, useState } from "react";
import InterviewSession from "@/components/interview/InterviewSession";
import "../../join/join.css";
import "./interview.css";

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

export default function AdminInterviewPage() {
  const [view, setView] = useState<View>("locked");
  const [tokenInput, setTokenInput] = useState("");
  const [detail, setDetail] = useState<string | null>(null);

  const load = async (token: string) => {
    setView("loading");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/interview", {
        headers: { "x-admin-token": token },
        cache: "no-store",
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setDetail("토큰이 올바르지 않습니다. 다시 입력해 주세요.");
        setView("locked");
        return;
      }
      if (res.status === 503) {
        setDetail(
          "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
        );
        setView("unconfigured");
        return;
      }
      if (!res.ok) {
        setView("error");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      setView("ready");
    } catch {
      setView("error");
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (t) load(t);
  };

  const lock = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setTokenInput("");
    setDetail(null);
    setView("locked");
  };

  // ready — 인터뷰 세션(같이 보는 화면). join.css 디자인 시스템 스코프 적용.
  if (view === "ready") {
    return (
      <main className="join-scope iv">
        <InterviewSession onLock={lock} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl bg-white px-5 py-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          K-RoadTrip · 비공개
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">동행단 카페 인터뷰</h1>
      </div>

      {(view === "locked" || view === "unconfigured" || view === "error") && (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          {view === "unconfigured" ? (
            <>
              <p className="font-bold text-slate-800">설정이 필요합니다</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
            </>
          ) : view === "error" ? (
            <p className="font-bold text-slate-800">불러오지 못했습니다</p>
          ) : (
            <>
              <p className="font-bold text-slate-800">관리자 토큰 입력</p>
              <p className="mt-1 text-sm text-slate-500">인터뷰 진행 전용 화면입니다.</p>
              <form onSubmit={submit} className="mt-4 flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ADMIN_DASHBOARD_TOKEN"
                  autoFocus
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white active:scale-[0.99]"
                >
                  열기
                </button>
              </form>
              {detail && <p className="mt-2 text-xs font-semibold text-rose-500">{detail}</p>}
            </>
          )}
        </div>
      )}

      {view === "loading" && (
        <p className="mt-16 text-center text-sm text-slate-400">불러오는 중…</p>
      )}
    </main>
  );
}
