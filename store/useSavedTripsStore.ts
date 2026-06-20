"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RouteDraft, SavedTrip } from "@/lib/types";

interface SavedTripsState {
  trips: SavedTrip[];
  /** Snapshot the current builder draft into My Trip (upsert by draft id). */
  saveTrip: (draft: RouteDraft) => void;
  removeTrip: (id: string) => void;
  clearAll: () => void;
}

export const useSavedTripsStore = create<SavedTripsState>()(
  persist(
    (set, get) => ({
      trips: [],

      saveTrip: (draft) => {
        const snapshot: SavedTrip = {
          id: draft.id,
          title: draft.title?.trim() || "My Custom Route",
          stops: draft.stops,
          savedAt: Date.now(),
        };
        // Upsert by id (re-saving an opened trip updates it), newest first.
        const others = get().trips.filter((t) => t.id !== snapshot.id);
        set({ trips: [snapshot, ...others] });
      },

      removeTrip: (id) =>
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),

      clearAll: () => set({ trips: [] }),
    }),
    {
      name: "krt-saved-trips",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ trips: s.trips }),
      skipHydration: true,
    }
  )
);
