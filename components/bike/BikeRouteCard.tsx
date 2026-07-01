"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import type { BikeRoute } from "@/lib/config/bikeRoutes";

const DIFFICULTY_KEY = {
  easy: "bike.difficulty.easy",
  moderate: "bike.difficulty.moderate",
  challenging: "bike.difficulty.challenging",
} as const;

export default function BikeRouteCard({ route }: { route: BikeRoute }) {
  const lang = useLangStore((s) => s.lang);
  const name = lang === "ko" ? route.name_ko : route.name_en;
  const region = lang === "ko" ? route.region_ko : route.region_en;
  const highlights = lang === "ko" ? route.highlights_ko : route.highlights_en;

  return (
    <Link
      href={`/bike/routes/${route.slug}`}
      className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-lg sm:w-[300px]"
    >
      <div
        className={`flex h-28 items-center justify-between bg-gradient-to-br px-5 ${route.gradient}`}
      >
        <span className="text-4xl drop-shadow" aria-hidden="true">
          {route.icon}
        </span>
        <span className="rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur">
          {tf("bike.card.km", lang, { km: route.distanceKm })}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {region}
          </span>
          <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {t(DIFFICULTY_KEY[route.difficulty], lang)}
          </span>
        </div>
        <h3 className="text-base font-extrabold text-ink">{name}</h3>
        <ul className="space-y-1 text-xs leading-relaxed text-slate-500">
          {highlights.slice(0, 2).map((h) => (
            <li key={h} className="flex gap-1.5">
              <span className="text-emerald-500">·</span>
              <span className="line-clamp-1">{h}</span>
            </li>
          ))}
        </ul>
        <span className="mt-auto pt-2 text-xs font-bold text-emerald-600 transition-transform group-hover:translate-x-0.5">
          {t("bike.card.viewRoute", lang)}
        </span>
      </div>
    </Link>
  );
}
