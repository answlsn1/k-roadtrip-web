"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function CoursesSectionHeader() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="mb-12 px-5 text-center sm:mx-auto sm:max-w-6xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
        {t("home.label", lang)}
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {t("home.heading", lang)}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-500">
        {t("home.sub", lang)}
      </p>
    </div>
  );
}
