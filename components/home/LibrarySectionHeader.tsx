"use client";

import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";

interface LibrarySectionHeaderProps {
  /** Real-time count of routes that have a content category (Phase 1+) — never hardcoded. */
  count: number;
}

export default function LibrarySectionHeader({ count }: LibrarySectionHeaderProps) {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="mb-8 mt-16">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
        {t("library.kicker", lang)}
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {tf("library.heading", lang, { count })}
      </h2>
    </div>
  );
}
