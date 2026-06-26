// Auto pre-fill heuristics for the Travel Expense Ledger.
//
// Given a saved trip, produce a rough KRW estimate per expense category so the
// ledger opens with sensible "expected cost" numbers the user can then edit and
// reconcile against what they actually spend. Everything here is an APPROXIMATION
// — nationwide baseline unit prices, no region/season pricing. Surfaced behind
// an "estimate" label only.

import type { SavedTrip, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";

// ── Baseline unit prices (KRW) — approx, editable ───────────────────────────
// Nationwide rough averages for a self-drive foreign-tourist road trip.
export const BASELINE = {
  /** Per meal, per person-day equivalent (mid-range casual). */
  MEAL_KRW: 13_000,
  /** Per night, mid-range accommodation. */
  LODGING_PER_NIGHT_KRW: 90_000,
  /** Rental car, per day (compact, incl. basic insurance). */
  RENTAL_PER_DAY_KRW: 80_000,
  /** Fuel + tolls combined, per day of driving. */
  FUEL_TOLLS_PER_DAY_KRW: 30_000,
  /** Admission / entry fee, per paid attraction. */
  ENTRANCE_PER_STOP_KRW: 5_000,
} as const;

// ── Trip-shape constants ────────────────────────────────────────────────────
/** Meals counted per day (breakfast / lunch / dinner). */
const MEALS_PER_DAY = 3;
/** Stops we assume a traveler covers in one day → drives the day estimate. */
const STOPS_PER_DAY = 4;
/** Minimum trip length, so a 1-stop trip still estimates as a day. */
const MIN_DAYS = 1;

/**
 * type_tag values we treat as paid-admission attractions for the entrance
 * estimate. The food line is driven by days × meals (not by food-tagged stops),
 * and landmark/scenic/beach/rest_area are typically free, so only genuine
 * paid-admission tags count here. Conservative on purpose — better to
 * under-estimate fees than invent them.
 */
const PAID_ADMISSION_TAGS: ReadonlySet<string> = new Set(["heritage", "sights"]);

/** Empty estimate map with every category at 0 (stable key order). */
function zeroEstimates(): Record<ExpenseCategory, number> {
  return EXPENSE_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = 0;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );
}

/**
 * Estimate trip length in days from stop count.
 * SavedTrip carries no explicit day/duration field, so we approximate from how
 * many stops the user planned: ~STOPS_PER_DAY stops ≈ one day, floored at MIN_DAYS.
 */
export function estimateTripDays(trip: SavedTrip): number {
  return Math.max(MIN_DAYS, Math.ceil(trip.stops.length / STOPS_PER_DAY));
}

/** Count stops whose type_tag implies a paid admission fee. */
export function countPaidAdmissionStops(trip: SavedTrip): number {
  return trip.stops.filter((s) => PAID_ADMISSION_TAGS.has(s.type_tag)).length;
}

/**
 * Produce a per-category KRW estimate to pre-fill a trip's ledger.
 * All figures are rough nationwide approximations the user is expected to edit.
 */
export function estimateRouteCost(
  trip: SavedTrip
): Record<ExpenseCategory, number> {
  const estimates = zeroEstimates();

  const days = estimateTripDays(trip);
  const nights = Math.max(0, days - 1);
  const paidStops = countPaidAdmissionStops(trip);

  estimates.car = days * BASELINE.RENTAL_PER_DAY_KRW;
  estimates.fuel = days * BASELINE.FUEL_TOLLS_PER_DAY_KRW;
  estimates.lodging = nights * BASELINE.LODGING_PER_NIGHT_KRW;
  estimates.food = days * MEALS_PER_DAY * BASELINE.MEAL_KRW;
  estimates.entrance = paidStops * BASELINE.ENTRANCE_PER_STOP_KRW;
  estimates.other = 0;

  return estimates;
}
