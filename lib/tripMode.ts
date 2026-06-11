/* ============================================================
 * Trip Mode — remembers how far along a route the user is,
 * so when they return from Naver Map we can offer
 * "Next stop: ④ …" in one tap. localStorage only, ₩0.
 * Progress = highest waypoint sequence the user navigated to.
 * ============================================================ */

const keyOf = (routeId: number) => `krt-trip-progress-${routeId}`;

export function getTripProgress(routeId: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(keyOf(routeId));
    if (!raw) return 0;
    const v = JSON.parse(raw) as { seq?: unknown };
    return typeof v.seq === "number" ? v.seq : 0;
  } catch {
    return 0;
  }
}

/** Never regresses — revisiting an earlier stop keeps the max. */
export function setTripProgress(routeId: number, seq: number): void {
  try {
    const next = Math.max(seq, getTripProgress(routeId));
    localStorage.setItem(keyOf(routeId), JSON.stringify({ seq: next, updatedAt: Date.now() }));
  } catch {
    /* storage unavailable — Trip Mode silently degrades */
  }
}

export function clearTripProgress(routeId: number): void {
  try {
    localStorage.removeItem(keyOf(routeId));
  } catch {
    /* ignore */
  }
}
