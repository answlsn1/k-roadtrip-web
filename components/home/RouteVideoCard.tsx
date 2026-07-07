"use client";

import Link from "next/link";
import { useState } from "react";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import { badgeLabel, type CardMeta } from "@/lib/config/cardMeta";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

interface RouteVideoCardProps {
  slug: string;
  title_en: string;
  title_ko?: string;
  thumbnail_url: string | null;
  video_url: string;
  meta: CardMeta;
  sizeClass?: string;
}

export default function RouteVideoCard({
  slug,
  title_en,
  title_ko,
  thumbnail_url,
  video_url,
  meta,
  sizeClass = "h-[500px] w-full",
}: RouteVideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useVideoAutoplay(0.35);

  const lang = useLangStore((s) => s.lang);

  const title = lang === "ko" && title_ko ? title_ko : title_en;
  const sub   = lang === "ko" ? meta.sub_ko   : meta.sub_en;
  const chips = lang === "ko" ? meta.chips_ko : meta.chips_en;

  return (
    <Link
      href={`/routes/${slug}`}
      className={`group relative block overflow-hidden rounded-3xl bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${sizeClass}`}
    >
      {/* Blur skeleton */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${playing ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-hidden
      >
        {thumbnail_url ? (
          // Blur only while acting as a loading skeleton behind a video; with no
          // video the thumbnail IS the final poster, so render it crisp.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail_url}
            alt={title}
            className={`h-full w-full object-cover ${video_url ? "blur-sm scale-105" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <svg className="h-12 w-12 text-white/10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="5.5" cy="5" r="2" fill="currentColor" />
              <path d="M5.5 7.4v4.6a4 4 0 0 0 4 4h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.2" />
              <circle cx="18.5" cy="18" r="2" fill="currentColor" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      {/* Video — only when a real (self-hosted) clip exists; otherwise the poster shows. */}
      {video_url && (
        <video
          ref={videoRef}
          src={video_url}
          poster={thumbnail_url ?? undefined}
          playsInline muted loop preload="none"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* Gradient — image-forward: photo stays clear up top, bottom third
          goes deep so the white editorial title sits on solid dark. */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 via-35% to-transparent to-70%" />

      {/* Badge — floating dark translucent chip over the photo */}
      <div className="absolute left-5 top-5">
        <span className="rounded-full bg-slate-950/55 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md">
          {badgeLabel(meta.badge, lang)}
        </span>
      </div>

      {/* Live indicator */}
      {playing && (
        <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Live</span>
        </div>
      )}

      {/* Content — editorial contrast: big heavy title, small quiet meta */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">{title}</h3>
        {sub && <p className="mt-1.5 text-[13px] text-white/65">{sub}</p>}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                {chip}
              </span>
            ))}
          </div>
        )}
        {/* CTA row — amber label + circular arrow affordance (decorative; the
            whole card is the link, so the icon is aria-hidden). */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-amber-300">{t("card.viewmap", lang)}</p>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors duration-300 group-hover:bg-amber-300 group-hover:text-slate-900 motion-reduce:transition-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
