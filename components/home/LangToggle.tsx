"use client";

import { useEffect } from "react";
import { useLangStore } from "@/store/useLangStore";
import type { Lang } from "@/lib/i18n";

// Single hydration point for lang preference.
// Reads localStorage on mount → pushes to the shared store.
// All other components just subscribe to useLangStore.
export default function LangToggle() {
  const lang    = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  useEffect(() => {
    const saved = localStorage.getItem("krt-lang") as Lang | null;
    if (saved === "en" || saved === "ko") setLang(saved);
  }, [setLang]);

  // Keep <html lang> in sync so screen readers, translation engines and SEO
  // signals match the language the user is actually reading.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const pick = (l: Lang) => {
    localStorage.setItem("krt-lang", l);
    setLang(l);
  };

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold">
      <button
        onClick={() => pick("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "en" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => pick("ko")}
        aria-pressed={lang === "ko"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "ko" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        KOR
      </button>
    </div>
  );
}
