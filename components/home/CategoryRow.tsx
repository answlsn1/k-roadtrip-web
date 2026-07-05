"use client";

import type { ReactNode } from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLangStore } from "@/store/useLangStore";
import { t, type DictKey } from "@/lib/i18n";

interface CategoryRowProps {
  /** i18n key for the row heading (e.g. "feed.trending") */
  titleKey: DictKey;
  /** i18n key for the small pill shown next to the title (e.g. "feed.partner") */
  badgeKey?: DictKey;
  badgeClass?: string;
  children: ReactNode;
}

/**
 * Client component so the heading + badge react to the lang toggle.
 * Server-rendered cards are passed through `children` (unaffected).
 *
 * Navigation: left/right buttons (sm+) + pagination dots.
 * Touch swipe works natively via snap-x scroll.
 */
export default function CategoryRow({
  titleKey,
  badgeKey,
  badgeClass = "bg-slate-100 text-slate-500",
  children,
}: CategoryRowProps) {
  const lang = useLangStore((s) => s.lang);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    const cur = Math.round(el.scrollLeft / el.clientWidth);
    setTotalPages(total);
    setCurrentPage(Math.min(cur, total - 1));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateState();

    el.addEventListener("scroll", updateState, { passive: true });

    const ro = new ResizeObserver(updateState);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateState);
      ro.disconnect();
    };
  }, [updateState]);

  // JS 스크롤은 CSS(motion-reduce:scroll-auto)를 무시하므로 여기서도 감속 설정을 존중.
  const scrollBehavior = (): ScrollBehavior =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -el.clientWidth : el.clientWidth,
      behavior: scrollBehavior(),
    });
  }, []);

  const scrollToPage = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: scrollBehavior() });
  }, []);

  return (
    <div className="mb-10">
      {/* Heading row — nav buttons pinned to the right */}
      <div className="mb-4 flex items-center justify-between px-5 sm:px-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
            {t(titleKey, lang)}
          </h2>
          {badgeKey && (
            <span
              className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeClass}`}
            >
              {t(badgeKey, lang)}
            </span>
          )}
        </div>

        {/* Nav buttons — visible on sm+ only; touch swipe handles mobile */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            disabled={!canPrev}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canNext}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal scroll strip — touch: native snap scroll, buttons: scrollBy */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 pl-5 pr-5 sm:pl-0 sm:pr-0 snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto scroll-pl-5 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>

        {/* Edge fades — hint that the strip continues; driven by the existing
            canPrev/canNext state so they vanish at either end. pointer-events-none
            keeps the cards fully clickable underneath. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent transition-opacity duration-300 ${
            canPrev ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 ${
            canNext ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Dot pagination — hidden when only one page */}
      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Scroll pages">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentPage}
              aria-label={`Page ${i + 1}`}
              onClick={() => scrollToPage(i)}
              className={
                i === currentPage
                  ? "h-2 w-5 rounded-full bg-slate-600 transition-all duration-200"
                  : "h-2 w-2 rounded-full bg-slate-300 transition-all duration-200"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
