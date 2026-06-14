"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { MapWaypoint } from "@/lib/types";
import type { PlaceResult } from "@/lib/types";
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

  const panel = (
    <>
      <DraftHeader />
      <PlaceSearch
        curatedData={curatedData}
        onPreview={setPreviews}
        sponsoredPlaces={SPONSORED_PLACES}
      />
      <div className="flex-1 overflow-y-auto overscroll-contain py-2">
        <StopList />
      </div>
      <BuilderCTA />
    </>
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* Full-screen map */}
      <BuilderMap
        stops={hydrated ? stops : []}
        previews={previews}
        onAddPreview={(p) => addStop(p)}
      />

      {/* Desktop: left panel */}
      <aside className="absolute bottom-0 left-0 top-0 z-10 hidden w-[400px] flex-col bg-white pt-4 shadow-2xl md:flex">
        {panel}
      </aside>

      {/* Mobile: bottom sheet */}
      <section className="absolute inset-x-0 bottom-0 z-10 flex h-[62vh] flex-col rounded-t-3xl bg-white pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.15)] md:hidden">
        <div className="flex justify-center pb-1">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>
        {panel}
      </section>
    </div>
  );
}
