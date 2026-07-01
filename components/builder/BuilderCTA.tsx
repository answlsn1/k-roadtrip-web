"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { buildNaverWebRouteUrl, type NaverRoutePoint } from "@/lib/domain/naverMapLink";
import { totalKm, driveMin } from "@/lib/domain/geo";
import { splitForNaver } from "@/lib/domain/routeSplitter";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics/events";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";

export default function BuilderCTA() {
  const stops = useBuilderStore((s) => s.draft.stops);
  const saveTrip = useSavedTripsStore((s) => s.saveTrip);
  const [copied, setCopied] = useState(false);
  const [savedTrip, setSavedTrip] = useState(false);
  const lang = useLangStore((s) => s.lang);

  const handleSaveTrip = () => {
    // Read the live draft at click time (not a possibly-stale render closure).
    saveTrip(useBuilderStore.getState().draft, t("builder.untitled", lang));
    setSavedTrip(true);
    setTimeout(() => setSavedTrip(false), 2000);
  };

  const enough = stops.length >= 2;
  const km = totalKm(stops);
  const mins = driveMin(km);

  const chunks = enough ? splitForNaver(stops) : null;
  const singleUrl =
    !chunks && enough
      ? buildNaverWebRouteUrl(
          stops.map(
            (s, i): NaverRoutePoint => ({
              latitude: s.latitude,
              longitude: s.longitude,
              place_name_ko: s.name_ko,
              sequence: i,
            })
          )
        )
      : undefined;

  const dur =
    mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

  const copyKorean = () => {
    const text = stops.map((s, i) => `${i + 1}. ${s.name_ko}`).join("\n");
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        /* clipboard blocked — silently ignore */
      }
    );
  };

  return (
    <div className="space-y-2 border-t border-slate-100 bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
      {stops.length >= 1 && (
        <button
          onClick={handleSaveTrip}
          className={`w-full rounded-2xl border-2 py-2.5 text-sm font-extrabold transition-all duration-200 active:scale-[0.99] ${
            savedTrip
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {savedTrip ? t("builder.savedTrip", lang) : t("builder.saveTrip", lang)}
        </button>
      )}

      {enough && (
        <p className="text-center text-xs font-semibold text-slate-400">
          {tf("builder.summary", lang, { n: stops.length, km: km.toFixed(1), dur })}
        </p>
      )}

      {chunks ? (
        <div className="space-y-1.5">
          {chunks.map((chunk, idx) => (
            <a
              key={idx}
              href={chunk.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("naver_handoff")}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#03C75A] py-3.5 text-sm font-extrabold text-white shadow-md shadow-green-500/25 transition-transform active:scale-[0.99]"
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black"
                style={{ color: "#03C75A" }}
              >
                N
              </span>
              {tf("builder.routePart", lang, { n: idx + 1 })}
              <span className="font-semibold opacity-70">
                ({chunk.fromIdx}~{chunk.toIdx})
              </span>
            </a>
          ))}
        </div>
      ) : (
        <a
          href={singleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!enough}
          onClick={(e) => {
            if (!enough) {
              e.preventDefault();
              return;
            }
            trackEvent("naver_handoff");
          }}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-extrabold text-white transition-transform active:scale-[0.99] ${
            enough
              ? "bg-[#03C75A] shadow-lg shadow-green-500/30"
              : "cursor-not-allowed bg-slate-300"
          }`}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black"
            style={{ color: enough ? "#03C75A" : "#cbd5e1" }}
          >
            N
          </span>
          {enough ? t("builder.openRoute", lang) : t("builder.needTwo", lang)}
        </a>
      )}

      {enough && (
        <button
          onClick={copyKorean}
          className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          {copied ? t("common.copied", lang) : t("builder.copyKorean", lang)}
        </button>
      )}
    </div>
  );
}
