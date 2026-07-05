"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MapWaypoint } from "@/lib/types";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics/events";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

interface MapSectionProps {
  waypoints: MapWaypoint[];
}

export default function MapSection({ waypoints }: MapSectionProps) {
  const regions = Array.from(new Set(waypoints.map((w) => w.region_name_en))).sort();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);

  return (
    <section id="map" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20 sm:pb-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t("map.label", lang)}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("map.heading", lang)}
          </h2>
        </div>

        {/* Region filter pills */}
        <div className="flex flex-wrap gap-2">
          {/* Selection chips use the emerald accent — solid ink is reserved for
              the single page-level primary CTA (BuildRouteFab). */}
          <button
            onClick={() => setActiveRegion(null)}
            aria-pressed={activeRegion === null}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              activeRegion === null
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("map.all", lang)}
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => {
                const next = activeRegion === r ? null : r;
                setActiveRegion(next);
                if (next) trackEvent("region_view", { region: r });
              }}
              aria-pressed={activeRegion === r}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                activeRegion === r
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* isolate: Leaflet 내부 z-index(pane 200~700, control 1000)가 루트 스태킹
          컨텍스트로 탈출해 고정 FAB(z-30)·Navbar(z-50)를 뚫는 것을 차단. */}
      <div className="isolate overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
        <div className="h-[420px] sm:h-[480px] w-full">
          <LeafletMap waypoints={waypoints} activeRegion={activeRegion} />
        </div>
      </div>

      <p className="mt-3 text-right text-xs font-semibold text-slate-400">
        {t("map.hint", lang)}
      </p>
    </section>
  );
}
