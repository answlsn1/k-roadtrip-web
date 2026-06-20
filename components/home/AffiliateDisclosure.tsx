"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/** Affiliate/sponsor disclosure line — reacts to the lang toggle. */
export default function AffiliateDisclosure({
  className = "",
}: {
  className?: string;
}) {
  const lang = useLangStore((s) => s.lang);
  return <p className={className}>{t("disclosure.affiliate", lang)}</p>;
}
