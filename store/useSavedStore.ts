"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SavedWaypoint {
  id: number;
  place_name_en: string;
  place_name_ko: string;
  route_slug: string;
  region_name_en: string;
  type_tag: string;
}

interface SavedState {
  items: SavedWaypoint[];
  /** Adds if not present, removes if already saved. Returns true = now saved. */
  toggle: (wp: SavedWaypoint) => boolean;
  remove: (id: number) => void;
  clearAll: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (wp) => {
        const { items } = get();
        const exists = items.some((s) => s.id === wp.id);
        set({
          items: exists
            ? items.filter((s) => s.id !== wp.id)
            : [...items, wp],
        });
        return !exists;
      },

      remove: (id) =>
        set((s) => ({ items: s.items.filter((w) => w.id !== id) })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: "krt-saved-waypoints",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      skipHydration: true,
    }
  )
);
