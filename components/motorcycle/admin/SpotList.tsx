"use client";

/* ============================================================
 * K-Riders 스팟 어드민 — 목록 화면 (Phase 0 · 5단계).
 *   최신순(서버 정렬 유지) + region_sido/category/status 클라이언트 필터 칩.
 *   항목 탭 → 인라인 수정 폼(SpotForm 재사용, PATCH) + status 전환 버튼.
 *   시간 표시는 KST 고정(formatKst — Intl timeZone: Asia/Seoul).
 * ============================================================ */

import { useMemo, useState } from "react";
import type { Spot, SpotStatus } from "@/lib/motorcycle/spots/types";
import { SPOT_CATEGORIES, SPOT_STATUSES } from "@/lib/motorcycle/spots/constants";
import SpotForm from "./SpotForm";
import {
  formStateToRaw,
  formatKst,
  spotToFormState,
  spotsToExistingRefs,
} from "./spotFormModel";

/* status enum 값은 constants.ts 기준 — 여기 맵은 화면 표기 라벨만 담당. */
const STATUS_LABELS: Record<SpotStatus, string> = {
  draft: "초안",
  active: "공개",
  hidden: "숨김",
};
const STATUS_ACTION_LABELS: Record<SpotStatus, string> = {
  draft: "초안으로",
  active: "공개로",
  hidden: "숨김으로",
};
const STATUS_BADGE_CLASS: Record<SpotStatus, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  active: "bg-emerald-500/15 text-emerald-400",
  hidden: "bg-rose-500/15 text-rose-400",
};

function chipClass(selected: boolean): string {
  return `min-h-[40px] rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
    selected
      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
  }`;
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  label: string;
  options: readonly string[];
  value: string | null;
  onChange: (v: string | null) => void;
  renderLabel?: (v: string) => string;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`${label} 필터`}>
      <span className="w-16 shrink-0 text-xs font-semibold text-slate-400">{label}</span>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={chipClass(value === null)}
      >
        전체
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? null : opt)}
          aria-pressed={value === opt}
          className={chipClass(value === opt)}
        >
          {renderLabel ? renderLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
}

interface SpotListProps {
  spots: Spot[];
  token: string;
  onUpdated: (spot: Spot) => void;
  onUnauthorized: () => void;
}

export default function SpotList({ spots, token, onUpdated, onUnauthorized }: SpotListProps) {
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const regions = useMemo(
    () =>
      Array.from(new Set(spots.map((s) => s.region_sido))).sort((a, b) =>
        a.localeCompare(b, "ko")
      ),
    [spots]
  );
  const categories = useMemo(() => {
    const present = new Set(spots.map((s) => s.category));
    return SPOT_CATEGORIES.filter((c) => present.has(c));
  }, [spots]);

  const filtered = spots.filter(
    (s) =>
      (!regionFilter || s.region_sido === regionFilter) &&
      (!categoryFilter || s.category === categoryFilter) &&
      (!statusFilter || s.status === statusFilter)
  );

  const changeStatus = async (spot: Spot, status: SpotStatus) => {
    setStatusBusyId(spot.id);
    setActionError(null);
    try {
      // 같은 raw 프로토콜 재사용 — 현재 값 그대로에 status 만 바꿔 전송.
      const raw = formStateToRaw(spotToFormState({ ...spot, status }));
      const res = await fetch(`/api/admin/spots/${spot.id}`, {
        method: "PATCH",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const j = (await res.json().catch(() => null)) as {
        spot?: Spot;
        message?: string;
        reasons?: string[];
      } | null;
      if (!res.ok || !j?.spot) {
        setActionError(
          j?.reasons?.[0] ?? j?.message ?? "상태 전환에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
        return;
      }
      onUpdated(j.spot);
    } catch {
      setActionError("네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.");
    } finally {
      setStatusBusyId(null);
    }
  };

  if (spots.length === 0) {
    return (
      <div className="kr-card p-8 text-center text-sm text-slate-500">
        아직 등록된 스팟이 없어요. 등록 탭에서 첫 스팟을 추가해 보세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <FilterRow label="지역" options={regions} value={regionFilter} onChange={setRegionFilter} />
        <FilterRow
          label="카테고리"
          options={categories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <FilterRow
          label="상태"
          options={SPOT_STATUSES}
          value={statusFilter}
          onChange={setStatusFilter}
          renderLabel={(v) => STATUS_LABELS[v as SpotStatus]}
        />
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length}개 표시 · 시간은 한국 표준시(KST) 기준
      </p>

      <ul className="space-y-3">
        {filtered.map((spot) => {
          const expanded = expandedId === spot.id;
          return (
            <li key={spot.id} className="kr-card overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setExpandedId(expanded ? null : spot.id);
                  setActionError(null);
                }}
                aria-expanded={expanded}
                className="w-full px-4 py-3.5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">{spot.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {spot.category} · {spot.region_sido}
                      {spot.region_sigungu ? ` ${spot.region_sigungu}` : ""} · {spot.source}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE_CLASS[spot.status]}`}
                    >
                      {STATUS_LABELS[spot.status]}
                    </span>
                    {spot.verified && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                        실방문 검증
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  등록 {formatKst(spot.created_at)}
                  {spot.photos && spot.photos.length > 0 ? ` · 사진 ${spot.photos.length}장` : ""}
                </p>
              </button>

              {expanded && (
                <div className="space-y-4 border-t border-[var(--kr-line)] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">상태 전환</span>
                    {SPOT_STATUSES.filter((s) => s !== spot.status).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={statusBusyId === spot.id}
                        onClick={() => void changeStatus(spot, s)}
                        className="kr-btn-secondary min-h-[40px] px-4 text-xs disabled:opacity-50"
                      >
                        {statusBusyId === spot.id ? "변경 중…" : STATUS_ACTION_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {actionError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400"
                    >
                      {actionError}
                    </p>
                  )}

                  {/* updated_at 을 key 에 포함 — 상태 전환 등 외부 갱신 시 폼을 새 값으로 리셋 */}
                  <SpotForm
                    key={`${spot.id}-${spot.updated_at}`}
                    mode="edit"
                    token={token}
                    initial={spot}
                    existing={spotsToExistingRefs(spots, spot.id)}
                    onSaved={(saved) => {
                      setExpandedId(null);
                      onUpdated(saved);
                    }}
                    onUnauthorized={onUnauthorized}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
