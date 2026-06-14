"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { buildNaverWebRouteUrl, type NaverRoutePoint } from "@/lib/domain/naverMapLink";
import { totalKm, driveMin } from "@/lib/domain/geo";
import { splitForNaver } from "@/lib/domain/routeSplitter";

export default function BuilderCTA() {
  const stops = useBuilderStore((s) => s.draft.stops);
  const [copied, setCopied] = useState(false);

  const enough = stops.length >= 2;
  const km = totalKm(stops);
  const mins = driveMin(km);

  const chunks = enough ? splitForNaver(stops) : null;
  const singleUrl =
    !chunks && enough
      ? buildNaverWebRouteUrl(
          stops.map(
            (s, i): NaverRoutePoint => ({
              latitude: s.latitude,
              longitude: s.longitude,
              place_name_ko: s.name_ko,
              sequence: i,
            })
          )
        )
      : undefined;

  const copyKorean = () => {
    const text = stops.map((s, i) => `${i + 1}. ${s.name_ko}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-2 border-t border-slate-100 bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
      {enough && (
        <p className="text-center text-xs font-semibold text-slate-400">
          {stops.length} stops · ≈ {km.toFixed(1)} km ·{" "}
          {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`} drive
        </p>
      )}

      {chunks ? (
        <div className="space-y-1.5">
          {chunks.map((chunk, idx) => (
            <a
              key={idx}
              href={chunk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#03C75A] py-3.5 text-sm font-extrabold text-white shadow-md shadow-green-500/25 transition-transform active:scale-[0.99]"
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black"
                style={{ color: "#03C75A" }}
              >
                N
              </span>
              Route Part.{idx + 1}
              <span className="font-semibold opacity-70">
                ({chunk.fromIdx}~{chunk.toIdx})
              </span>
            </a>
          ))}
        </div>
      ) : (
        <a
          href={singleUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!enough}
          onClick={(e) => {
            if (!enough) e.preventDefault();
          }}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-extrabold text-white transition-transform active:scale-[0.99] ${
            enough
              ? "bg-[#03C75A] shadow-lg shadow-green-500/30"
              : "cursor-not-allowed bg-slate-300"
          }`}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black"
            style={{ color: enough ? "#03C75A" : "#cbd5e1" }}
          >
            N
          </span>
          {enough ? "Open route in Naver Map" : "Add at least 2 stops"}
        </a>
      )}

      {enough && (
        <button
          onClick={copyKorean}
          className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          {copied ? "✓ Copied!" : "Copy Korean names"}
        </button>
      )}
    </div>
  );
}
