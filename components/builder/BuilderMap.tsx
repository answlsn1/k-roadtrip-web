"use client";

import { useEffect, useRef, useState } from "react";
import { Polyline, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { BuilderStop, PlaceResult } from "@/lib/types";
import { typeMeta } from "@/lib/config/constants";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon, previewIcon, pinDropIcon } from "@/components/map/markerIcon";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

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

/* ── Pin-drop: click/tap anywhere → candidate dot + confirm popup ──
 * Leaflet only fires `click` for real clicks and taps (drags and pinch-zooms
 * don't), and marker clicks don't bubble to the map, so this one handler
 * covers desktop + mobile without touching the existing marker flows. */

interface PinCandidate {
  lat: number;
  lng: number;
}

function PinDropLayer({
  onAdd,
}: {
  onAdd: (p: PlaceResult) => { ok: boolean; reason?: string };
}) {
  const [pin, setPin] = useState<PinCandidate | null>(null);
  const [label, setLabel] = useState<{ ko: string; en: string } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);

  // Latest candidate, readable from the popup-remove closure below.
  const pinRef = useRef<PinCandidate | null>(null);
  pinRef.current = pin;

  useMapEvents({
    click: (e) => {
      // Re-clicking simply moves the single candidate to the new spot.
      setPin({ lat: e.latlng.lat, lng: e.latlng.lng });
      setFlash(null);
    },
  });

  // Resolve a human-readable label (Korean address → coords fallback).
  useEffect(() => {
    if (!pin) {
      setLabel(null);
      return;
    }
    setLabel(null);
    const coordLabel = `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;
    const ac = new AbortController();
    fetch(`/api/geocode?lat=${pin.lat}&lng=${pin.lng}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data: { pin?: { label_ko?: string; label_en?: string } | null }) => {
        if (ac.signal.aborted) return;
        setLabel({
          ko: data.pin?.label_ko || coordLabel,
          en: data.pin?.label_en || coordLabel,
        });
      })
      .catch(() => {
        if (!ac.signal.aborted) setLabel({ ko: coordLabel, en: coordLabel });
      });
    return () => ac.abort();
  }, [pin]);

  if (!pin) return null;

  const coordCaption = `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;

  const handleAdd = () => {
    const res = onAdd({
      source: "pin",
      sourceId: `pin-${pin.lat.toFixed(6)},${pin.lng.toFixed(6)}`,
      name_en: label?.en ?? coordCaption,
      name_ko: label?.ko ?? coordCaption,
      latitude: pin.lat,
      longitude: pin.lng,
      type_tag: "landmark",
    });
    if (res.ok) {
      setPin(null); // the numbered stop marker takes over from here
    } else {
      setFlash(t("search.alreadyAdded", lang));
    }
  };

  return (
    <>
      <Marker
        position={[pin.lat, pin.lng]}
        icon={pinDropIcon()}
        interactive={false}
        zIndexOffset={2000}
      />
      <Popup
        key={`${pin.lat},${pin.lng}`}
        position={[pin.lat, pin.lng]}
        offset={[0, -10]}
        eventHandlers={{
          // Closing the popup (X or Leaflet's map-click close) cancels the
          // candidate — but only if it still belongs to this spot (a re-click
          // may have already moved the pin before this popup unmounts).
          remove: () => {
            if (pinRef.current === pin) setPin(null);
          },
        }}
      >
        <div className="min-w-[190px] max-w-[230px]">
          {label ? (
            <p className="text-[13px] font-bold leading-snug text-slate-900">
              {lang === "ko" ? label.ko : label.en}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
              {t("builder.pinResolving", lang)}
            </p>
          )}
          {/* Skip the caption while the label itself is the coordinate string. */}
          {(!label || (lang === "ko" ? label.ko : label.en) !== coordCaption) && (
            <p className="mt-0.5 text-[10px] font-medium tabular-nums text-slate-400">
              {coordCaption}
            </p>
          )}
          {flash && (
            <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              {flash}
            </p>
          )}
          <button
            onClick={handleAdd}
            className="mt-2 w-full rounded-xl bg-slate-900 py-2 text-xs font-extrabold text-white transition-transform active:scale-[0.98]"
          >
            {t("builder.pinAdd", lang)}
          </button>
        </div>
      </Popup>
    </>
  );
}

interface BuilderMapProps {
  stops: BuilderStop[];
  previews: PlaceResult[];
  onAddPreview: (p: PlaceResult) => void;
  onAddPin: (p: PlaceResult) => { ok: boolean; reason?: string };
}

export default function BuilderMap({
  stops,
  previews,
  onAddPreview,
  onAddPin,
}: BuilderMapProps) {
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

      <PinDropLayer onAdd={onAddPin} />
    </LeafletCanvas>
  );
}
