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
      className={`group relative block overflow-hidden rounded-3xl bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${sizeClass}`}
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
          <div className="h-full w-full animate-pulse bg-slate-800" />
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

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent" />

      {/* Badge */}
      <div className="absolute left-5 top-5">
        <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 backdrop-blur-sm">
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

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow-md">{title}</h3>
        {sub && <p className="mt-1 text-sm text-white/70">{sub}</p>}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                {chip}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 text-sm font-bold text-amber-300 transition-transform group-hover:translate-x-1">
          {t("card.viewmap", lang)}
        </p>
      </div>
    </Link>
  );
}
