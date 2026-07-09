"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { createRoute } from "@/lib/motorcycle/routes";
import { ROUTE_TYPES } from "@/lib/motorcycle/routeTypes";
import { straightKm, estimateRideMin, formatDurationKo } from "@/lib/motorcycle/rideEstimate";
import type { DraftStop } from "@/components/motorcycle/NewRouteMap";

const NewRouteMap = dynamic(() => import("@/components/motorcycle/NewRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
      지도를 불러오는 중…
    </div>
  ),
});

let tempIdCounter = 0;
function nextTempId() {
  tempIdCounter += 1;
  return `stop-${tempIdCounter}`;
}

/* 저장 로직(lib/motorcycle/routes.ts totalDistanceKm)과 동일 기준의 합계 —
 * 직선거리 합을 0.1km 로 반올림. 등록 전 미리보기가 저장값과 일치해야 한다. */
function draftTotalKm(stops: DraftStop[]): number {
  let sum = 0;
  for (let i = 1; i < stops.length; i++) sum += straightKm(stops[i - 1], stops[i]);
  return Math.round(sum * 10) / 10;
}

function SortableStopItem({
  stop,
  index,
  prev,
  onRemove,
}: {
  stop: DraftStop;
  index: number;
  prev: DraftStop | null;
  onRemove: (tempId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.tempId });
  const segKm = prev ? straightKm(prev, stop) : null;

  return (
    <li>
      {segKm !== null && (
        <div className="my-1 flex items-center gap-2 pl-[22px]">
          <span className="h-4 w-px bg-white/15" />
          <span className="text-[11px] font-semibold text-slate-400">
            🏍 ≈ {segKm.toFixed(1)}km · {formatDurationKo(estimateRideMin(segKm))}
          </span>
        </div>
      )}
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={`flex items-center gap-2 rounded-xl border px-2 py-2 ${
          isDragging
            ? "border-amber-500/40 bg-[var(--kr-surface-2)] shadow-lg"
            : "border-transparent bg-[var(--kr-bg)]"
        }`}
      >
        {/* 드래그 핸들 — 터치 타깃 40px 이상(WCAG 2.5.8) */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="grid h-10 w-10 shrink-0 cursor-grab touch-none place-items-center text-slate-500 hover:text-slate-300 active:cursor-grabbing"
          aria-label={`${stop.name} 순서 변경`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="7" cy="5" r="1.4" />
            <circle cx="13" cy="5" r="1.4" />
            <circle cx="7" cy="10" r="1.4" />
            <circle cx="13" cy="10" r="1.4" />
            <circle cx="7" cy="15" r="1.4" />
            <circle cx="13" cy="15" r="1.4" />
          </svg>
        </button>

        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-extrabold text-ink">
          {index + 1}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{stop.name}</span>
          <span className="block truncate text-[10px] tabular-nums text-slate-500">
            {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
          </span>
        </span>

        <button
          type="button"
          onClick={() => onRemove(stop.tempId)}
          aria-label={`${stop.name} 삭제`}
          className="-my-1 grid min-h-[40px] shrink-0 place-items-center px-2.5 text-xs font-bold text-slate-400 hover:text-red-400"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

export default function NewMotorcycleRoutePage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useMotorcycleSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [routeType, setRouteType] = useState<string | null>(null);
  const [motoSafe, setMotoSafe] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [stops, setStops] = useState<DraftStop[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    // 키보드 재정렬 — 핸들에 dnd-kit aria 안내가 나가는 이상 실제로 동작해야 한다.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  // 지도 팝업에서 확정된 경유지 — 이름 폴백은 NewRouteMap 쪽에서 처리된다.
  const handleAddStop = (name: string, lat: number, lng: number) => {
    setStops((prev) => [
      ...prev,
      { tempId: nextTempId(), name, latitude: lat, longitude: lng },
    ]);
  };

  const removeStop = (tempId: string) => {
    setStops((prev) => prev.filter((s) => s.tempId !== tempId));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setStops((prev) => {
      const oldIndex = prev.findIndex((s) => s.tempId === active.id);
      const newIndex = prev.findIndex((s) => s.tempId === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const totalKm = stops.length >= 2 ? draftTotalKm(stops) : 0;

  // dnd-kit 스크린리더 안내 한국어화 — 기본 안내는 영어라 한국어 UI 와 불일치.
  const stopName = (id: unknown) =>
    stops.find((s) => s.tempId === id)?.name ?? "경유지";
  const dndAccessibility = {
    screenReaderInstructions: {
      draggable:
        "스페이스바를 눌러 경유지를 들어 올리고, 화살표 키로 이동한 뒤 스페이스바로 놓으세요. 취소하려면 Esc 키를 누르세요.",
    },
    announcements: {
      onDragStart: ({ active }: { active: { id: unknown } }) =>
        `${stopName(active.id)}을(를) 들어 올렸어요.`,
      onDragOver: ({ active, over }: { active: { id: unknown }; over: { id: unknown } | null }) =>
        over ? `${stopName(active.id)}을(를) ${stopName(over.id)} 위치로 이동 중이에요.` : undefined,
      onDragEnd: ({ active, over }: { active: { id: unknown }; over: { id: unknown } | null }) =>
        over
          ? `${stopName(active.id)}을(를) ${stopName(over.id)} 위치에 놓았어요.`
          : `${stopName(active.id)} 이동을 취소했어요.`,
      onDragCancel: ({ active }: { active: { id: unknown } }) =>
        `${stopName(active.id)} 이동을 취소했어요.`,
    },
  };

  const canSubmit = title.trim().length > 0 && stops.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await createRoute({
      title: title.trim(),
      description: description.trim() || null,
      region: region.trim() || null,
      isPublic,
      routeType,
      motoSafe: motoSafe ? true : null, // OFF = 미확인(null) — false 로 저장하지 않는다.
      stops: stops.map((s) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude })),
    });

    setSubmitting(false);

    if (!result.ok) {
      console.error("createRoute error:", result.error);
      setError("루트 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    router.push(`/motorcycle/routes/${result.id}`);
  };

  if (loading || !isLoggedIn) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          새 루트 등록
        </p>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          오늘 달린 길을 기록해보세요
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="order-2 space-y-5 lg:order-1">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-300">
              제목
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 강원도 미시령 야간 라이딩"
              maxLength={80}
              className="kr-input px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="region" className="mb-1.5 block text-sm font-semibold text-slate-300">
              지역 (선택)
            </label>
            <input
              id="region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 강원도"
              maxLength={80}
              className="kr-input px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-300">
              설명 (선택)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="어떤 길이었는지, 도로 상태나 추천 포인트를 남겨주세요"
              maxLength={500}
              rows={4}
              className="kr-input resize-none px-4 py-3 text-sm"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-slate-300">루트 유형 (선택)</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="루트 유형">
              {ROUTE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRouteType(routeType === t.value ? null : t.value)}
                  aria-pressed={routeType === t.value}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    routeType === t.value
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMotoSafe((v) => !v)}
            aria-pressed={motoSafe}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--kr-line-strong)] bg-white/5 px-4 py-3.5 text-left"
          >
            <span>
              <span className="block text-sm font-bold text-white">🛵 이륜차 안전 경로</span>
              <span className="block text-xs text-slate-400">
                자동차전용도로·고속도로를 지나지 않는 루트예요
              </span>
            </span>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                motoSafe ? "bg-amber-500" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                  motoSafe ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublic((v) => !v)}
            aria-pressed={isPublic}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--kr-line-strong)] bg-white/5 px-4 py-3.5 text-left"
          >
            <span>
              <span className="block text-sm font-bold text-white">다른 라이더에게 공개</span>
              <span className="block text-xs text-slate-400">
                {isPublic ? "누구나 이 루트를 볼 수 있어요" : "나만 볼 수 있어요"}
              </span>
            </span>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                isPublic ? "bg-amber-500" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <div className="kr-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">경유지 ({stops.length}개)</h2>
              {stops.length < 2 && (
                <span className="text-xs font-semibold text-amber-400">
                  장소를 2개 이상 추가하세요
                </span>
              )}
            </div>

            {stops.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                지도를 클릭해서 경유지를 추가해보세요
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
                accessibility={dndAccessibility}
              >
                <SortableContext
                  items={stops.map((s) => s.tempId)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul>
                    {stops.map((s, i) => (
                      <SortableStopItem
                        key={s.tempId}
                        stop={s}
                        index={i}
                        prev={i > 0 ? stops[i - 1] : null}
                        onRemove={removeStop}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}

            {stops.length >= 2 && (
              <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-400">
                🏍 총 {totalKm}km · 예상 {formatDurationKo(estimateRideMin(totalKm))}
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="kr-btn-primary w-full py-3.5 text-sm"
          >
            {submitting ? "등록하는 중…" : canSubmit ? "루트 등록하기" : "장소를 2개 이상 추가하세요"}
          </button>
        </div>

        <div className="order-1 lg:order-2">
          <div className="krider-map-dark relative h-[320px] overflow-hidden rounded-2xl border border-[var(--kr-line-strong)] sm:h-[420px] lg:sticky lg:top-20 lg:h-[560px]">
            <NewRouteMap stops={stops} onAddStop={handleAddStop} />
          </div>
        </div>
      </form>
    </div>
  );
}
