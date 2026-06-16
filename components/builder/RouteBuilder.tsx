"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapWaypoint, PlaceResult } from "@/lib/types";
import { useBuilderStore } from "@/store/useBuilderStore";
import DraftHeader from "./DraftHeader";
import PlaceSearch from "./PlaceSearch";
import StopList from "./StopList";
import BuilderCTA from "./BuilderCTA";
import { SPONSORED_PLACES } from "@/lib/config/sponsored";

const BuilderMap = dynamic(() => import("./BuilderMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

interface RouteBuilderProps {
  curatedData: MapWaypoint[];
}

export default function RouteBuilder({ curatedData }: RouteBuilderProps) {
  const [previews, setPreviews] = useState<PlaceResult[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const stops = useBuilderStore((s) => s.draft.stops);
  const addStop = useBuilderStore((s) => s.addStop);

  // Read localStorage on the client only (store uses skipHydration).
  useEffect(() => {
    useBuilderStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  /* ---------- drag-resizable bottom sheet (mobile only) ---------- */
  // SSR-safe height: start from a fixed value, then sync to the real viewport.
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // collapsed (search peek) · mid (default) · full (sheet covers the map)
  const snaps = useMemo(
    () => [248, Math.round(vh * 0.6), Math.round(vh * 0.92)],
    [vh],
  );
  const [snapIdx, setSnapIdx] = useState(1);
  const [dragVisible, setDragVisible] = useState<number | null>(null);
  const drag = useRef({ startY: 0, startVisible: 0, active: false });

  const visible = dragVisible ?? snaps[snapIdx];
  const sheetHeight = snaps[2];

  const onDragPointerDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, startVisible: visible, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const delta = drag.current.startY - e.clientY;
    if (dragVisible === null && Math.abs(delta) < 4) return;
    setDragVisible(
      Math.min(snaps[2], Math.max(snaps[0], drag.current.startVisible + delta)),
    );
  };
  const onDragPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragVisible !== null) {
      // Snap to the nearest point on release.
      let best = 0;
      snaps.forEach((s, i) => {
        if (Math.abs(s - dragVisible) < Math.abs(snaps[best] - dragVisible)) best = i;
      });
      setSnapIdx(best);
    }
    setDragVisible(null);
  };

  const search = (
    <PlaceSearch
      curatedData={curatedData}
      onPreview={setPreviews}
      sponsoredPlaces={SPONSORED_PLACES}
    />
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* Full-screen map */}
      <BuilderMap
        stops={hydrated ? stops : []}
        previews={previews}
        onAddPreview={(p) => addStop(p)}
      />

      {/* Desktop: fixed left panel */}
      <aside className="absolute bottom-0 left-0 top-0 z-10 hidden w-[400px] flex-col bg-white pt-4 shadow-2xl md:flex">
        <DraftHeader />
        {search}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2">
          <StopList />
        </div>
        <BuilderCTA />
      </aside>

      {/* Mobile: drag-resizable bottom sheet */}
      <section
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.15)] md:hidden"
        style={{
          height: sheetHeight,
          transform: `translateY(${sheetHeight - visible}px)`,
          transition:
            dragVisible === null
              ? "transform 280ms cubic-bezier(0.22,1,0.36,1)"
              : "none",
        }}
      >
        {/* Drag handle — the ONLY draggable zone, so the input & list stay tappable */}
        <div
          className="shrink-0 cursor-grab touch-none pt-3 active:cursor-grabbing"
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
        >
          <div className="flex justify-center pb-2">
            <span className="h-1.5 w-10 rounded-full bg-slate-200" />
          </div>
        </div>

        <DraftHeader />

        {/* Search + stops share one scroll area → drag the sheet up to read long lists */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-2">
          {search}
          <div className="pt-2">
            <StopList />
          </div>
        </div>

        <BuilderCTA />
      </section>
    </div>
  );
}
