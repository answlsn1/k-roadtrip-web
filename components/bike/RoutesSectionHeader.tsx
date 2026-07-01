"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function RoutesSectionHeader() {
  const lang = useLangStore((s) => s.lang);

  return (
    <div className="mx-auto mb-12 max-w-2xl px-5 text-center sm:px-0">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
        {t("bike.routes.label", lang)}
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {t("bike.routes.heading", lang)}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {t("bike.routes.sub", lang)}
      </p>
    </div>
  );
}
