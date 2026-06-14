interface LatLng {
  latitude: number;
  longitude: number;
}

/** Haversine straight-line km × 1.35 road-detour factor. */
export function kmBetween(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.35;
}

/** Drive minutes at 50 km/h, rounded to 5-min steps, floor 5. */
export function driveMin(km: number): number {
  return Math.max(5, Math.round(((km / 50) * 60) / 5) * 5);
}

/** Total distance across an ordered list of points (km). */
export function totalKm(points: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += kmBetween(points[i - 1], points[i]);
  return sum;
}
