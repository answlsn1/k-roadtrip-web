"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/** Bike-mode hero copy. Shares HeroSlideshow's background (rendered by the page). */
export default function BikeHero() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-12 pt-28 text-center sm:pb-16 sm:pt-24">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
        {t("bike.hero.badge", lang)}
      </p>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
        {t("bike.hero.titlePre", lang)}
        <span className="text-amber-300">{t("bike.hero.titleAccent", lang)}</span>
        {t("bike.hero.titlePost", lang)}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
        {t("bike.hero.sub", lang)}
      </p>

      <a
        href="#routes"
        className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-ink shadow-lg transition-transform active:scale-[0.98]"
      >
        {t("bike.hero.cta", lang)}
      </a>

      <p className="mt-6 text-xs text-white/60">{t("bike.hero.note", lang)}</p>
    </div>
  );
}
