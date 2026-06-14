"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MapWaypoint } from "@/lib/types";

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

  return (
    <section id="map" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20 sm:pb-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
            Live Map
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Every stop, local-verified
          </h2>
        </div>

        {/* Region filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveRegion(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              activeRegion === null
                ? "bg-ink text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(activeRegion === r ? null : r)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                activeRegion === r
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
        <div className="h-[420px] sm:h-[480px] w-full">
          <LeafletMap waypoints={waypoints} activeRegion={activeRegion} />
        </div>
      </div>

      <p className="mt-3 text-right text-xs font-semibold text-slate-400">
        Tap a marker for details & Naver Map navigation
      </p>
    </section>
  );
}
