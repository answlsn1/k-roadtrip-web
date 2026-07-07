"use client";

import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";

// Single source of truth for the operator contact address — change it here
// only; both the display text and the mailto: link read from this constant.
const CONTACT_EMAIL = "kroadtripapp@gmail.com";

interface SiteFooterProps {
  /**
   * "light" (default) — original quiet footer, used on /bike pages.
   * "ink" — dark full-bleed close-out for the home page (design v2);
   * opt-in so shared consumers keep their current look.
   */
  tone?: "light" | "ink";
}

export default function SiteFooter({ tone = "light" }: SiteFooterProps) {
  const lang = useLangStore((s) => s.lang);
  const ink = tone === "ink";

  // tf() fills in {email}; we then split on the email itself so only that
  // portion renders inside the mailto: link (rest of the sentence stays plain text).
  const contactText = tf("footer.contact", lang, { email: CONTACT_EMAIL });
  const [contactPrefix, contactSuffix] = contactText.split(CONTACT_EMAIL);

  return (
    <footer className={ink ? "bg-ink" : undefined}>
      <div className={`mx-auto max-w-6xl px-5 text-xs text-slate-400 ${ink ? "py-12" : "py-10"}`}>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>{t("footer.tagline", lang)}</p>
          <p>{t("footer.attribution", lang)}</p>
        </div>
        <p className="mt-3 text-center sm:text-left">
          {contactPrefix}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-2 hover:underline">
            {CONTACT_EMAIL}
          </a>
          {contactSuffix}
        </p>
        <p
          className={`mt-4 text-center text-[11px] leading-relaxed sm:text-left ${
            ink ? "text-slate-500" : "text-slate-400/80"
          }`}
        >
          {t("disclosure.affiliate", lang)}
        </p>
      </div>
    </footer>
  );
}
