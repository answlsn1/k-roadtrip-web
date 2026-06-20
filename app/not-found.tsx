"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const lang = useLangStore((s) => s.lang);
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white px-5">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-3xl">🗺️</p>
        <h1 className="mt-3 text-lg font-extrabold text-slate-900">
          {t("notFound.title", lang)}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {t("notFound.body", lang)}
        </p>
        <Link
          href="/"
          className="mt-5 block w-full rounded-2xl bg-ink py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
        >
          {t("notFound.back", lang)}
        </Link>
      </div>
    </main>
  );
}
