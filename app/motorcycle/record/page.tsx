"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { createRoute } from "@/lib/motorcycle/routes";
import { ROUTE_TYPES } from "@/lib/motorcycle/routeTypes";

const RecordMap = dynamic(() => import("@/components/motorcycle/RecordMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
      지도를 불러오는 중…
    </div>
  ),
});

/** 이 거리(m) 이상 움직였을 때만 포인트를 쌓는다 — GPS 지터로 인한 거리 부풀림 방지. */
const MIN_MOVE_M = 15;

function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

type Phase = "idle" | "recording" | "finished";

export default function MotorcycleRecordPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useMotorcycleSession();

  const [phase, setPhase] = useState<Phase>("idle");
  const [points, setPoints] = useState<[number, number][]>([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [idleNotice, setIdleNotice] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [region, setRegion] = useState("");
  const [routeType, setRouteType] = useState<string | null>(null);
  const [motoSafe, setMotoSafe] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 수집의 진실은 ref — state 는 렌더용 미러(수락된 포인트에서만 갱신).
  const pointsRef = useRef<[number, number][]>([]);
  const watchIdRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  // 언마운트 시 GPS 감시 해제 — 페이지 이탈 후에도 위치 추적이 남지 않게.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const timer = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const distanceKm = useMemo(() => {
    let m = 0;
    for (let i = 1; i < points.length; i++) m += haversineM(points[i - 1], points[i]);
    return m / 1000;
  }, [points]);

  const stopWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startRecording = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError("이 브라우저는 위치 정보를 지원하지 않아요. 다른 브라우저에서 시도해주세요.");
      return;
    }
    setGeoError(null);
    setIdleNotice(null);
    pointsRef.current = [];
    setPoints([]);
    setElapsedSec(0);
    startedAtRef.current = Date.now();
    setPhase("recording");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const last = pointsRef.current[pointsRef.current.length - 1];
        if (last && haversineM(last, pt) < MIN_MOVE_M) return;
        pointsRef.current = [...pointsRef.current, pt];
        setPoints(pointsRef.current);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          stopWatch();
          setPhase("idle");
          setGeoError(
            "위치 권한이 거부되어 기록할 수 없어요. 브라우저 설정에서 이 사이트의 위치 권한을 허용한 뒤 다시 시도해주세요."
          );
        }
        // POSITION_UNAVAILABLE / TIMEOUT 은 터널 등에서 일시적으로 발생 — 기록은 유지한다.
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const finishRecording = () => {
    stopWatch();
    if (pointsRef.current.length < 2) {
      pointsRef.current = [];
      setPoints([]);
      setElapsedSec(0);
      setPhase("idle");
      setIdleNotice("기록된 이동이 없어요. 이동이 감지되면 경로가 자동으로 쌓여요.");
      return;
    }
    setPhase("finished");
  };

  const discardRecording = () => {
    if (!window.confirm("이 주행 기록을 버릴까요? 되돌릴 수 없어요.")) return;
    pointsRef.current = [];
    setPoints([]);
    setElapsedSec(0);
    setTitle("");
    setRegion("");
    setRouteType(null);
    setMotoSafe(false);
    setIsPublic(true);
    setSaveError(null);
    setPhase("idle");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = pointsRef.current;
    if (pts.length < 2 || !title.trim() || submitting) return;

    setSubmitting(true);
    setSaveError(null);

    const first = pts[0];
    const last = pts[pts.length - 1];
    const result = await createRoute({
      title: title.trim(),
      region: region.trim() || null,
      isPublic,
      routeType,
      motoSafe: motoSafe ? true : null, // OFF = 미확인(null) — false 로 저장하지 않는다.
      durationMin: Math.max(1, Math.round(elapsedSec / 60)),
      trackPoints: pts,
      stops: [
        { name: "출발 지점", latitude: first[0], longitude: first[1] },
        { name: "도착 지점", latitude: last[0], longitude: last[1] },
      ],
    });

    setSubmitting(false);

    if (!result.ok) {
      console.error("createRoute error:", result.error);
      setSaveError("루트 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    router.push(`/motorcycle/routes/${result.id}`);
  };

  if (loading || !isLoggedIn) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          주행 기록
        </p>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          GPS로 실제 달린 길을 기록해보세요
        </h1>
      </div>

      {phase === "idle" && (
        <div className="space-y-5">
          {geoError && (
            <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
              {geoError}
            </div>
          )}
          {idleNotice && (
            <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400">
              {idleNotice}
            </div>
          )}

          <button
            type="button"
            onClick={startRecording}
            className="kr-btn-primary w-full py-5 text-lg"
          >
            주행 기록 시작
          </button>

          <div className="kr-card p-5 text-sm leading-relaxed text-slate-400">
            <p className="mb-1.5 font-bold text-slate-300">시작 전에 알아두세요</p>
            <p>
              웹 브라우저 특성상 화면이 꺼지면 기록이 끊길 수 있어요. 주행 중에는 거치대에
              화면이 켜진 상태로 두세요.
            </p>
            <p className="mt-1.5">
              GPS를 계속 사용해서 배터리 소모가 커요. 장거리 주행이라면 충전 케이블을
              연결해두는 걸 추천해요.
            </p>
          </div>
        </div>
      )}

      {phase === "recording" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-bold text-red-400">기록 중</span>
            {points.length === 0 && (
              <span className="text-xs font-semibold text-slate-500">
                GPS 신호를 기다리는 중…
              </span>
            )}
          </div>

          <div className="krider-map-dark relative h-[320px] overflow-hidden rounded-2xl border border-[var(--kr-line-strong)] sm:h-[400px]">
            <RecordMap points={points} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="kr-card p-4 text-center">
              <p className="text-xs font-bold text-slate-500">시간</p>
              <p className="mt-1 text-xl font-extrabold text-white">{formatElapsed(elapsedSec)}</p>
            </div>
            <div className="kr-card p-4 text-center">
              <p className="text-xs font-bold text-slate-500">거리</p>
              <p className="mt-1 text-xl font-extrabold text-white">
                {distanceKm.toFixed(1)}
                <span className="ml-0.5 text-sm font-bold text-slate-400">km</span>
              </p>
            </div>
            <div className="kr-card p-4 text-center">
              <p className="text-xs font-bold text-slate-500">포인트</p>
              <p className="mt-1 text-xl font-extrabold text-white">{points.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={finishRecording}
            className="w-full rounded-2xl border-2 border-red-500/60 bg-red-500/10 py-4 text-base font-extrabold text-red-400 transition-colors hover:bg-red-500/20 active:scale-[0.99]"
          >
            기록 종료
          </button>
        </div>
      )}

      {phase === "finished" && (
        <div className="space-y-6">
          <div className="krider-map-dark relative h-[240px] overflow-hidden rounded-2xl border border-[var(--kr-line-strong)] sm:h-[320px]">
            <RecordMap points={points} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="kr-card !border-amber-500/40 !bg-amber-500/10 p-4 text-center">
              <p className="text-xs font-bold text-amber-400">총 거리</p>
              <p className="mt-1 text-xl font-extrabold text-white">
                {distanceKm.toFixed(1)}
                <span className="ml-0.5 text-sm font-bold text-slate-400">km</span>
              </p>
            </div>
            <div className="kr-card !border-amber-500/40 !bg-amber-500/10 p-4 text-center">
              <p className="text-xs font-bold text-amber-400">총 시간</p>
              <p className="mt-1 text-xl font-extrabold text-white">{formatElapsed(elapsedSec)}</p>
            </div>
            <div className="kr-card !border-amber-500/40 !bg-amber-500/10 p-4 text-center">
              <p className="text-xs font-bold text-amber-400">포인트</p>
              <p className="mt-1 text-xl font-extrabold text-white">{points.length}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
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
                placeholder="예: 북악스카이웨이 아침 주행"
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
                placeholder="예: 서울"
                maxLength={80}
                className="kr-input px-4 py-3 text-sm"
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

            {saveError && (
              <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                {saveError}
              </div>
            )}

            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="kr-btn-primary w-full py-3.5 text-sm"
            >
              {submitting ? "저장하는 중…" : "루트로 저장"}
            </button>

            <button
              type="button"
              onClick={discardRecording}
              className="kr-btn-secondary w-full py-3 text-sm"
            >
              버리기
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
