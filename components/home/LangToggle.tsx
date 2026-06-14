"use client";

import { useEffect, useState } from "react";

export default function LangToggle() {
  const [lang, setLang] = useState<"en" | "ko">("en");

  useEffect(() => {
    if (localStorage.getItem("krt-lang") === "ko") setLang("ko");
  }, []);

  const pick = (l: "en" | "ko") => {
    setLang(l);
    localStorage.setItem("krt-lang", l);
  };

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold">
      <button
        onClick={() => pick("en")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "en" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => pick("ko")}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "ko" ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
        }`}
      >
        KOR
      </button>
    </div>
  );
}
