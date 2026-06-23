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
    <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 pt-24 text-center">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
        {t("hero.badge", lang)}
      </p>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
        {t("hero.titlePre", lang)}
        <br />
        {t("hero.titleLine2", lang)}
        <span className="text-amber-300">{t("hero.titleAccent", lang)}</span>
        {t("hero.titlePost", lang)}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
        {t("hero.sub", lang)}
      </p>

      <CourseSearch courses={courses} />

      <p className="mt-6 text-xs text-white/60">{t("hero.note", lang)}</p>
    </div>
  );
}
