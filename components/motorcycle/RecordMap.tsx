"use client";

import { useEffect } from "react";
import { CircleMarker, Polyline, useMap } from "react-leaflet";
import LeafletCanvas from "@/components/map/LeafletCanvas";

/** 새 포인트가 들어올 때마다 지도를 현재 위치로 따라간다. */
function FollowLatest({ point }: { point: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.setView(point, Math.max(map.getZoom(), 15));
  }, [point, map]);
  return null;
}

interface RecordMapProps {
  points: [number, number][];
}

export default function RecordMap({ points }: RecordMapProps) {
  const latest = points.length > 0 ? points[points.length - 1] : null;

  return (
    <LeafletCanvas
      center={latest ?? [36.5, 127.8]}
      zoom={latest ? 15 : 7}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0 }}
    >
      <FollowLatest point={latest} />

      {points.length >= 2 && (
        <Polyline positions={points} pathOptions={{ color: "#f59e0b", opacity: 0.9, weight: 4 }} />
      )}

      {latest && (
        <CircleMarker
          center={latest}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#f59e0b", fillOpacity: 1 }}
        />
      )}
    </LeafletCanvas>
  );
}
