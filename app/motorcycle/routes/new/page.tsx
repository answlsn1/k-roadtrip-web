"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { createRoute } from "@/lib/motorcycle/routes";
import { ROUTE_TYPES } from "@/lib/motorcycle/routeTypes";
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
  const [pendingStop, setPendingStop] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pendingName, setPendingName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  const handleMapClick = (lat: number, lng: number) => {
    setPendingStop({ latitude: lat, longitude: lng });
    setPendingName("");
  };

  const confirmPendingStop = () => {
    if (!pendingStop) return;
    setStops((prev) => [
      ...prev,
      {
        tempId: nextTempId(),
        name: pendingName.trim() || `장소 ${prev.length + 1}`,
        latitude: pendingStop.latitude,
        longitude: pendingStop.longitude,
      },
    ]);
    setPendingStop(null);
    setPendingName("");
  };

  const removeStop = (tempId: string) => {
    setStops((prev) => prev.filter((s) => s.tempId !== tempId));
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
              <ul className="space-y-2">
                {stops.map((s, i) => (
                  <li
                    key={s.tempId}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[var(--kr-bg)] px-3 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-extrabold text-ink">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-semibold text-white">{s.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStop(s.tempId)}
                      className="shrink-0 text-xs font-bold text-slate-400 hover:text-red-400"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
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
            <NewRouteMap stops={stops} onMapClick={handleMapClick} />
          </div>

          {pendingStop && (
            <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="mb-2 text-xs font-bold text-amber-400">
                새 경유지 이름을 입력해주세요
              </p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmPendingStop();
                    }
                  }}
                  placeholder="예: 미시령 휴게소"
                  maxLength={80}
                  className="kr-input min-w-0 flex-1 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={confirmPendingStop}
                  className="kr-btn-primary shrink-0 px-4 py-2 text-sm"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
