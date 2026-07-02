"use client";

import { useEffect } from "react";
import { Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon } from "@/components/map/markerIcon";
import type { MotorcycleRouteStop } from "@/lib/motorcycle/types";

function FitBounds({
  stops,
  trackPoints,
}: {
  stops: MotorcycleRouteStop[];
  trackPoints: [number, number][] | null;
}) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [
      ...stops.map((s) => [s.latitude, s.longitude] as [number, number]),
      ...(trackPoints ?? []),
    ];
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, trackPoints]);
  return null;
}

interface RouteDetailMapProps {
  stops: MotorcycleRouteStop[];
  /** 주행 기록이 남긴 실제 GPS 경로 — 있으면 경유지 직선 대신 이걸 그린다. */
  trackPoints?: [number, number][] | null;
}

export default function RouteDetailMap({ stops, trackPoints }: RouteDetailMapProps) {
  const track = trackPoints && trackPoints.length >= 2 ? trackPoints : null;
  const path: [number, number][] = track ?? stops.map((s) => [s.latitude, s.longitude]);
  const center: [number, number] =
    stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [36.5, 127.8];

  return (
    <LeafletCanvas center={center} zoom={7} scrollWheelZoom style={{ position: "absolute", inset: 0 }}>
      <FitBounds stops={stops} trackPoints={track} />

      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: "#f59e0b", opacity: 0.8, weight: 3 }} />
      )}

      {stops.map((s, i) => (
        <Marker key={s.id} position={[s.latitude, s.longitude]} icon={numberedIcon("#f59e0b", i + 1)} />
      ))}
    </LeafletCanvas>
  );
}
