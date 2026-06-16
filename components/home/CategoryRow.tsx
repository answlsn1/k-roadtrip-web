"use client";

import type { ReactNode } from "react";
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

      {/* Horizontal scroll strip — snap-x so cards land cleanly on swipe */}
      <div className="flex gap-4 overflow-x-auto pb-3 pl-5 pr-5 sm:pl-0 sm:pr-0 snap-x snap-mandatory scroll-smooth scroll-pl-5 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
