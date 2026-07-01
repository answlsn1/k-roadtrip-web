"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import type { BikeRoute } from "@/lib/config/bikeRoutes";
import RouteMarkRidden from "./RouteMarkRidden";

const DIFFICULTY_KEY = {
  easy: "bike.difficulty.easy",
  moderate: "bike.difficulty.moderate",
  challenging: "bike.difficulty.challenging",
} as const;

export default function BikeRouteDetail({ route }: { route: BikeRoute }) {
  const lang = useLangStore((s) => s.lang);
  const name = lang === "ko" ? route.name_ko : route.name_en;
  const region = lang === "ko" ? route.region_ko : route.region_en;
  const summary = lang === "ko" ? route.summary_ko : route.summary_en;
  const highlights = lang === "ko" ? route.highlights_ko : route.highlights_en;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28">
      <Link
        href="/bike#routes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-700"
      >
        ← {t("bike.route.back", lang)}
      </Link>

      <div
        className={`flex h-40 items-center justify-center rounded-3xl bg-gradient-to-br text-7xl ${route.gradient}`}
        aria-hidden="true"
      >
        {route.icon}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {region}
        </span>
        <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {t(DIFFICULTY_KEY[route.difficulty], lang)}
        </span>
        {route.fourRivers && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            {t("bike.route.fourRiversBadge", lang)}
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {name}
      </h1>
      <p className="mt-1 text-lg font-bold text-emerald-600">
        {tf("bike.card.km", lang, { km: route.distanceKm })}
      </p>

      <p className="mt-5 text-base leading-relaxed text-slate-600">{summary}</p>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-400">
          {t("bike.route.highlights", lang)}
        </h2>
        <ul className="space-y-2">
          {highlights.map((h) => (
            <li key={h} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="text-emerald-500">●</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-400">
          {t("bike.route.certCenters", lang)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {route.certCenters.map((c) => (
            <span
              key={c.name_en}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              🚩 {lang === "ko" ? c.name_ko : c.name_en}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-slate-100 pt-8">
        <RouteMarkRidden slug={route.slug} />
      </div>
    </div>
  );
}
