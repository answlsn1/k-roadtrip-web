"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
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
 */
export default function CategoryRow({
  titleKey,
  badgeKey,
  badgeClass = "bg-slate-100 text-slate-500",
  children,
}: CategoryRowProps) {
  const lang = useLangStore((s) => s.lang);

  // Mouse drag-to-scroll (PC) — refs only, no re-render
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.getBoundingClientRect().left;
    scrollLeft.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.getBoundingClientRect().left;
    const walk = x - startX.current;
    if (Math.abs(walk) > 4) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Prevent card click after a real drag (threshold already exceeded above)
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDragged.current) {
      e.stopPropagation();
      hasDragged.current = false;
    }
  };

  return (
    <div className="mb-10">
      {/* Row heading */}
      <div className="mb-4 flex items-center gap-3 px-5 sm:px-0">
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

      {/* Horizontal scroll strip — touch: native scroll, mouse: drag handlers */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pl-5 pr-5 sm:pl-0 sm:pr-0 snap-x snap-mandatory scroll-smooth scroll-pl-5 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
