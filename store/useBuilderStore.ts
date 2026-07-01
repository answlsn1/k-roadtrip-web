"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BuilderStop, PlaceResult, RouteDraft } from "@/lib/types";
import { placeToStop } from "@/lib/types";

const STORAGE_KEY = "krt-custom-route-draft";
const STORAGE_VERSION = 1;

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyDraft(): RouteDraft {
  return {
    id: newId(),
    title: "",
    stops: [],
    updatedAt: Date.now(),
  };
}

interface BuilderState {
  draft: RouteDraft;
  hydrated: boolean;

  addStop: (place: PlaceResult) => { ok: boolean; reason?: string };
  removeStop: (tempId: string) => void;
  reorderStops: (stops: BuilderStop[]) => void;
  renameDraft: (title: string) => void;
  resetDraft: () => void;
  loadDraft: (draft: RouteDraft) => void;
  setHydrated: (v: boolean) => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      draft: emptyDraft(),
      hydrated: false,

      addStop: (place) => {
        const { draft } = get();
        if (
          draft.stops.some(
            (s) => s.source === place.source && s.sourceId === place.sourceId
          )
        ) {
          return { ok: false, reason: "Already added." };
        }
        set({
          draft: {
            ...draft,
            stops: [...draft.stops, placeToStop(place)],
            updatedAt: Date.now(),
          },
        });
        return { ok: true };
      },

      removeStop: (tempId) => {
        const { draft } = get();
        set({
          draft: {
            ...draft,
            stops: draft.stops.filter((s) => s.tempId !== tempId),
            updatedAt: Date.now(),
          },
        });
      },

      reorderStops: (stops) => {
        const { draft } = get();
        set({ draft: { ...draft, stops, updatedAt: Date.now() } });
      },

      renameDraft: (title) => {
        const { draft } = get();
        set({ draft: { ...draft, title, updatedAt: Date.now() } });
      },

      resetDraft: () => set({ draft: emptyDraft() }),

      // Replace the working draft (e.g. when opening a saved trip from My Trip).
      loadDraft: (draft) => set({ draft: { ...draft, updatedAt: Date.now() } }),

      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft }),
      skipHydration: true,
      migrate: (persisted) => persisted as { draft: RouteDraft },
    }
  )
);
