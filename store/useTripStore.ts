"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TripState {
  /** routeId → highest sequence navigated to (never regresses). */
  progress: Record<number, number>;
  advance: (routeId: number, seq: number) => void;
  reset: (routeId: number) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      progress: {},

      advance: (routeId, seq) => {
        const cur = get().progress[routeId] ?? 0;
        if (seq > cur)
          set((s) => ({ progress: { ...s.progress, [routeId]: seq } }));
      },

      reset: (routeId) =>
        set((s) => {
          const next = { ...s.progress };
          delete next[routeId];
          return { progress: next };
        }),
    }),
    {
      name: "krt-trip-progress",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
