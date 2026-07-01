"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ============================================================
 * 내 인증수첩(Bike Passport) — 델라이트 기능.
 *   실제 국토종주 자전거길 인증수첩(종이 스탬프북)을 본뜬 디지털
 *   체크리스트. 서버 없이 localStorage 만으로 동작(useSavedTripsStore 와
 *   동일 패턴) — 완주 여부만 기록, 개인정보/위치 데이터 없음.
 * ============================================================ */

interface BikePassportState {
  completed: string[]; // BikeRoute.slug 목록
  toggleCompleted: (slug: string) => void;
  reset: () => void;
}

export const useBikePassportStore = create<BikePassportState>()(
  persist(
    (set, get) => ({
      completed: [],
      toggleCompleted: (slug) => {
        const { completed } = get();
        set({
          completed: completed.includes(slug)
            ? completed.filter((s) => s !== slug)
            : [...completed, slug],
        });
      },
      reset: () => set({ completed: [] }),
    }),
    {
      name: "krt-bike-passport",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
