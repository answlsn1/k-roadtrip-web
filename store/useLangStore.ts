import { create } from "zustand";
import type { Lang } from "@/lib/i18n";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

// Plain in-memory store — no persist middleware.
// LangToggle is the single hydration point: it reads localStorage on mount
// and pushes the value here so every subscriber re-renders.
export const useLangStore = create<LangState>()((set) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
}));
