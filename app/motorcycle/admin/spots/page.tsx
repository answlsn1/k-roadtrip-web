"use client";

/* ============================================================
 * K-Riders 스팟 어드민 — 수집 폼/목록 (Phase 0 · 5단계, 창업자 전용).
 *   토큰 게이트는 app/admin/join/page.tsx 표준 패턴 미러링:
 *   sessionStorage "krt-admin-token" 캐싱(어드민 화면 공용 — 한 번
 *   로그인으로 전부 접근), 401 → 재입력, 503 → 미설정 안내.
 *   이 화면으로 가는 링크는 어디에도 추가하지 않는다(직접 URL 전용).
 *   [결정 기록] 탭 전환 시 두 패널을 hidden 으로만 숨긴다 — 등록 중
 *   목록을 확인하고 돌아와도 작성 내용이 유지된다(현장 1분 등록 최적화).
 * ============================================================ */

import { useEffect, useState } from "react";
import type { Spot } from "@/lib/motorcycle/spots/types";
import SpotForm from "@/components/motorcycle/admin/SpotForm";
import SpotList from "@/components/motorcycle/admin/SpotList";
import { spotsToExistingRefs } from "@/components/motorcycle/admin/spotFormModel";

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

function tabClass(selected: boolean): string {
  return `min-h-[44px] flex-1 rounded-full border px-4 py-2.5 text-sm font-bold transition-colors ${
    selected
      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
  }`;
}

export default function AdminSpotsPage() {
  const [view, setView] = useState<View>("locked");
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [tab, setTab] = useState<"form" | "list">("form");
  const [toast, setToast] = useState<string | null>(null);

  const load = async (t: string) => {
    setView("loading");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/spots", {
        headers: { "x-admin-token": t },
        cache: "no-store",
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setDetail("토큰이 올바르지 않습니다. 다시 입력해 주세요.");
        setView("locked");
        return;
      }
      if (res.status === 503) {
        const j = await res.json().catch(() => ({}));
        setDetail(
          j.error === "service_role_key_missing"
            ? "서버에 SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
            : "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
        );
        setView("unconfigured");
        return;
      }
      if (!res.ok) {
        setView("error");
        return;
      }
      const j = (await res.json()) as { spots: Spot[] };
      sessionStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setSpots(j.spots);
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

  // 토스트 자동 숨김 — 연속 입력 흐름을 막지 않는다.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const submitToken = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (t) load(t);
  };

  const lock = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTokenInput("");
    setSpots([]);
    setDetail(null);
    setView("locked");
  };

  const onUnauthorized = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setDetail("토큰 인증이 만료됐거나 올바르지 않습니다. 다시 입력해 주세요.");
    setView("locked");
  };

  const handleCreated = (spot: Spot) => {
    setSpots((prev) => [spot, ...prev]);
    setToast(`등록됨: ${spot.name}`);
  };

  const handleUpdated = (spot: Spot) => {
    setSpots((prev) => prev.map((s) => (s.id === spot.id ? spot : s)));
    setToast(`수정됨: ${spot.name}`);
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-2xl px-4 pb-28">
      <div className="flex items-center justify-between pt-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
            K-Riders · 비공개
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-white">스팟 수집 관리</h1>
        </div>
        {view === "ready" && (
          <button
            type="button"
            onClick={lock}
            className="min-h-[40px] px-2 text-xs font-semibold text-slate-500 hover:text-white"
          >
            잠그기
          </button>
        )}
      </div>

      {(view === "locked" || view === "unconfigured" || view === "error") && (
        <div className="kr-card mt-10 p-6">
          {view === "unconfigured" ? (
            <>
              <p className="font-bold text-white">설정이 필요합니다</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{detail}</p>
            </>
          ) : view === "error" ? (
            <>
              <p className="font-bold text-white">데이터를 불러오지 못했습니다</p>
              <p className="mt-1 text-sm text-slate-400">
                네트워크 상태를 확인한 뒤 새로고침해 주세요.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-white">관리자 토큰 입력</p>
              <p className="mt-1 text-sm text-slate-400">창업자 전용 화면입니다.</p>
              <form onSubmit={submitToken} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ADMIN_DASHBOARD_TOKEN"
                  autoFocus
                  aria-label="관리자 토큰"
                  className="kr-input flex-1 px-4 py-3 text-[16px] sm:text-sm"
                />
                <button type="submit" className="kr-btn-primary px-6 py-3 text-sm">
                  열기
                </button>
              </form>
              {detail && <p className="mt-2 text-xs font-semibold text-red-400">{detail}</p>}
            </>
          )}
        </div>
      )}

      {view === "loading" && (
        <p className="mt-16 text-center text-sm text-slate-500">불러오는 중…</p>
      )}

      {view === "ready" && token && (
        <>
          <div className="mt-6 flex gap-2" role="group" aria-label="화면 전환">
            <button
              type="button"
              onClick={() => setTab("form")}
              aria-pressed={tab === "form"}
              className={tabClass(tab === "form")}
            >
              ➕ 등록
            </button>
            <button
              type="button"
              onClick={() => setTab("list")}
              aria-pressed={tab === "list"}
              className={tabClass(tab === "list")}
            >
              목록 ({spots.length})
            </button>
          </div>

          {/* 탭은 hidden 으로만 전환 — 작성 중인 등록 폼 상태를 유지한다. */}
          <div className={tab === "form" ? "mt-5" : "hidden"}>
            <SpotForm
              mode="create"
              token={token}
              existing={spotsToExistingRefs(spots)}
              onSaved={handleCreated}
              onUnauthorized={onUnauthorized}
            />
          </div>
          <div className={tab === "list" ? "mt-5" : "hidden"}>
            <SpotList
              spots={spots}
              token={token}
              onUpdated={handleUpdated}
              onUnauthorized={onUnauthorized}
            />
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 truncate rounded-full border border-amber-500/40 bg-[var(--kr-surface-2)] px-5 py-2.5 text-sm font-bold text-amber-400 shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
