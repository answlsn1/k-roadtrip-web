"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The single primary CTA in car mode — fixed to the right-middle of the
 * viewport, linking to /builder. The navbar stays tertiary/quiet so this is
 * the only solid-ink action on screen.
 *
 * Layout (사장님 디렉션): vertical stack [route icon / MY / ROUTE].
 * The label is fixed English in BOTH language modes (brand-style label, not a
 * translated string) — so no i18n dependency here. The route icon (start dot
 * → dashed path → destination pin) carries the meaning at a glance.
 *
 * - Hidden on /builder — the FAB's own destination.
 * - z-30: under navbar (z-50), mobile drawer (z-40) and MyTripPanel /
 *   TripLedgerSheet layers (z-[900]+); above page content. Leaflet maps are
 *   contained with `isolate` on their wrapper (MapSection).
 * - Rendered visible from SSR (no JS-gated entrance); press/hover feedback
 *   respects motion-reduce.
 */
export default function BuildRouteFab() {
  const pathname = usePathname();

  if (pathname?.startsWith("/builder")) return null;

  return (
    <Link
      href="/builder"
      className={[
        "fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center",
        "gap-0.5 rounded-full bg-ink px-2.5 py-3.5 text-white shadow-float-dark",
        // hover 리프트: 기본 -translate-y-1/2(수직 센터링)를 대체하는 유틸이라
        // calc로 센터링+2px 부양을 합성 — 값 교체 시 FAB가 점프하지 않게 주의.
        "transition duration-300 ease-out hover:bg-slate-700 hover:translate-y-[calc(-50%-2px)] hover:shadow-float-dark-lg active:scale-95",
        "motion-reduce:transition-none motion-reduce:hover:-translate-y-1/2",
        // 어두운 사진 위에서도 흰 링, 흰 배경 위에서도 ink 아웃라인이 보이게 2중 포커스 표시.
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink focus-visible:ring-2 focus-visible:ring-white",
        "md:right-6 md:gap-1 md:px-3.5 md:py-5",
      ].join(" ")}
    >
      {/* 루트 아이콘: 출발점 ● → 점선 경로 → 도착 핀. 어두운 배경 위 시인성 우선. */}
      <svg
        className="h-5 w-5 md:h-7 md:w-7"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="5.5" cy="5" r="2.1" fill="currentColor" />
        <path
          d="M5.5 7.6v4.9a4.2 4.2 0 0 0 4.2 4.2h2.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="0.1 3.4"
        />
        <path
          d="M17.6 9.4a4 4 0 0 0-4 4c0 2.8 4 7 4 7s4-4.2 4-7a4 4 0 0 0-4-4zm0 5.4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          fill="currentColor"
        />
      </svg>
      {/* 고정 영문 라벨 — 한글판·영문판 동일. */}
      <span className="text-center text-[9px] font-extrabold leading-[1.2] tracking-wider md:text-[11px]">
        MY
        <br />
        ROUTE
      </span>
    </Link>
  );
}
