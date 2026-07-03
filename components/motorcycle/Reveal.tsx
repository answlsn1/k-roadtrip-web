"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 제네시스식 스크롤 리빌 — 뷰포트 진입 시 1회 페이드업.
 * 모션 자체는 motorcycle.css 의 .kr-reveal 이 담당(reduced-motion 포함),
 * 여기서는 IntersectionObserver 로 is-visible 만 붙인다.
 */
export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`kr-reveal ${className}`}>
      {children}
    </div>
  );
}
