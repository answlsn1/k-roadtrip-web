"use client";

import { Marker, Polyline, useMapEvents } from "react-leaflet";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon } from "@/components/map/markerIcon";

export interface DraftStop {
  tempId: string;
  name: string;
  latitude: number;
  longitude: number;
  note?: string;
}

function ClickCapture({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface NewRouteMapProps {
  stops: DraftStop[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function NewRouteMap({ stops, onMapClick }: NewRouteMapProps) {
  const path: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);

  return (
    <LeafletCanvas
      center={[36.5, 127.8]}
      zoom={7}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0 }}
    >
      <ClickCapture onClick={onMapClick} />

      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: "#f59e0b", opacity: 0.8, weight: 3 }} />
      )}

      {stops.map((s, i) => (
        <Marker key={s.tempId} position={[s.latitude, s.longitude]} icon={numberedIcon("#f59e0b", i + 1)} />
      ))}
    </LeafletCanvas>
  );
}
