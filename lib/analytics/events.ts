/* ============================================================
 * 지역 가치 증거 레이어 — 클라이언트 이벤트 계측.
 * 모든 이벤트는 /api/track 으로 fire-and-forget POST → 서버가 국가코드를
 * 헤더(Vercel geo)로 보강해 Supabase `events` 테이블에 적재한다.
 * PII 없음: session_id 는 브라우저별 랜덤 id.
 * ============================================================ */

export type AppEventType =
  | "region_view"
  | "route_view"
  | "plan_created"
  | "naver_handoff"
  | "affiliate_click";

const SESSION_STORAGE_KEY = "krt-session";

/** Stable anonymous per-browser id (shared with the legacy analytics session). */
function sessionId(): string | null {
  try {
    let k = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!k) {
      k =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem(SESSION_STORAGE_KEY, k);
    }
    return k;
  } catch {
    return null;
  }
}

export interface TrackPayload {
  region?: string | null;
  /** Route slug or id (stored as text). */
  routeId?: string | number | null;
  /** For affiliate_click: partner identifier (e.g. rental/flight). */
  affiliatePartner?: string | null;
}

/**
 * Record a funnel event. Never throws and never blocks the UI.
 * `keepalive` lets the event survive an immediate navigation (e.g. the Naver
 * deep-link handoff that takes the user off the page).
 */
export function trackEvent(type: AppEventType, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      event_type: type,
      region: payload.region ?? null,
      route_id: payload.routeId != null ? String(payload.routeId) : null,
      affiliate_partner: payload.affiliatePartner ?? null,
      locale: typeof navigator !== "undefined" ? navigator.language ?? null : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      session_id: sessionId(),
    });
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break or slow the UX */
    });
  } catch {
    /* ignore */
  }
}
