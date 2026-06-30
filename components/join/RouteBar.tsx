"use client";

/* ============================================================
 * 시그니처 1 — RouteBar
 *   점선 라인 + 역(station) 점 5개: 출발 · 나 알기 · 탑승권 · 함께 · 탑승.
 *   현재 역 = 코랄 + coral-soft 글로우, 지난 역 = 민트 체크.
 *   quiz/ticket/why/join 단계에서 상단에 표시(hero·done 미표시).
 * ============================================================ */

const STATIONS = ["출발", "나 알기", "탑승권", "함께", "탑승"] as const;

/** 스크린리더용 단계 상태 라벨(시각적으로는 색/체크로만 구분됨). */
const STATE_SR: Record<"done" | "current" | "upcoming", string> = {
  done: "완료",
  current: "현재 단계",
  upcoming: "예정",
};

/** 0-based 현재 역 인덱스. 0=출발(=hero 직후 quiz 시작) … 4=탑승. */
export default function RouteBar({ current }: { current: number }) {
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
