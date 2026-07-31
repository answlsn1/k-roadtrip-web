"use client";

import type { ReactNode } from "react";
import { useHorizontalScroller } from "@/hooks/useHorizontalScroller";

interface HorizontalScrollerProps {
  children: ReactNode;
  /** Applied to the outer wrapper — e.g. `-mx-6` to bleed the strip to a
   *  padded dialog's edges while the track's own padding keeps cards
   *  visually aligned (the "peek" effect). */
  className?: string;
  /** Applied to the scrollable track — control gap/padding per call site. */
  trackClassName?: string;
  /** Edge-fade color — must match the surface behind it (white card vs page bg). */
  fadeFrom?: string;
  /** Prev/Next button aria-labels (i18n'd by caller). */
  prevLabel: string;
  nextLabel: string;
  /** Dot-pagination group aria-label (i18n'd by caller). */
  pageNavLabel: string;
  /** Per-dot aria-label, e.g. (n) => `Page ${n}` — i18n'd by caller. A bare
   *  number reads as near-context-free to screen reader users. */
  pageLabel: (page: number) => string;
}

/**
 * Netflix-style horizontal scroll strip: snap-x touch scroll on all sizes,
 * prev/next buttons on sm+, edge fades that track scroll position, and dot
 * pagination when content spans more than one "page". Used by
 * CategoryRoutesModal (category popup route list).
 *
 * ⚠️ CategoryRow (homepage feed rows, still live on /bike) intentionally does
 * NOT use this — it keeps its own copy of the same logic with a different
 * button layout (pinned beside its heading, 40%-opacity disabled state
 * instead of this component's overlay-on-strip + fully-hidden-when-disabled
 * style). Migrating CategoryRow here was out of scope for the popup redesign
 * this component was built for; do it as a deliberate follow-up if the two
 * should ever look identical, not by assuming this component already covers it.
 */
export default function HorizontalScroller({
  children,
  className = "",
  trackClassName = "",
  fadeFrom = "from-white",
  prevLabel,
  nextLabel,
  pageNavLabel,
  pageLabel,
}: HorizontalScrollerProps) {
  const { scrollRef, currentPage, totalPages, canPrev, canNext, isOverflowing, scroll, scrollToPage } =
    useHorizontalScroller<HTMLDivElement>();

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={scrollRef}
          // justify-center ONLY when the content fits — a short list (2 cards)
          // otherwise sits left-aligned with dead space beside it. Never apply
          // it while overflowing: centering an overflowing flex scroll
          // container pushes the first item into negative scroll space that
          // can't be scrolled back to.
          className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isOverflowing ? "" : "justify-center"
          } ${trackClassName}`}
        >
          {children}
        </div>

        {/* Edge fades — hint that the strip continues; vanish at either end.
            pointer-events-none keeps cards fully clickable underneath. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r ${fadeFrom} to-transparent transition-opacity duration-300 ${
            canPrev ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l ${fadeFrom} to-transparent transition-opacity duration-300 ${
            canNext ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Nav buttons — visible on sm+ only; touch swipe handles mobile.
            Overlaid on the strip (not a separate header row) so this component
            works whether or not the caller has its own heading. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canPrev}
            aria-label={prevLabel}
            // Dual outline+ring (not just the global dark outline, and not a
            // plain white ring either) — this button is a white pill that can
            // sit over any category photo, light or dark, behind it. A single
            // color ring would vanish against either a white button+white
            // photo or blend into a dark backdrop; the dark-outline-under-
            // white-ring combo (same pattern as BuildRouteFab's own FAB,
            // which has the identical "solid button over a variable photo"
            // problem) stays visible either way.
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-md backdrop-blur transition-colors hover:border-slate-300 hover:bg-white disabled:pointer-events-none disabled:opacity-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canNext}
            aria-label={nextLabel}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-md backdrop-blur transition-colors hover:border-slate-300 hover:bg-white disabled:pointer-events-none disabled:opacity-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dot pagination — hidden when only one page. White-on-translucent
          rather than the slate tones a light surface would use: this strip
          only ever sits on the modal's dark blurred-photo backdrop, where
          dark-gray dots would all but disappear. */}
      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label={pageNavLabel}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentPage}
              aria-label={pageLabel(i + 1)}
              onClick={() => scrollToPage(i)}
              // focus-visible:ring-offset-2 gives the ring room to show
              // fully around a dot this small — without it, a 2px ring on a
              // 8px circle nearly merges with the dot itself.
              className={
                i === currentPage
                  ? "h-2 w-5 rounded-full bg-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  : "h-2 w-2 rounded-full bg-white/35 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
