"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/**
 * Car/Bike 모드 세그먼트 토글 — ENG/KOR LangToggle과 동일한 시각 언어.
 * 현재 모드는 링크가 아니라 순수 표시(클릭해도 이동 없음), 다른 모드만 링크.
 */
export default function ModeToggle({ mode }: { mode: "car" | "bike" }) {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-slate-200 text-xs font-bold">
      <Link
        href="/"
        aria-current={mode === "car" ? "page" : undefined}
        className={`whitespace-nowrap px-3 py-1.5 transition-colors ${
          mode === "car" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        {t("mode.car", lang)}
      </Link>
      <Link
        href="/bike"
        aria-current={mode === "bike" ? "page" : undefined}
        className={`whitespace-nowrap px-3 py-1.5 transition-colors ${
          mode === "bike" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        {t("mode.bike", lang)}
      </Link>
    </div>
  );
}
