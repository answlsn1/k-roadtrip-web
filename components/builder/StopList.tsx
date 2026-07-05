"use client";

import {
  DndContext,
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderStop } from "@/lib/types";
import { useBuilderStore } from "@/store/useBuilderStore";
import { typeMeta } from "@/lib/config/constants";
import { kmBetween, driveMin } from "@/lib/domain/geo";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

function SortableStop({
  stop,
  index,
  prev,
  onRemove,
}: {
  stop: BuilderStop;
  index: number;
  prev: BuilderStop | null;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.tempId });
  const meta = typeMeta(stop.type_tag);
  const km = prev ? kmBetween(prev, stop) : null;
  const lang = useLangStore((s) => s.lang);

  return (
    <div>
      {km !== null && (
        <div className="my-1 flex items-center gap-2 pl-[19px]">
          <span className="h-4 w-px bg-slate-300" />
          <span className="text-[11px] font-semibold text-slate-400">
            🚗 ≈ {km.toFixed(1)} km · {driveMin(km)} {t("builder.minSuffix", lang)}
          </span>
        </div>
      )}
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={`flex items-center gap-2.5 rounded-xl border px-2 py-2 ${
          isDragging
            ? "border-slate-300 bg-white shadow-lg"
            : "border-transparent bg-slate-50"
        }`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="grid h-9 w-9 shrink-0 cursor-grab touch-none place-items-center text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          aria-label={t("builder.dragReorder", lang)}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="7" cy="5" r="1.4" />
            <circle cx="13" cy="5" r="1.4" />
            <circle cx="7" cy="10" r="1.4" />
            <circle cx="13" cy="10" r="1.4" />
            <circle cx="7" cy="15" r="1.4" />
            <circle cx="13" cy="15" r="1.4" />
          </svg>
        </button>

        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white"
          style={{ background: meta.color }}
        >
          {index + 1}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900">
            {stop.name_en}
          </span>
          <span className="block truncate text-[11px] text-slate-400">
            {/* Pin stops: name_ko duplicates the title (same address), so show
                the exact coordinates instead — that's the useful detail here. */}
            {stop.source === "pin"
              ? `${stop.latitude.toFixed(5)}, ${stop.longitude.toFixed(5)}`
              : stop.name_ko}
            {stop.source === "curated" && (
              <span className="ml-1 text-emerald-600">· {t("builder.verified", lang)}</span>
            )}
            {stop.source === "pin" && (
              <span className="ml-1">· 📍 {t("builder.pinBadge", lang)}</span>
            )}
          </span>
        </span>

        <button
          onClick={() => onRemove(stop.tempId)}
          className="grid h-9 w-9 shrink-0 place-items-center text-slate-300 transition-colors hover:text-rose-400"
          aria-label={t("common.remove", lang)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function StopList() {
  const stops = useBuilderStore((s) => s.draft.stops);
  const reorderStops = useBuilderStore((s) => s.reorderStops);
  const removeStop = useBuilderStore((s) => s.removeStop);
  const lang = useLangStore((s) => s.lang);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex((s) => s.tempId === active.id);
    const newIndex = stops.findIndex((s) => s.tempId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderStops(arrayMove(stops, oldIndex, newIndex));
  };

  if (stops.length === 0) {
    return (
      <div className="mx-4 mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm font-bold text-slate-600">{t("builder.noStops", lang)}</p>
        <p className="text-xs leading-relaxed text-slate-400">
          {t("builder.noStopsHint", lang)}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={stops.map((s) => s.tempId)}
          strategy={verticalListSortingStrategy}
        >
          {stops.map((s, i) => (
            <SortableStop
              key={s.tempId}
              stop={s}
              index={i}
              prev={i > 0 ? stops[i - 1] : null}
              onRemove={removeStop}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
