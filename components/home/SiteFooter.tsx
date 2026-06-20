"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function SiteFooter() {
  const lang = useLangStore((s) => s.lang);

  return (
    <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-slate-400">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p>{t("footer.tagline", lang)}</p>
        <p>{t("footer.attribution", lang)}</p>
      </div>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400/80 sm:text-left">
        {t("disclosure.affiliate", lang)}
      </p>
    </footer>
  );
}
