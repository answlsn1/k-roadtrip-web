"use client";

import { useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";
import type { ModalRoute } from "./CategoryRoutesModal";

/**
 * Netflix-row poster card for CategoryRoutesModal's horizontal strip.
 * Fixed width + shrink-0 so it sits correctly inside an overflow-x-auto
 * flex track (percentage widths don't behave in scroll containers).
 * Visual language matches CategoryTileGrid's outer tiles (image-forward,
 * bottom gradient, bold white title) so the popup reads as a zoom-in on
 * the tile you just tapped, not a different UI.
 */
export default function RoutePosterCard({
  route,
  onNavigate,
}: {
  route: ModalRoute;
  onNavigate: () => void;
}) {
  const lang = useLangStore((s) => s.lang);
  const title = lang === "ko" && route.title_ko ? route.title_ko : route.title_en;
  const desc = lang === "ko" ? route.description_ko : route.description_en;
  // A stale/404 thumbnail_url would otherwise render as an empty box (broken
  // <img>, no visible fallback) instead of the placeholder gradient+icon
  // that a genuinely missing thumbnail already gets.
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = route.thumbnail_url && !imgFailed;

  return (
    <Link
      href={`/routes/${route.slug}`}
      onClick={onNavigate}
      // title= gives non-touch users a native hover tooltip with the full
      // headline — several production titles run 60-78 chars and clip hard
      // against a 128-152px poster (e.g. "Yangdong Village: Sleep…" drops
      // the exact clause — "…Inside a UNESCO Hanok Clan Village" — that
      // makes the route worth clicking). Cheap, lossless fallback.
      title={title}
      // ring-white, not ring-slate-950 — this card now sits on the modal's
      // dark blurred-photo backdrop (CategoryRoutesModal), where a dark ring
      // meant to define an edge against *white* would be nearly invisible.
      // Same reasoning applies to the focus-visible override: the global
      // dark outline (app/globals.css) would be near-invisible here too.
      className="group relative block aspect-[2/3] w-[128px] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-[152px]"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={route.thumbnail_url!}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
          <svg className="h-8 w-8 text-white/10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="5.5" cy="5" r="2" fill="currentColor" />
            <path d="M5.5 7.4v4.6a4 4 0 0 0 4 4h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.2" />
            <circle cx="18.5" cy="18" r="2" fill="currentColor" />
          </svg>
        </div>
      )}
      {/* Gradient covers a bit more of the card than the outer tile grid's
          version — line-clamp-3 below needs the room, and long real titles
          (up to 78 chars in production) need every line legible. */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 via-55% to-transparent to-80%" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="line-clamp-3 text-[13px] font-extrabold leading-tight text-white drop-shadow-sm">
          {title}
        </h3>
      </div>
      {/* Hover-only affordance (sm+ where hover exists) — keeps the poster
          uncluttered by default, same restraint as the outer tile grid.
          group-focus-visible mirrors group-hover so keyboard users get the
          same "leads onward" cue, not just a bare focus ring. */}
      <span
        aria-hidden
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:flex"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="sr-only">
        {t("card.viewmap", lang)}
        {/* Poster shows title only (visual scannability) — the description
            that the old vertical-list design read aloud alongside the title
            still exists per-route, so screen reader users shouldn't lose it
            just because sighted users get a photo instead. */}
        {desc ? `. ${desc}` : ""}
      </span>
    </Link>
  );
}
