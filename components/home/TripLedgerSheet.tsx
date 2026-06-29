"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLangStore } from "@/store/useLangStore";
import { t, tf, type DictKey } from "@/lib/i18n";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  useTripLedgerStore,
  categoryBreakdowns,
  totalActual,
  totalEstimate,
} from "@/store/useTripLedgerStore";
import { estimateRouteCost } from "@/lib/domain/expenseEstimator";
import {
  toKrw,
  formatApprox,
  currencySymbol,
  SUPPORTED_CURRENCIES,
  FX_AS_OF,
} from "@/lib/config/fxRates";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/types";
import type { SavedTrip } from "@/lib/types";

// ── Category presentation (icon + label key) ────────────────────────────────
const CATEGORY_META: Record<ExpenseCategory, { icon: string; labelKey: DictKey }> = {
  car:      { icon: "🚗", labelKey: "ledger.cat.rental" },
  fuel:     { icon: "⛽", labelKey: "ledger.cat.fuel" },
  lodging:  { icon: "🛏️", labelKey: "ledger.cat.stay" },
  food:     { icon: "🍜", labelKey: "ledger.cat.food" },
  entrance: { icon: "🎟️", labelKey: "ledger.cat.entry" },
  other:    { icon: "🧾", labelKey: "ledger.cat.other" },
};

/** Whole-KRW formatter, e.g. 385000 → "₩385,000". */
function formatKrw(krw: number): string {
  return `₩${Math.round(krw).toLocaleString("en-US")}`;
}

/**
 * Combined display: KRW always, plus an approx foreign-currency tail for non-KRW
 * display currencies, e.g. "₩385,000 ≈ $279". KRW is always the source of truth.
 */
function formatWithApprox(krw: number, cur: string): string {
  const base = formatKrw(krw);
  const approx = formatApprox(krw, cur);
  return approx ? `${base} ${approx}` : base;
}

type SheetMode = "sheet" | "log";

interface Props {
  trip: SavedTrip;
  open: boolean;
  onClose: () => void;
}

export default function TripLedgerSheet({ trip, open, onClose }: Props) {
  const lang = useLangStore((s) => s.lang);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // skipHydration: read localStorage on the client whenever this opens.
  useEffect(() => {
    useTripLedgerStore.persist.rehydrate();
  }, [open]);

  const dialogRef = useModalA11y<HTMLElement>(open);

  const ensureLedger = useTripLedgerStore((s) => s.ensureLedger);
  const addEntry = useTripLedgerStore((s) => s.addEntry);
  const setCategoryActual = useTripLedgerStore((s) => s.setCategoryActual);
  const setDisplayCurrency = useTripLedgerStore((s) => s.setDisplayCurrency);
  const ledger = useTripLedgerStore((s) => s.ledgers[trip.id]);

  // Seed estimates when the sheet opens (no-op if the ledger already exists,
  // so prior manual edits survive).
  useEffect(() => {
    if (open) ensureLedger(trip.id, estimateRouteCost(trip));
  }, [open, trip, ensureLedger]);

  const [mode, setMode] = useState<SheetMode>("sheet");
  // Reset to the default mode each time the sheet (re)opens.
  useEffect(() => {
    if (open) setMode("sheet");
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const displayCurrency = ledger?.displayCurrency ?? "KRW";
  const breakdowns = useMemo(() => categoryBreakdowns(ledger), [ledger]);
  const estTotal = totalEstimate(ledger);
  const actTotal = totalActual(ledger);
  const hasAnyActual = actTotal > 0;

  if (!mounted) return null;

  // Transition classes honour reduced-motion (no slide/scale; colors only).
  const panelMotion = reduced
    ? "transition-colors"
    : "transition-transform duration-300 ease-out";
  // On mobile the panel slides on the Y axis (translate-y). On desktop (sm+) it
  // is centered via the base sm:-translate-y-1/2 and must NOT get a translate-y
  // override here, or it slips below the viewport and clips the footer CTA.
  const sheetTranslate = reduced
    ? ""
    : open
    ? "translate-y-0 sm:scale-100"
    : "translate-y-full sm:scale-95";

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[1050] bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("ledger.title", lang)}
        className={[
          "fixed inset-x-0 bottom-0 z-[1100] flex max-h-[88vh] w-full flex-col bg-white shadow-2xl",
          "rounded-t-3xl",
          // Desktop: centered modal.
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
          panelMotion,
          sheetTranslate,
          open ? "" : "pointer-events-none opacity-0 sm:opacity-100",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-ink">
              {t("ledger.title", lang)}
            </h2>
            <p className="truncate text-xs text-slate-400">{trip.title}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
            aria-label={t("common.close", lang)}
          >
            ✕
          </button>
        </div>

        {mode === "sheet" ? (
          <CostSheet
            tripId={trip.id}
            lang={lang}
            breakdowns={breakdowns}
            estTotal={estTotal}
            actTotal={actTotal}
            hasAnyActual={hasAnyActual}
            displayCurrency={displayCurrency}
            reduced={reduced}
            onSetCurrency={(cur) => setDisplayCurrency(trip.id, cur)}
            onEditActual={(category, input) =>
              setCategoryActual(trip.id, category, input)
            }
            onGoLog={() => setMode("log")}
          />
        ) : (
          <LogMode
            lang={lang}
            breakdowns={breakdowns}
            actTotal={actTotal}
            displayCurrency={displayCurrency}
            reduced={reduced}
            onSave={(category, input) => {
              addEntry(trip.id, {
                category,
                amountKrw: input.amountKrw,
                inputCurrency: input.inputCurrency,
                inputAmount: input.inputAmount,
              });
              setMode("sheet");
            }}
            onCancel={() => setMode("sheet")}
          />
        )}
      </aside>
    </>,
    document.body
  );
}

// ── Status helper (icon + color + text, never color alone) ──────────────────
type StatusTone = "ok" | "over" | "none";
function statusTone(estimate: number, actual: number): StatusTone {
  if (actual <= 0) return "none";
  return actual > estimate ? "over" : "ok";
}
function pctLabel(estimate: number, actual: number): string {
  if (estimate <= 0) return "";
  const pct = Math.round(((actual - estimate) / estimate) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

const TONE_CLASS: Record<StatusTone, string> = {
  ok: "text-emerald-600",
  over: "text-orange-600",
  none: "text-slate-400",
};

function StatusText({
  lang,
  estimate,
  actual,
  className = "",
}: {
  lang: "en" | "ko";
  estimate: number;
  actual: number;
  className?: string;
}) {
  const tone = statusTone(estimate, actual);
  const pct = pctLabel(estimate, actual);
  let icon = "–";
  let text = t("ledger.notLogged", lang);
  if (tone === "ok") {
    icon = "✓";
    text = tf("ledger.withinBudget", lang, { pct: pct || "0%" });
  } else if (tone === "over") {
    icon = "⚠";
    text = tf("ledger.overBy", lang, {
      amt: formatKrw(actual - estimate),
      pct: pct || "+0%",
    });
  }
  return (
    <span className={`inline-flex items-center gap-1 ${TONE_CLASS[tone]} ${className}`}>
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

// ── (a) Cost Sheet mode ─────────────────────────────────────────────────────
function CostSheet({
  lang,
  breakdowns,
  estTotal,
  actTotal,
  hasAnyActual,
  displayCurrency,
  reduced,
  onSetCurrency,
  onEditActual,
  onGoLog,
}: {
  tripId: string;
  lang: "en" | "ko";
  breakdowns: ReturnType<typeof categoryBreakdowns>;
  estTotal: number;
  actTotal: number;
  hasAnyActual: boolean;
  displayCurrency: string;
  reduced: boolean;
  onSetCurrency: (cur: string) => void;
  onEditActual: (
    category: ExpenseCategory,
    input: { amountKrw: number; inputCurrency: string; inputAmount: number }
  ) => void;
  onGoLog: () => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Summary header */}
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t("ledger.summaryExpected", lang)}
              </p>
              <p className="text-sm font-bold tabular-nums text-slate-500">
                {formatWithApprox(estTotal, displayCurrency)}
              </p>
            </div>
            <span aria-hidden="true" className="text-slate-300">
              →
            </span>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t("ledger.summaryActual", lang)}
              </p>
              <p className="text-base font-extrabold tabular-nums text-ink">
                {formatWithApprox(actTotal, displayCurrency)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <StatusText
              lang={lang}
              estimate={estTotal}
              actual={actTotal}
              className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {tf("ledger.rateLabel", lang, { date: FX_AS_OF })}
          </p>
        </div>

        {/* Category rows */}
        <ul className="divide-y divide-slate-100">
          {breakdowns.map((row) => (
            <CostRow
              key={row.category}
              lang={lang}
              row={row}
              displayCurrency={displayCurrency}
              onEditActual={onEditActual}
            />
          ))}
        </ul>

        {/* Currency picker + honesty note */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Currency">
            {SUPPORTED_CURRENCIES.map((cur) => {
              const active = cur === displayCurrency;
              return (
                <button
                  key={cur}
                  type="button"
                  onClick={() => onSetCurrency(cur)}
                  aria-pressed={active}
                  className={`min-h-[36px] rounded-xl px-3 text-xs font-bold transition-colors ${
                    active
                      ? "bg-ink text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {currencySymbol(cur)} {cur}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            {t("ledger.approxHint", lang)}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            {t("ledger.phase2Note", lang)}
          </p>
        </div>
      </div>

      {/* Sticky CTA with safe-area padding */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {hasAnyActual && (
          <p className="mb-2 text-center text-xs font-bold text-slate-500">
            {tf("ledger.todaySoFar", lang, {
              amt: formatWithApprox(actTotal, displayCurrency),
            })}
          </p>
        )}
        <button
          type="button"
          onClick={onGoLog}
          className={`w-full rounded-2xl bg-ink py-3.5 font-extrabold text-white ${
            reduced ? "" : "transition-transform active:scale-[0.99]"
          }`}
        >
          {t("ledger.logCta", lang)}
        </button>
      </div>
    </>
  );
}

function CostRow({
  lang,
  row,
  displayCurrency,
  onEditActual,
}: {
  lang: "en" | "ko";
  row: ReturnType<typeof categoryBreakdowns>[number];
  displayCurrency: string;
  onEditActual: (
    category: ExpenseCategory,
    input: { amountKrw: number; inputCurrency: string; inputAmount: number }
  ) => void;
}) {
  const meta = CATEGORY_META[row.category];
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setRaw(row.actual > 0 ? String(Math.round(row.actual)) : "");
    setEditing(true);
    // Focus after the input renders.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commit = () => {
    const amount = parseFloat(raw);
    // Actual edits are entered directly in KRW (display follows displayCurrency
    // only for the approx tail; the inline editor is the KRW source of truth).
    const krw = Number.isFinite(amount) && amount > 0 ? amount : 0;
    onEditActual(row.category, {
      amountKrw: krw,
      inputCurrency: "KRW",
      inputAmount: krw,
    });
    setEditing(false);
  };

  const approxTail = formatApprox(row.actual, displayCurrency);

  // ── Shared pieces (rendered in both the mobile stack and the sm: grid) ──
  // Expected estimate + "EST." badge.
  const expectedBlock = (
    <span className="whitespace-nowrap">
      <span className="text-sm tabular-nums text-slate-400">
        {formatKrw(row.estimate)}
      </span>
      <span className="ml-1.5 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold uppercase text-slate-400">
        {t("ledger.approxBadge", lang)}
      </span>
    </span>
  );

  const statusBlock = (
    <StatusText
      lang={lang}
      estimate={row.estimate}
      actual={row.actual}
      className="text-[10px] font-bold"
    />
  );

  // Actual value — inline editable (input when editing, tappable value otherwise).
  const actualEditor = editing ? (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={(e) => setRaw(e.target.value.replace(/[^\d.]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      aria-label={t(meta.labelKey, lang)}
      className="w-24 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-right text-sm font-extrabold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    />
  ) : (
    <button
      type="button"
      onClick={startEdit}
      className="min-h-[36px] rounded-lg px-1 text-right"
    >
      {row.actual > 0 ? (
        <span className="block">
          <span className="block text-sm font-extrabold text-ink tabular-nums">
            {formatKrw(row.actual)}
          </span>
          {approxTail && (
            <span className="block text-[11px] text-slate-400">{approxTail}</span>
          )}
        </span>
      ) : (
        <span className="text-sm text-slate-300 tabular-nums">{formatKrw(0)}</span>
      )}
    </button>
  );

  return (
    <li className="px-6 py-3.5">
      {/* ── Mobile (<sm): 2-line stack so the full category label always fits ── */}
      <div className="sm:hidden">
        {/* Line 1: [icon] label … actual */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-base"
          >
            {meta.icon}
          </span>
          <span className="min-w-0 flex-1 text-sm font-bold text-slate-900">
            {t(meta.labelKey, lang)}
          </span>
          <div className="shrink-0 text-right">{actualEditor}</div>
        </div>
        {/* Line 2: indented under the icon — Expected · status */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-11 text-left">
          {expectedBlock}
          <span aria-hidden="true" className="text-slate-300">·</span>
          {statusBlock}
        </div>
      </div>

      {/* ── sm: and up — original 3-column grid (labels don't truncate here) ── */}
      <div className="hidden items-center gap-x-3 sm:grid sm:grid-cols-[1fr_auto_auto]">
        {/* Category name + icon */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-base"
          >
            {meta.icon}
          </span>
          <span className="truncate text-sm font-bold text-slate-900">
            {t(meta.labelKey, lang)}
          </span>
        </div>

        {/* Expected (estimate) + est badge */}
        <div className="text-right">{expectedBlock}</div>

        {/* Actual — inline editable */}
        <div className="min-w-[5.5rem] text-right">
          {actualEditor}
          {!editing && <div className="mt-0.5">{statusBlock}</div>}
        </div>
      </div>
    </li>
  );
}

// ── (b) 1-Tap Log mode ──────────────────────────────────────────────────────
function LogMode({
  lang,
  breakdowns,
  actTotal,
  displayCurrency,
  reduced,
  onSave,
  onCancel,
}: {
  lang: "en" | "ko";
  breakdowns: ReturnType<typeof categoryBreakdowns>;
  actTotal: number;
  displayCurrency: string;
  reduced: boolean;
  onSave: (
    category: ExpenseCategory,
    input: { amountKrw: number; inputCurrency: string; inputAmount: number }
  ) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [cur, setCur] = useState<string>("KRW");
  const [raw, setRaw] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  const estimateForCat =
    breakdowns.find((b) => b.category === category)?.estimate ?? 0;

  const pickCategory = (c: ExpenseCategory) => {
    setCategory(c);
    requestAnimationFrame(() => amountRef.current?.focus());
  };

  const amount = parseFloat(raw);
  const valid = Number.isFinite(amount) && amount > 0;
  const krwPreview = valid ? toKrw(amount, cur) : 0;

  const save = () => {
    if (!valid) return;
    onSave(category, {
      amountKrw: toKrw(amount, cur),
      inputCurrency: cur,
      inputAmount: amount,
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
      <div className="flex-1 px-6 py-4">
        {/* Category grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {EXPENSE_CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => pickCategory(c)}
                aria-pressed={active}
                className={`grid aspect-square min-h-[44px] place-items-center gap-1 rounded-2xl bg-slate-50 text-center transition-colors ${
                  active ? "ring-2 ring-emerald-500" : "hover:bg-slate-100"
                }`}
              >
                <span aria-hidden="true" className="text-xl">
                  {CATEGORY_META[c].icon}
                </span>
                <span className="px-1 text-[10px] font-bold leading-tight text-slate-600">
                  {t(CATEGORY_META[c].labelKey, lang)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Amount input */}
        <div className="mt-5">
          <input
            ref={amountRef}
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
            placeholder={
              estimateForCat > 0
                ? String(Math.round(estimateForCat))
                : t("ledger.amountPlaceholder", lang)
            }
            aria-label={t("ledger.amountPlaceholder", lang)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-2xl font-extrabold text-ink placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
          {valid && cur !== "KRW" && (
            <p className="mt-1.5 text-right text-xs text-slate-400">
              {formatKrw(krwPreview)}
            </p>
          )}
        </div>

        {/* Currency chips */}
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Currency">
          {SUPPORTED_CURRENCIES.map((c) => {
            const active = c === cur;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCur(c)}
                aria-pressed={active}
                className={`min-h-[36px] rounded-xl px-3 text-xs font-bold transition-colors ${
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {currencySymbol(c)} {c}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
          {tf("ledger.rateLabel", lang, { date: FX_AS_OF })}
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {actTotal > 0 && (
          <p className="mb-2 text-center text-xs font-bold text-slate-500">
            {tf("ledger.todaySoFar", lang, {
              amt: formatWithApprox(actTotal, displayCurrency),
            })}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            {t("common.cancel", lang)}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid}
            className={`flex-1 rounded-2xl bg-ink py-3.5 font-extrabold text-white disabled:opacity-40 ${
              reduced ? "" : "transition-transform active:scale-[0.99]"
            }`}
          >
            {t("ledger.save", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
