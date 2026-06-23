"use client";

import { useEffect } from "react";
import { useSavedStore } from "@/store/useSavedStore";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";
import { useMyTripStore } from "@/store/useMyTripStore";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/** Navbar "★ My Trip" trigger (+ saved-count badge). Opens the shared drawer.
 *  `onOpen` lets the mobile hamburger close itself when the drawer opens. */
export default function MyTripButton({ onOpen }: { onOpen?: () => void }) {
  useEffect(() => {
    useSavedStore.persist.rehydrate();
    useSavedTripsStore.persist.rehydrate();
  }, []);

  const lang = useLangStore((s) => s.lang);
  const savedCount = useSavedStore((s) => s.items.length);
  const tripCount = useSavedTripsStore((s) => s.trips.length);
  const setOpen = useMyTripStore((s) => s.setOpen);
  const count = savedCount + tripCount;

  return (
    <button
      onClick={() => {
        setOpen(true);
        onOpen?.();
      }}
      className="flex items-center gap-1 transition-colors hover:text-ink"
    >
      <span className="text-amber-400">★</span>
      {t("nav.mytrip", lang)}
      {count > 0 && (
        <span className="ml-0.5 grid min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-extrabold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
