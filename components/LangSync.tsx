"use client";

import { useEffect } from "react";
import { useLangStore } from "@/store/useLangStore";
import type { Lang } from "@/lib/i18n";

/**
 * Global language hydration. LangToggle only mounts inside the home navbar, so
 * pages without it (route detail, builder) would otherwise ignore the saved
 * preference. Mounted once in the root layout, this restores `krt-lang` from
 * localStorage on every page and keeps <html lang> in sync.
 */
export default function LangSync() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  useEffect(() => {
    const saved = localStorage.getItem("krt-lang") as Lang | null;
    if (saved === "en" || saved === "ko") setLang(saved);
  }, [setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
