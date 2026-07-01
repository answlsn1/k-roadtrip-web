"use client";

import { useEffect } from "react";
import { Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon } from "@/components/map/markerIcon";
import type { MotorcycleRouteStop } from "@/lib/motorcycle/types";

function FitBounds({ stops }: { stops: MotorcycleRouteStop[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = stops.map((s) => [s.latitude, s.longitude] as [number, number]);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);
  return null;
}

export default function RouteDetailMap({ stops }: { stops: MotorcycleRouteStop[] }) {
  const path: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);
  const center: [number, number] = stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [36.5, 127.8];

  return (
    <LeafletCanvas center={center} zoom={7} scrollWheelZoom style={{ position: "absolute", inset: 0 }}>
      <FitBounds stops={stops} />

      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: "#f59e0b", opacity: 0.8, weight: 3 }} />
      )}

      {stops.map((s, i) => (
        <Marker key={s.id} position={[s.latitude, s.longitude]} icon={numberedIcon("#f59e0b", i + 1)} />
      ))}
    </LeafletCanvas>
  );
}
