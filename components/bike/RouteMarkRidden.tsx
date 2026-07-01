"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";
import { useBikePassportStore } from "@/store/useBikePassportStore";

/** Route-detail-page toggle into the same passport store PassportTracker reads. */
export default function RouteMarkRidden({ slug }: { slug: string }) {
  const lang = useLangStore((s) => s.lang);
  const [mounted, setMounted] = useState(false);
  const completed = useBikePassportStore((s) => s.completed);
  const toggleCompleted = useBikePassportStore((s) => s.toggleCompleted);

  useEffect(() => {
    useBikePassportStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const isDone = mounted && completed.includes(slug);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => toggleCompleted(slug)}
        aria-pressed={isDone}
        className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition-colors ${
          isDone
            ? "bg-emerald-500 text-white"
            : "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        {isDone ? t("bike.passport.doneBadge", lang) : t("bike.passport.markDone", lang)}
      </button>
      <Link
        href="/bike#passport"
        className="text-xs font-semibold text-slate-400 hover:text-slate-700"
      >
        {t("bike.passport.title", lang)} →
      </Link>
    </div>
  );
}
