"use client";

import { useEffect } from "react";
import { Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Waypoint } from "@/lib/types";
import { typeMeta } from "@/lib/config/constants";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon } from "@/components/map/markerIcon";

function MapController({ waypoints, selectedId }: { waypoints: Waypoint[]; selectedId: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map((w) => [w.latitude, w.longitude] as [number, number]));
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    setTimeout(() => {
      map.fitBounds(bounds, {
        paddingTopLeft: desktop ? [440, 64] : [40, 72],
        paddingBottomRight: desktop ? [64, 64] : [40, Math.round(window.innerHeight * 0.5)],
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    const w = waypoints.find((wp) => wp.id === selectedId);
    if (w) map.panTo([w.latitude, w.longitude], { animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
}

interface RouteLeafletMapProps {
  waypoints: Waypoint[];
  selectedId: number | null;
  onSelect: (w: Waypoint) => void;
  progress: number;
}

export default function RouteLeafletMap({ waypoints, selectedId, onSelect, progress }: RouteLeafletMapProps) {
  const ordered = [...waypoints].sort((a, b) => a.sequence - b.sequence);
  const path: [number, number][] = ordered.map((w) => [w.latitude, w.longitude]);
  const center: [number, number] =
    ordered.length > 0 ? [ordered[0].latitude, ordered[0].longitude] : [36.5, 127.8];

  return (
    <LeafletCanvas
      center={center}
      zoom={10}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      <MapController waypoints={ordered} selectedId={selectedId} />
      <Polyline
        positions={path}
        pathOptions={{ color: "#0f172a", opacity: 0.65, weight: 3 }}
      />
      {ordered.map((w) => {
        const meta = typeMeta(w.type_tag);
        const visited = progress >= w.sequence && progress > 0;
        const label = visited ? "✓" : String(w.sequence);
        return (
          <Marker
            key={w.id}
            position={[w.latitude, w.longitude]}
            icon={numberedIcon(meta.color, label, { selected: selectedId === w.id })}
            zIndexOffset={selectedId === w.id ? 1000 : w.sequence * 10}
            eventHandlers={{ click: () => onSelect(w) }}
          />
        );
      })}
    </LeafletCanvas>
  );
}
