import L from "leaflet";

const NS = "http://www.w3.org/2000/svg";

function circleSvg(
  size: number,
  fill: string,
  label: string,
  opts: { dashed?: boolean; fontSize?: number } = {}
): string {
  if (opts.dashed) {
    return `<svg xmlns="${NS}" width="${size}" height="${size}" viewBox="0 0 34 34"><circle cx="17" cy="17" r="11" fill="#fff" stroke="#94a3b8" stroke-width="3" stroke-dasharray="3 2"/><text x="17" y="22" font-family="Arial,sans-serif" font-size="${opts.fontSize ?? 16}" font-weight="700" fill="#475569" text-anchor="middle">${label}</text></svg>`;
  }
  return `<svg xmlns="${NS}" width="${size}" height="${size}" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="${fill}" stroke="#fff" stroke-width="3"/><text x="17" y="22" font-family="Arial,sans-serif" font-size="${opts.fontSize ?? 13}" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`;
}

/**
 * Numbered or labelled pin for route waypoints and builder stops.
 * Pass `selected: true` to enlarge to 40 px (route viewer highlight).
 */
export function numberedIcon(
  color: string,
  label: string | number,
  opts: { selected?: boolean } = {}
): L.DivIcon {
  const size = opts.selected ? 40 : 32;
  return L.divIcon({
    html: circleSvg(size, color, String(label)),
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Dashed-circle pin for OSM search results not yet added to a route. */
export function previewIcon(): L.DivIcon {
  return L.divIcon({
    html: circleSvg(28, "", "+", { dashed: true }),
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/**
 * Pin-drop candidate dot ("you picked here") for the builder map.
 * Anchored dead-center so the dot sits exactly on the clicked point;
 * the pulse ring lives in globals.css (off under prefers-reduced-motion).
 */
export function pinDropIcon(): L.DivIcon {
  return L.divIcon({
    html: '<span class="krt-pin-dot"><span class="krt-pin-dot-ring"></span></span>',
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
