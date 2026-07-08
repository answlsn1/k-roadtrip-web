"use client";

import { useCallback, useEffect, useRef } from "react";

/** 가로(rotateY) 최대 기울기 — 커서가 좌/우 가장자리에 있을 때 ±5deg. */
const MAX_RY_DEG = 5;
/** 세로(rotateX) 최대 기울기 — 커서가 상/하 가장자리에 있을 때 ∓4deg. */
const MAX_RX_DEG = 4;

/**
 * 커서 위치 기반 3D 틸트 훅.
 *
 * 반환된 핸들러를 카드 요소에 달면 pointermove마다 요소 중심 대비 커서
 * 위치로 `--rx`/`--ry` CSS 변수를 rAF 배칭으로 갱신한다. 요소 쪽에서
 * `transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) …`
 * 로 소비한다 (Tailwind arbitrary transform으로 hover 리프트와 결합).
 *
 * - 터치 기기(`hover: none`)·감속 선호(`prefers-reduced-motion: reduce`)에서는
 *   완전 no-op — 변수를 아예 건드리지 않아 transform이 기본값(0deg)에 머문다.
 * - 핸들러는 `e.currentTarget` 기준이라 훅 인스턴스 하나를 목록의 여러
 *   카드에 공유해도 안전하다.
 */
export function useTilt<T extends HTMLElement = HTMLElement>() {
  const mqNoHover = useRef<MediaQueryList | null>(null);
  const mqReduced = useRef<MediaQueryList | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    mqNoHover.current = window.matchMedia("(hover: none)");
    mqReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    return () => cancelAnimationFrame(frame.current);
  }, []);

  // 이벤트 시점마다 평가 — 세션 중 OS에서 감속 선호를 켜도 즉시 no-op 전환.
  const isEnabled = useCallback(
    () =>
      mqNoHover.current !== null &&
      mqReduced.current !== null &&
      !mqNoHover.current.matches &&
      !mqReduced.current.matches,
    []
  );

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    if (!isEnabled()) return;
    // rAF 콜백 시점엔 SyntheticEvent.currentTarget이 비어 있으므로 동기 캡처.
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(-py * 2 * MAX_RX_DEG).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(px * 2 * MAX_RY_DEG).toFixed(2)}deg`);
    });
  }, [isEnabled]);

  const onPointerLeave = useCallback((e: React.PointerEvent<T>) => {
    // 터치 기기 등 비활성 환경에선 변수를 아예 기록하지 않는다(완전 no-op 계약).
    if (!isEnabled()) return;
    const el = e.currentTarget;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, [isEnabled]);

  return { onPointerMove, onPointerLeave };
}
