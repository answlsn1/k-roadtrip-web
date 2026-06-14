"use client";

import { useEffect } from "react";
import { Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { BuilderStop, PlaceResult } from "@/lib/types";
import { typeMeta } from "@/lib/config/constants";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon, previewIcon } from "@/components/map/markerIcon";

function FitBounds({ stops, previews }: { stops: BuilderStop[]; previews: PlaceResult[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = [
      ...stops.map((s) => [s.latitude, s.longitude] as [number, number]),
      ...previews.map((p) => [p.latitude, p.longitude] as [number, number]),
    ];
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 12);
      return;
    }
    const bounds = L.latLngBounds(pts);
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    map.fitBounds(bounds, {
      paddingTopLeft: desktop ? [420, 56] : [40, 56],
      paddingBottomRight: desktop ? [56, 56] : [40, Math.round(window.innerHeight * 0.45)],
      maxZoom: 13,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, previews]);
  return null;
}

interface BuilderMapProps {
  stops: BuilderStop[];
  previews: PlaceResult[];
  onAddPreview: (p: PlaceResult) => void;
}

export default function BuilderMap({ stops, previews, onAddPreview }: BuilderMapProps) {
  const path: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);
  const center: [number, number] =
    stops.length > 0 ? [stops[0].latitude, stops[0].longitude] : [36.5, 127.8];

  const addedKeys = new Set(stops.map((s) => `${s.source}:${s.sourceId}`));
  const visiblePreviews = previews.filter(
    (p) => !addedKeys.has(`${p.source}:${p.sourceId}`)
  );

  return (
    <LeafletCanvas
      center={center}
      zoom={7}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      <FitBounds stops={stops} previews={visiblePreviews} />

      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: "#0f172a", opacity: 0.6, weight: 3 }} />
      )}

      {stops.map((s, i) => (
        <Marker
          key={s.tempId}
          position={[s.latitude, s.longitude]}
          icon={numberedIcon(typeMeta(s.type_tag).color, i + 1)}
          zIndexOffset={(i + 1) * 10}
        />
      ))}

      {visiblePreviews.map((p) => (
        <Marker
          key={`${p.source}:${p.sourceId}`}
          position={[p.latitude, p.longitude]}
          icon={previewIcon()}
          eventHandlers={{ click: () => onAddPreview(p) }}
        />
      ))}
    </LeafletCanvas>
  );
}
