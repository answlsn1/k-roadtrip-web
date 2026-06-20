"use client";

import { useEffect, useState } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics/events";
import type { SponsoredPlace } from "@/lib/config/sponsored";

export default function SponsoredCard({ place }: { place: SponsoredPlace }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useVideoAutoplay(0.35);

  // Rehydrate builder store so any pre-existing stops are loaded before we write.
  useEffect(() => { useBuilderStore.persist.rehydrate(); }, []);
  const lang = useLangStore((s) => s.lang);

  const addStop = useBuilderStore((s) => s.addStop);
  const stops = useBuilderStore((s) => s.draft.stops);
  const added = stops.some(
    (s) => s.source === place.source && s.sourceId === place.sourceId,
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addStop(place);
  };

  const handleBook = () => {
    // Record the affiliate-click conversion (the money step) — the outbound
    // <a> navigation and partner link are untouched, we only add tracking.
    trackEvent("affiliate_click", {
      affiliatePartner: place.sourceId,
      region: place.region_en,
      routeId: place.sourceId,
    });
  };

  const ctaLabel =
    (lang === "ko" ? place.cta_label_ko : place.cta_label_en) ?? t("card.book", lang);

  return (
    <div className="snap-start shrink-0 w-[300px] sm:w-[340px]">
      <div className="relative h-[400px] overflow-hidden rounded-3xl border-2 border-amber-400 bg-slate-900 shadow-lg shadow-amber-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-300/40">
        {/* Blur skeleton */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${playing ? "pointer-events-none opacity-0" : "opacity-100"}`}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.thumbnail_url}
            alt=""
            className={`h-full w-full object-cover ${place.video_url ? "scale-105 blur-sm" : ""}`}
          />
          <div className="absolute inset-0 bg-slate-900/40" />
        </div>

        {/* Video — only when a real (self-hosted) clip exists; otherwise the poster shows. */}
        {place.video_url && (
          <video
            ref={videoRef}
            src={place.video_url}
            poster={place.thumbnail_url}
            playsInline
            muted
            loop
            preload="none"
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setPlaying(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/25 to-transparent" />

        {/* ⭐ Sponsored badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold tracking-wider text-slate-900">
            ⭐ Sponsored
          </span>
        </div>

        {/* Live indicator */}
        {playing && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              Live
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            {place.region_en}
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight text-white">
            {place.name_en}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{place.subtitle}</p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
            {place.description_en}
          </p>

          {place.benefits.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {place.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          )}

          {place.affiliate_url ? (
            <>
              {/* Primary money action: outbound partner booking (the revenue funnel) */}
              <a
                href={place.affiliate_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={handleBook}
                className="mt-3 block w-full rounded-full bg-amber-400 py-2.5 text-center text-sm font-extrabold text-slate-900 transition-all duration-200 hover:bg-amber-300 active:scale-95"
              >
                {ctaLabel}
              </a>
              {/* Secondary: keep the place in the user's trip */}
              <button
                onClick={handleAdd}
                disabled={added}
                className={`mt-2 w-full rounded-full py-2 text-xs font-bold transition-colors duration-200 ${
                  added ? "text-emerald-300" : "text-white/70 hover:text-white"
                }`}
              >
                {added ? t("card.added", lang) : t("card.add", lang)}
              </button>
            </>
          ) : (
            // No affiliate link yet → no dead link; fall back to "Add to Trip".
            <button
              onClick={handleAdd}
              disabled={added}
              className={`mt-3 w-full rounded-full py-2.5 text-sm font-extrabold transition-all duration-200 ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-95"
              }`}
            >
              {added ? t("card.added", lang) : t("card.add", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
