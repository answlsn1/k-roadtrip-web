"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ExpenseCategory,
  ExpenseEntry,
  TripLedger,
} from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";

const STORAGE_KEY = "krt-trip-ledgers";
const STORAGE_VERSION = 1;

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Default display currency before the user picks one (KRW = source of truth). */
const DEFAULT_DISPLAY_CURRENCY = "KRW";

function zeroEstimates(): Record<ExpenseCategory, number> {
  return EXPENSE_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = 0;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );
}

interface TripLedgerState {
  /** key = tripId */
  ledgers: Record<string, TripLedger>;

  /** Create the ledger for a trip if it doesn't exist yet, seeding estimates.
   *  No-op (estimates untouched) if the ledger already exists. */
  ensureLedger: (
    tripId: string,
    estimates: Record<ExpenseCategory, number>
  ) => void;

  /** Append an entry. Caller supplies everything except the id/timestamp, which
   *  are generated here. Auto-creates the ledger if missing. Returns the new id. */
  addEntry: (
    tripId: string,
    entry: Omit<ExpenseEntry, "id" | "loggedAt">
  ) => string;

  removeEntry: (tripId: string, entryId: string) => void;
  setEstimate: (
    tripId: string,
    category: ExpenseCategory,
    krw: number
  ) => void;
  setDisplayCurrency: (tripId: string, cur: string) => void;
  /** Replace a category's actual total with a single entry (inline edit on the
   *  Cost Sheet). Removes that category's existing entries, then — if amountKrw>0
   *  — writes one normalized entry. amountKrw<=0 just clears the category. */
  setCategoryActual: (
    tripId: string,
    category: ExpenseCategory,
    input: { amountKrw: number; inputCurrency: string; inputAmount: number }
  ) => void;
  /** Remove the entire ledger for a trip. */
  clearLedger: (tripId: string) => void;
}

/** Build a fresh ledger object for a trip. */
function makeLedger(
  tripId: string,
  estimates: Record<ExpenseCategory, number>
): TripLedger {
  return {
    tripId,
    estimates: { ...estimates },
    entries: [],
    displayCurrency: DEFAULT_DISPLAY_CURRENCY,
  };
}

export const useTripLedgerStore = create<TripLedgerState>()(
  persist(
    (set, get) => ({
      ledgers: {},

      ensureLedger: (tripId, estimates) => {
        if (get().ledgers[tripId]) return;
        set((s) => ({
          ledgers: { ...s.ledgers, [tripId]: makeLedger(tripId, estimates) },
        }));
      },

      addEntry: (tripId, entry) => {
        const id = newId();
        const full: ExpenseEntry = {
          ...entry,
          id,
          loggedAt: new Date().toISOString(),
        };
        set((s) => {
          // Auto-create an empty (zero-estimate) ledger if logging before ensure.
          const existing =
            s.ledgers[tripId] ?? makeLedger(tripId, zeroEstimates());
          return {
            ledgers: {
              ...s.ledgers,
              [tripId]: { ...existing, entries: [...existing.entries, full] },
            },
          };
        });
        return id;
      },

      removeEntry: (tripId, entryId) =>
        set((s) => {
          const ledger = s.ledgers[tripId];
          if (!ledger) return s;
          return {
            ledgers: {
              ...s.ledgers,
              [tripId]: {
                ...ledger,
                entries: ledger.entries.filter((e) => e.id !== entryId),
              },
            },
          };
        }),

      setEstimate: (tripId, category, krw) =>
        set((s) => {
          const ledger = s.ledgers[tripId] ?? makeLedger(tripId, zeroEstimates());
          return {
            ledgers: {
              ...s.ledgers,
              [tripId]: {
                ...ledger,
                estimates: { ...ledger.estimates, [category]: krw },
              },
            },
          };
        }),

      setDisplayCurrency: (tripId, cur) =>
        set((s) => {
          const ledger = s.ledgers[tripId] ?? makeLedger(tripId, zeroEstimates());
          return {
            ledgers: {
              ...s.ledgers,
              [tripId]: { ...ledger, displayCurrency: cur },
            },
          };
        }),

      setCategoryActual: (tripId, category, input) =>
        set((s) => {
          const ledger = s.ledgers[tripId] ?? makeLedger(tripId, zeroEstimates());
          // Drop this category's existing entries; optionally write one replacement.
          const kept = ledger.entries.filter((e) => e.category !== category);
          const entries =
            input.amountKrw > 0
              ? [
                  ...kept,
                  {
                    id: newId(),
                    category,
                    amountKrw: input.amountKrw,
                    inputCurrency: input.inputCurrency,
                    inputAmount: input.inputAmount,
                    loggedAt: new Date().toISOString(),
                  },
                ]
              : kept;
          return {
            ledgers: { ...s.ledgers, [tripId]: { ...ledger, entries } },
          };
        }),

      clearLedger: (tripId) =>
        set((s) => {
          if (!s.ledgers[tripId]) return s;
          const { [tripId]: _removed, ...rest } = s.ledgers;
          return { ledgers: rest };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ledgers: s.ledgers }),
      skipHydration: true,
    }
  )
);

// ── Selectors / helpers ─────────────────────────────────────────────────────
// Pure functions over a TripLedger so UI can compute totals without re-deriving
// the same logic. Read the ledger from the store, then pass it in.

/** Coerce a possibly-corrupted persisted value to a finite number (else 0).
 *  Guards against hand-edited / tampered localStorage where amounts could be
 *  strings or NaN — keeps "₩NaN" off the screen. */
function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Defensive: persisted entries may be missing or non-array if storage is
 *  corrupted. Always hand callers a real array. */
function safeEntries(ledger: TripLedger | undefined): ExpenseEntry[] {
  return ledger && Array.isArray(ledger.entries) ? ledger.entries : [];
}

/** Sum of actual logged entries for one category (KRW). */
export function categoryActual(
  ledger: TripLedger | undefined,
  category: ExpenseCategory
): number {
  return safeEntries(ledger)
    .filter((e) => e.category === category)
    .reduce((sum, e) => sum + num(e.amountKrw), 0);
}

/** Actual logged total across all categories (KRW). */
export function totalActual(ledger: TripLedger | undefined): number {
  return safeEntries(ledger).reduce((sum, e) => sum + num(e.amountKrw), 0);
}

/** Estimated total across all categories (KRW). */
export function totalEstimate(ledger: TripLedger | undefined): number {
  if (!ledger) return 0;
  return EXPENSE_CATEGORIES.reduce(
    (sum, cat) => sum + num(ledger.estimates?.[cat]),
    0
  );
}

/** actual − estimate (KRW). Positive = over budget, negative = under. */
export function totalDifference(ledger: TripLedger | undefined): number {
  return totalActual(ledger) - totalEstimate(ledger);
}

/** Per-category breakdown: estimate, actual, and their difference (KRW). */
export interface CategoryBreakdown {
  category: ExpenseCategory;
  estimate: number;
  actual: number;
  difference: number;
}

/** Breakdown rows for every category, in canonical order. */
export function categoryBreakdowns(
  ledger: TripLedger | undefined
): CategoryBreakdown[] {
  return EXPENSE_CATEGORIES.map((category) => {
    const estimate = num(ledger?.estimates?.[category]);
    const actual = categoryActual(ledger, category);
    return { category, estimate, actual, difference: actual - estimate };
  });
}
