"use client";

/* ============================================================
 * RouteBar 재해석 — 인터뷰 여정 5개 역(만남 → 같이 만들기).
 *   components/join/RouteBar 와 동일한 마크업/클래스(join.css 의
 *   .routebar 시그니처 재사용), 라벨만 인터뷰 여정으로 교체.
 * ============================================================ */

import { STATIONS } from "./interview.types";

/** 스크린리더용 단계 상태 라벨(시각적으로는 색/체크로만 구분됨). */
const STATE_SR: Record<"done" | "current" | "upcoming", string> = {
  done: "완료",
  current: "현재 단계",
  upcoming: "예정",
};

/** 0-based 현재 역 인덱스. 0=만남 … 4=같이 만들기. */
export default function InterviewRouteBar({ current }: { current: number }) {
  return (
    <nav className="routebar" aria-label="진행 단계">
      {STATIONS.map((label, i) => {
        const state =
          i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <div
            key={label}
            className={`routebar-station routebar-station--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="routebar-dot" aria-hidden="true">
              {state === "done" ? "✓" : ""}
            </span>
            <span className="routebar-label">
              {label}
              {/* 상태(완료/현재/예정)를 스크린리더에만 전달 — 시각엔 색으로만 노출 */}
              <span className="join-sr-only">{` (${STATE_SR[state]})`}</span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}
