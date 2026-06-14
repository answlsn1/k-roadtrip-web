"use client";

import { useEffect } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import type { MapWaypoint } from "@/lib/types";
import { typeMeta } from "@/lib/config/constants";
import { useSavedStore } from "@/store/useSavedStore";
import LeafletCanvas from "@/components/map/LeafletCanvas";

interface LeafletMapProps {
  waypoints: MapWaypoint[];
  activeRegion: string | null;
}

function SaveBtn({ waypoint }: { waypoint: MapWaypoint }) {
  useEffect(() => { useSavedStore.persist.rehydrate(); }, []);
  const saved = useSavedStore((s) => s.items.some((i) => i.id === waypoint.id));
  const toggle = useSavedStore((s) => s.toggle);

  return (
    <button
      onClick={() =>
        toggle({
          id: waypoint.id,
          place_name_en: waypoint.place_name_en,
          place_name_ko: waypoint.place_name_ko,
          route_slug: waypoint.route_slug,
          region_name_en: waypoint.region_name_en,
          type_tag: waypoint.type_tag,
        })
      }
      style={{
        display: "block",
        width: "100%",
        marginTop: 6,
        background: saved ? "#f1f5f9" : "#0f172a",
        color: saved ? "#64748b" : "#fff",
        border: "none",
        borderRadius: 10,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      {saved ? "★ Saved" : "☆ Save to My Trip"}
    </button>
  );
}

export default function LeafletMap({ waypoints, activeRegion }: LeafletMapProps) {
  const filtered = activeRegion
    ? waypoints.filter((w) => w.region_name_en === activeRegion)
    : waypoints;

  const center: [number, number] =
    filtered.length > 0
      ? [
          filtered.reduce((s, w) => s + w.latitude, 0) / filtered.length,
          filtered.reduce((s, w) => s + w.longitude, 0) / filtered.length,
        ]
      : [36.5, 127.8];

  return (
    <LeafletCanvas
      mapKey={activeRegion ?? "all"}
      center={center}
      zoom={activeRegion ? 11 : 7}
    >
      {filtered.map((w) => {
        const meta = typeMeta(w.type_tag);
        return (
          <CircleMarker
            key={w.id}
            center={[w.latitude, w.longitude]}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: meta.color,
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: "inherit", minWidth: 190 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: meta.color,
                    margin: "0 0 2px",
                  }}
                >
                  {meta.label_en} · {w.region_name_en}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0 0 2px",
                  }}
                >
                  {w.place_name_en}
                </p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px" }}>
                  {w.place_name_ko}
                </p>
                <a
                  href={`/routes/${w.route_slug}`}
                  style={{
                    display: "block",
                    background: "#0f172a",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  View course →
                </a>
                <SaveBtn waypoint={w} />
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </LeafletCanvas>
  );
}
