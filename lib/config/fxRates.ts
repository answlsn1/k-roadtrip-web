// Build-snapshot foreign-exchange rates for the Travel Expense Ledger.
//
// HARD RULE: these are static, hand-maintained approximations baked into the
// build. There is NO runtime FX API call, no key, no network. Values are
// intentionally rough and are ONLY ever surfaced behind an "approx" (≈) label —
// never as an exact/authoritative conversion. Refresh manually + bump FX_AS_OF.

/** Month the snapshot rates were last reviewed. Shown next to "approx" copy. */
export const FX_AS_OF = "2026-06";

/**
 * KRW per 1 unit of the currency (approx, editable).
 * e.g. 1 USD ≈ 1380 KRW, 1 JPY ≈ 8.9 KRW.
 * KRW is the base (1) — the ledger normalizes every entry to KRW.
 */
export const FX_KRW_PER_UNIT: Record<string, number> = {
  KRW: 1,
  USD: 1380,
  JPY: 8.9,
  EUR: 1480,
  CNY: 190,
};

/** Display symbol per currency. CNY shares ¥ with JPY, so it uses the 元 glyph. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  KRW: "₩",
  USD: "$",
  JPY: "¥",
  EUR: "€",
  CNY: "元",
};

/** Currencies the ledger UI can offer, in display order. */
export const SUPPORTED_CURRENCIES: readonly string[] = [
  "KRW",
  "USD",
  "JPY",
  "EUR",
  "CNY",
] as const;

/** Rate lookup with a safe fallback (unknown currency → treated 1:1 with KRW). */
function rateFor(cur: string): number {
  return FX_KRW_PER_UNIT[cur] ?? 1;
}

/** Currency symbol with a safe fallback to the raw code. */
export function currencySymbol(cur: string): string {
  return CURRENCY_SYMBOLS[cur] ?? cur;
}

/** Convert an amount in `cur` to KRW. */
export function toKrw(amount: number, cur: string): number {
  return amount * rateFor(cur);
}

/** Convert a KRW amount into `cur`. */
export function fromKrw(krw: number, cur: string): number {
  return krw / rateFor(cur);
}

/**
 * Approximate label for a KRW amount in `cur`, e.g. "≈ $279".
 * Returns "" for KRW (no approximation needed — KRW is the source of truth).
 * Rounds to whole units to keep it visibly an estimate, not a precise figure.
 */
export function formatApprox(krw: number, cur: string): string {
  if (cur === "KRW") return "";
  const value = Math.round(fromKrw(krw, cur));
  return `≈ ${currencySymbol(cur)}${value.toLocaleString("en-US")}`;
}
