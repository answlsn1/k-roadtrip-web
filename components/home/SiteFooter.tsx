"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function SiteFooter() {
  const lang = useLangStore((s) => s.lang);

  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-10 text-xs text-slate-400 sm:flex-row">
      <p>{t("footer.tagline", lang)}</p>
      <p>{t("footer.attribution", lang)}</p>
    </footer>
  );
}
