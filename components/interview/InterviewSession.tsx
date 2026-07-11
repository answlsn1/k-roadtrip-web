"use client";

/* ============================================================
 * 동행단 카페 인터뷰 — 같이 보는 세션(클라이언트 루트).
 *   구 "인터뷰어 혼자 읽는 대본"을 → "카페 테이블에서 폰 화면을
 *   같이 보며 진행하는 대화 가이드 + 구조화 기록"으로 전환.
 *
 *   단계: setup → welcome → warmup → spots → style → together → summary.
 *   - RouteBar(join.css 시그니처)로 5개 역 진행을 함께 본다.
 *   - 진행 중 세션은 변경마다 localStorage 에 자동 저장 →
 *     새로고침·중단 후에도 "이어서 하기"로 복구(데이터 유실 없음).
 *   - 상태 관리는 JoinFlow 와 같은 idiom(단일 상태 + patch + goStage).
 *   - 서버 기록·Supabase 호출 없음(어드민 로컬 전용).
 * ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  InterviewSessionData,
  InterviewStage,
  PatchInput,
} from "./interview.types";
import { EMPTY_SPOT, STATION_INDEX } from "./interview.types";
import {
  createEmptySession,
  loadSessions,
  removeSession,
  upsertSession,
} from "./storage";
import InterviewRouteBar from "./InterviewRouteBar";
import SetupStage from "./SetupStage";
import WelcomeStage from "./WelcomeStage";
import WarmupStage from "./WarmupStage";
import SpotsStage from "./SpotsStage";
import StyleStage from "./StyleStage";
import TogetherStage from "./TogetherStage";
import SummaryStage from "./SummaryStage";

/** 저장·이어하기 대상이 되는 "의미 있는 입력"이 있는지 — 빈 세션은 목록에 쌓지 않는다. */
function hasMeaningfulInput(s: InterviewSessionData): boolean {
  return (
    s.startedAt !== null ||
    s.name.trim() !== "" ||
    s.travelerTypeKey !== null ||
    s.metLocation.trim() !== ""
  );
}

export default function InterviewSession({ onLock }: { onLock: () => void }) {
  const [data, setData] = useState<InterviewSessionData>(() =>
    createEmptySession(),
  );
  const [saved, setSaved] = useState<InterviewSessionData[]>([]);
  const [resumable, setResumable] = useState<InterviewSessionData | null>(null);

  // ── 마운트: 저장된 세션 로드 + 미완료 세션 이어하기 제안 ──
  // 시작 전이라도 준비 입력이 담긴 세션이면 이어하기 대상(미리 채워두는 흐름).
  useEffect(() => {
    const all = loadSessions();
    setSaved(all);
    const unfinished = all.find(
      (s) => s.finishedAt === null && hasMeaningfulInput(s),
    );
    if (unfinished) setResumable(unfinished);
  }, []);

  // ── 자동 저장: 의미 있는 입력이 생기면 시작 전(준비 단계)에도 upsert ──
  // 카페에서 미리 채워 두는 사용 흐름에서 새로고침 유실을 막는다.
  useEffect(() => {
    if (!hasMeaningfulInput(data)) return;
    upsertSession(data);
    setSaved(loadSessions());
  }, [data]);

  // 객체/함수형 둘 다 허용 — 이전 값 파생 갱신(토글)은 함수형으로 받아
  // 같은 틱 연속 탭에서도 선택이 유실되지 않게 한다.
  const patch = useCallback((p: PatchInput) => {
    setData((prev) => ({ ...prev, ...(typeof p === "function" ? p(prev) : p) }));
  }, []);

  const scrollTop = useCallback(() => {
    // 화면 상단으로. 부드러운 스크롤도 모션 — reduced-motion 은 즉시 이동.
    try {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const goStage = useCallback(
    (next: InterviewStage) => {
      setData((prev) => ({
        ...prev,
        stage: next,
        // summary 도달 = 세션 완료 확정(새로고침 시 이어하기 대상 제외).
        // summary 에서 뒤로 나가면 다시 진행 중으로 되돌린다.
        finishedAt:
          next === "summary"
            ? prev.finishedAt ?? new Date().toISOString()
            : null,
      }));
      scrollTop();
    },
    [scrollTop],
  );

  // 준비 완료 → 같이 보기 시작(재진입 시 startedAt 은 유지).
  const startSession = useCallback(() => {
    setData((prev) => ({
      ...prev,
      startedAt: prev.startedAt ?? new Date().toISOString(),
      stage: "welcome",
    }));
    setResumable(null); // 새 세션을 시작했으면 이어하기 제안은 접는다
    scrollTop();
  }, [scrollTop]);

  const resumeSession = useCallback(() => {
    if (!resumable) return;
    setData(resumable);
    setResumable(null);
    scrollTop();
  }, [resumable, scrollTop]);

  const deleteSession = useCallback((id: string) => {
    removeSession(id);
    setSaved(loadSessions());
    setResumable((r) => (r && r.id === id ? null : r));
  }, []);

  // 요약에서 "새 세션 시작" — 방금 세션은 자동 저장으로 이미 확정됨.
  const resetToSetup = useCallback(() => {
    setData(createEmptySession());
    setSaved(loadSessions());
    scrollTop();
  }, [scrollTop]);

  // ── 스팟 수집기 ──
  // 초안(spotDraft)도 세션 데이터에 실어 자동 저장 — 입력 중 새로고침에도 복구.
  const addSpot = useCallback(() => {
    setData((prev) => {
      const draft = prev.spotDraft ?? EMPTY_SPOT;
      const place = draft.place.trim();
      if (!place) return prev;
      return {
        ...prev,
        spots: [...prev.spots, { ...draft, place }],
        spotDraft: EMPTY_SPOT,
      };
    });
  }, []);

  const removeSpot = useCallback((index: number) => {
    setData((prev) => {
      const spots = prev.spots.filter((_, i) => i !== index);
      // 최애 픽 인덱스 보정 — 삭제된 스팟이면 해제, 앞이 빠지면 한 칸 당김.
      let top = prev.topPickIndex;
      if (top !== null) {
        if (top === index) top = null;
        else if (top > index) top -= 1;
      }
      return { ...prev, spots, topPickIndex: top };
    });
  }, []);

  // ── 포커스 이동(a11y) — JoinFlow 와 동일 idiom ──
  // 단계 전환 시 새 화면의 제목으로 포커스를 옮겨 스크린리더가 변화를
  // 인지하게 한다. 최초 진입에서는 포커스를 가로채지 않는다.
  const screenRef = useRef<HTMLDivElement>(null);
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const root = screenRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>("h1, h2") ?? root;
    target.setAttribute("tabindex", "-1");
    try {
      target.focus({ preventScroll: true });
    } catch {
      /* 포커스 실패는 무시 — UX 를 막지 않는다 */
    }
  }, [data.stage]);

  const stationIndex = STATION_INDEX[data.stage];

  return (
    <div className="join-container">
      {/* 어드민 상단 바 — 조용한 브랜드 라벨 + 잠그기 */}
      <div className="iv-topbar">
        <span className="iv-brand">k—roadtrip · 동행단 인터뷰</span>
        <button type="button" className="iv-lock" onClick={onLock}>
          잠그기
        </button>
      </div>

      {stationIndex !== undefined && (
        <InterviewRouteBar current={stationIndex} />
      )}

      {/* key 변경으로 단계 전환마다 slideIn 재생(reduced-motion 은 css 에서 off) */}
      <div className="join-screen" key={data.stage} ref={screenRef}>
        {data.stage === "setup" && (
          <SetupStage
            data={data}
            patch={patch}
            onStart={startSession}
            saved={saved.filter((s) => s.id !== data.id)}
            onDelete={deleteSession}
            resumable={resumable}
            onResume={resumeSession}
            onDismissResume={() => setResumable(null)}
          />
        )}

        {data.stage === "welcome" && (
          <WelcomeStage
            data={data}
            patch={patch}
            onNext={() => goStage("warmup")}
            onBack={() => goStage("setup")}
          />
        )}

        {data.stage === "warmup" && (
          <WarmupStage
            data={data}
            patch={patch}
            onNext={() => goStage("spots")}
            onBack={() => goStage("welcome")}
          />
        )}

        {data.stage === "spots" && (
          <SpotsStage
            data={data}
            onNext={() => goStage("style")}
            onBack={() => goStage("warmup")}
            draft={data.spotDraft ?? EMPTY_SPOT}
            // 부분 갱신 + 함수형 — 초안도 patch 와 같은 이유로 이전 값에서 파생한다.
            onDraft={(d) =>
              patch((prev) => ({
                spotDraft: { ...(prev.spotDraft ?? EMPTY_SPOT), ...d },
              }))
            }
            onAdd={addSpot}
            onRemove={removeSpot}
          />
        )}

        {data.stage === "style" && (
          <StyleStage
            data={data}
            patch={patch}
            onNext={() => goStage("together")}
            onBack={() => goStage("spots")}
          />
        )}

        {data.stage === "together" && (
          <TogetherStage
            data={data}
            patch={patch}
            onNext={() => goStage("summary")}
            onBack={() => goStage("style")}
          />
        )}

        {data.stage === "summary" && (
          <SummaryStage
            data={data}
            onBack={() => goStage("together")}
            onReset={resetToSetup}
          />
        )}
      </div>
    </div>
  );
}
