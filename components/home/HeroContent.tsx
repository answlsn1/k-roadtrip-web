"use client";

import CourseSearch, { type SearchableCourse } from "@/components/home/CourseSearch";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

interface HeroContentProps {
  courses: SearchableCourse[];
}

/** Hero copy + search box. Client component so all text reacts to the lang toggle. */
export default function HeroContent({ courses }: HeroContentProps) {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-12 pt-28 text-center sm:pb-16 sm:pt-24">
      {/* Floating dark translucent chip — same grammar as the course cards. */}
      <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 ring-1 ring-white/20 backdrop-blur-md">
        {t("hero.badge", lang)}
      </p>
      {/* Headline block — extra side padding below md keeps the centered text
          clear of the fixed FAB zone (right-3 + ~54px vertical pill ≈ 68px).
          The badge, search and note sit outside the FAB's vertical band, so
          they keep the full width. */}
      <div className="px-12 md:px-0">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t("hero.titlePre", lang)}
          <span className="text-amber-300">{t("hero.titleAccent", lang)}</span>
          {t("hero.titlePost", lang)}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          {t("hero.sub", lang)}
        </p>
      </div>

      <CourseSearch courses={courses} />

      <p className="mt-6 text-xs text-white/60">{t("hero.note", lang)}</p>
    </div>
  );
}
