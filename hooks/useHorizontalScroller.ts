"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State/behavior behind HorizontalScroller (CategoryRoutesModal's route
 * strip). Written as a standalone hook so the render shell can stay a thin
 * presentational component.
 *
 * ⚠️ CategoryRow (homepage feed rows, still live on /bike) keeps its own
 * copy of equivalent logic inline — it does NOT use this hook. That's
 * deliberate (see HorizontalScroller.tsx's docstring for why), not a partial
 * migration; don't assume fixing something here also fixes CategoryRow.
 *
 * Handles: page/edge tracking (via scroll + ResizeObserver), prev/next
 * button scrollBy, dot-pagination scrollTo, and prefers-reduced-motion
 * (JS scroll ignores the CSS `motion-reduce:scroll-auto` utility, so the
 * behavior has to be picked here too).
 */
export function useHorizontalScroller<T extends HTMLElement = HTMLDivElement>() {
  const scrollRef = useRef<T>(null);
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

  return { scrollRef, currentPage, totalPages, canPrev, canNext, scroll, scrollToPage };
}
