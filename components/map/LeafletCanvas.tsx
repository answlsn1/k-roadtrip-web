"use client";

import { type ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export interface LeafletCanvasProps {
  center: [number, number];
  zoom: number;
  scrollWheelZoom?: boolean;
  /** Changing mapKey forces a full map remount (e.g. region filter changes). */
  mapKey?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

/**
 * SSR-safe Leaflet shell: MapContainer + OSM TileLayer + CSS.
 * Always consumed inside a `dynamic(..., { ssr: false })` boundary —
 * never rendered on the server, so no window-guard is needed here.
 */
export default function LeafletCanvas({
  center,
  zoom,
  scrollWheelZoom = false,
  mapKey,
  style,
  children,
}: LeafletCanvasProps) {
  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      style={style ?? { height: "100%", width: "100%" }}
    >
      <TileLayer attribution={OSM_ATTR} url={OSM_URL} />
      {children}
    </MapContainer>
  );
}
