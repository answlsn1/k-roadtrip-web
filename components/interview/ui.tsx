"use client";

/* ============================================================
 * 동행단 카페 인터뷰 — 공용 소품.
 *   ChipGroup: /join 과 동일한 <button aria-pressed> 칩 패턴.
 *   QuestionCard: 테이블 건너편에서 같이 읽는 큰 질문 + 캡처 영역.
 *   TipDetails: 인터뷰어용 진행 팁 — 대상자도 보는 화면이라
 *     숨기지 않고 "조용하게" 노출(솔직함이 라포의 전제).
 *   useClipboard: 복사 + 복사됨 표시 + 실패 시 수동 복사 폴백.
 * ============================================================ */

import { useEffect, useRef, useState, type ReactNode } from "react";

/** 다중 선택 토글 — 있으면 빼고 없으면 더한다. */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ChipGroup({
  options,
  selected,
  onToggle,
  ariaLabel,
}: {
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="join-chips" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className="join-chip"
          aria-pressed={selected.includes(opt)}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function QuestionCard({
  question,
  children,
}: {
  question: string;
  children?: ReactNode;
}) {
  return (
    <section className="join-card">
      <p className="iv-q">{question}</p>
      {children}
    </section>
  );
}

export function TipDetails({ tip }: { tip: string }) {
  return (
    <details className="iv-tip">
      <summary>💡 진행 팁</summary>
      <div className="iv-tip-body">{tip}</div>
    </details>
  );
}

/**
 * 클립보드 복사 훅.
 *   copy(key, text): key 별 "복사됨 ✓" 표시(2초) — 목록에서 행마다 구분.
 *   실패(권한 차단·비보안 컨텍스트)하면 fallbackText 에 원문을 담아
 *   수동 복사용 <textarea> 를 띄울 수 있게 한다.
 *   liveMessage: 버튼 라벨 교체만으론 스크린리더가 복사 성공을 못 듣는다 —
 *   소비자가 join-sr-only + aria-live 영역에 이 값을 렌더해 알린다.
 */
export function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // 언마운트 시 타이머 정리(느린 언마운트에서 setState 경고 방지).
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setFallbackText(null);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // 클립보드가 막힌 환경 → 원문을 그대로 보여주고 길게 눌러 복사.
      setFallbackText(text);
    }
  };

  const liveMessage = copiedKey !== null ? "기록이 복사됐어요" : "";

  return { copiedKey, fallbackText, copy, liveMessage };
}
