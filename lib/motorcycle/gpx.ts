/* ============================================================
 * GPX 생성 — "퍼가기 아티팩트"(TRAFFIC-STRATEGY §2-D).
 * 기록 트랙(track_points)은 <trk>로, 경유지는 <wpt>로 내보낸다.
 * 타임스탬프는 저장하지 않으므로 <time> 없이(GPX 1.1 유효).
 * ============================================================ */

import type { MotorcycleRouteWithStops } from "./types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildRouteGpx(route: MotorcycleRouteWithStops, appUrl: string): string {
  const name = esc(route.title);
  const desc = route.description ? esc(route.description) : "";
  const link = `${appUrl}/motorcycle/routes/${route.id}`;

  const wpts = route.stops
    .map(
      (s) =>
        `  <wpt lat="${s.latitude}" lon="${s.longitude}">\n    <name>${esc(s.name)}</name>\n  </wpt>`
    )
    .join("\n");

  const trk =
    route.track_points && route.track_points.length >= 2
      ? `  <trk>\n    <name>${name}</name>\n    <trkseg>\n${route.track_points
          .map((p) => `      <trkpt lat="${p[0]}" lon="${p[1]}"/>`)
          .join("\n")}\n    </trkseg>\n  </trk>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="K-Riders (${esc(appUrl)}/motorcycle)" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
    ${desc ? `<desc>${desc}</desc>` : ""}
    <link href="${esc(link)}"><text>K-Riders</text></link>
  </metadata>
${wpts}
${trk}
</gpx>`;
}

/** 브라우저에서 GPX 파일 다운로드 트리거. */
export function downloadGpx(route: MotorcycleRouteWithStops, appUrl: string): void {
  const gpx = buildRouteGpx(route, appUrl);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${route.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60)}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
