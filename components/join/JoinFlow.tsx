"use client";

/* ============================================================
 * 동행단 초대(Join Companion) — Phase 2 상태머신 (클라이언트 루트)
 *   hero → quiz(4스텝) → ticket → why → join → done.
 *   - step 전환 시 상단 스크롤 + key 변경으로 slideIn 재생.
 *   - quiz 답·연락처·옵트인 상태 보유(JoinAnswers).
 *   - 제출 시 submitJoin 호출(세션ID = localStorage 'krt-session' 재사용).
 *   - error 는 코드값 → 사용자에겐 일반 메시지로 매핑(코드 노출 금지).
 *
 *   variant="offline"(/join, 기본값) — 길거리 인터뷰 대상, 카페 만남 기본 ON.
 *   variant="online"(/recommend)   — 홈페이지에서 바로 오는 온라인 방문자용,
 *   카페 만남은 완전 선택사항(기본 OFF)이고 config 도 recommendConfig 를 쓴다.
 *   두 화면 모두 같은 컴포넌트/로직을 재사용 — 텍스트만 variant/config 로 분기.
 * ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitJoin } from "@/app/actions/submit-join";
import { trackEvent, type AppEventType } from "@/lib/analytics/events";
import {
  formatTravelTypeForStorage,
  getTravelerType,
  type MbtiCode,
} from "@/lib/join/constants";
import { buildQuizSteps, scoreMbti, scoreTravel } from "@/lib/join/quiz";
import { joinConfig, recommendConfig } from "@/lib/join/config";
import type { Stage, QuizStepIndex, JoinAnswers } from "./join.flow.types";
import RouteBar from "./RouteBar";
import Hero from "./Hero";
import QuizStep from "./QuizStep";
import Ticket from "./Ticket";
import Why from "./Why";
import JoinForm from "./JoinForm";
import Done from "./Done";

const SESSION_STORAGE_KEY = "krt-session";

function initialAnswers(variant: "offline" | "online"): JoinAnswers {
  return {
    mbti: null,
    mbtiUnknown: false,
    mbtiPicks: {},
    plan: null,
    spotPref: null,
    pace: null,
    focus: null,
    travelPicks: {},
    recRegion: null,
    recSpot: "",
    pain: null,
    painText: "",
    name: "",
    contactType: "카톡",
    contact: "",
    word: "",
    // offline: 1차 카페 만남이 기본 전제라 기본 ON(끌 수도 있음).
    // online: 만남은 완전 선택사항이라 기본 OFF(원하면 직접 켬).
    wantInterview: variant === "offline",
    // ⚠️ 2차(프로토타입)는 어느 쪽도 비노출 — 운영자가 1차 만남 후 따로 관리.
    wantPrototype: false,
  };
}

/** localStorage 'krt-session' 재사용(없으면 randomUUID 생성·저장) — lib/analytics 와 동일 방식. */
function getSessionId(): string | null {
  try {
    let k = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!k) {
      k =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem(SESSION_STORAGE_KEY, k);
    }
    return k;
  } catch {
    return null;
  }
}

const GENERIC_ERROR =
  "앗, 전송이 잘 안 됐어요. 잠시 후 다시 시도해 주세요. (입력은 그대로 남아 있어요)";

/** RouteBar 현재 역 인덱스: 출발·나 알기·탑승권·함께·탑승. */
function routeIndex(stage: Stage, isCollectStep: boolean): number {
  switch (stage) {
    case "quiz":
      // 출발(0) = MBTI·성향 문항, 나 알기(1) = 추천/불편 수집 스텝.
      return isCollectStep ? 1 : 0;
    case "ticket":
      return 2;
    case "why":
      return 3;
    case "join":
    case "done":
      return 4;
    default:
      return 0;
  }
}

export default function JoinFlow({
  initialCount,
  source,
  variant = "offline",
}: {
  initialCount: number;
  source: string | null;
  variant?: "offline" | "online";
}) {
  const config = variant === "online" ? recommendConfig : joinConfig;
  const [stage, setStage] = useState<Stage>("hero");
  /** 0-based 인덱스 into steps(아래 useMemo). */
  const [quizStep, setQuizStep] = useState<QuizStepIndex>(0);
  const [answers, setAnswers] = useState<JoinAnswers>(() => initialAnswers(variant));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // 스텝 구성은 "MBTI 를 모른다" 를 골랐는지에 따라 달라진다(추정 4문항 삽입).
  // 인덱스 산술 대신 목록을 만들어 쓴다 — 경계 계산 실수가 안 나게.
  const steps = useMemo(
    () => buildQuizSteps(answers.mbtiUnknown),
    [answers.mbtiUnknown],
  );
  // 목록이 줄어드는 순간(모름→직접선택 변경)에도 인덱스가 넘치지 않게 clamp.
  const stepIndex = Math.min(quizStep, steps.length - 1);
  const currentStep = steps[stepIndex];
  const isCollectStep =
    currentStep.kind === "rec" || currentStep.kind === "pain";

  // ── 퍼널 계측(Phase 4a) ──
  // 각 이벤트는 정확히 1번만 발화. useRef 기반 "발화 완료" 집합으로
  // StrictMode 이중 호출·재마운트·재렌더에 모두 안전(중복 발화 가드).
  // join_submit 은 여기서 발화하지 않는다 — 성공 insert 시 Server Action 이
  // 서버에서 1회 기록한다(실패 제출은 세지 않기 위함).
  const firedRef = useRef<Set<AppEventType>>(new Set());
  const fireOnce = useCallback(
    (type: AppEventType, payload?: { region?: string }) => {
      if (firedRef.current.has(type)) return;
      firedRef.current.add(type);
      trackEvent(type, payload); // trackEvent 는 절대 throw/블로킹하지 않음
    },
    [],
  );

  // stage 가 각 화면에 도달하는 순간 해당 view 이벤트를 1회 발화.
  // ticket 도달 = quiz 4스텝 완료를 함의 → quiz_complete 도 여기서 1회.
  useEffect(() => {
    switch (stage) {
      case "hero":
        // 세션 출처 귀속용: source 를 region 슬롯에 인코딩(없으면 미첨부).
        fireOnce("join_view", source ? { region: source } : undefined);
        break;
      case "quiz":
        fireOnce("join_quiz_start");
        break;
      case "ticket":
        fireOnce("join_quiz_complete");
        fireOnce("join_ticket_view");
        break;
      case "why":
        fireOnce("join_why_view");
        break;
      default:
        break;
    }
  }, [stage, source, fireOnce]);

  const scrollTop = useCallback(() => {
    // 화면 상단으로. 부드러운 스크롤도 모션이므로 reduced-motion 사용자는 즉시 이동.
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
    (next: Stage) => {
      setStage(next);
      scrollTop();
    },
    [scrollTop],
  );

  const patch = useCallback((p: Partial<JoinAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...p }));
  }, []);

  /**
   * MBTI 직접 선택. code=null 이면 "잘 모르겠어요" → 추정 문항이 끼어든다.
   * 어느 쪽이든 바로 다음 스텝(index 1)으로 — 스텝 목록이 이 선택으로
   * 바뀌므로 s+1 이 아니라 1 로 고정해야 목록과 인덱스가 어긋나지 않는다.
   */
  const pickMbti = useCallback(
    (code: MbtiCode | null) => {
      setAnswers((prev) => ({
        ...prev,
        mbti: code,
        mbtiUnknown: code === null,
        // 직접 고른 순간 추정 문항 답은 의미가 없어지므로 비운다
        // (남겨두면 나중에 "모름"으로 되돌렸을 때 옛 답이 되살아난다).
        mbtiPicks: code === null ? prev.mbtiPicks : {},
      }));
      setQuizStep(1);
      scrollTop();
    },
    [scrollTop],
  );

  /** MBTI 추정 문항: 선택 즉시 자동 진행. 매번 다시 채점해 덮어쓴다. */
  const pickMbtiAnswer = useCallback(
    (questionIndex: number, value: string) => {
      setAnswers((prev) => {
        const mbtiPicks = { ...prev.mbtiPicks, [questionIndex]: value };
        return { ...prev, mbtiPicks, mbti: scoreMbti(mbtiPicks) };
      });
      setQuizStep((s) => s + 1);
      scrollTop();
    },
    [scrollTop],
  );

  /** 여행 성향 문항: 선택 즉시 자동 진행. 매번 다시 채점해 덮어쓴다
   *  (뒤로 가서 답을 바꿔도 결과가 항상 현재 선택과 일치하도록). */
  const pickTravel = useCallback(
    (questionIndex: number, value: string) => {
      setAnswers((prev) => {
        const travelPicks = { ...prev.travelPicks, [questionIndex]: value };
        return { ...prev, travelPicks, ...scoreTravel(travelPicks) };
      });
      setQuizStep((s) => s + 1);
      scrollTop();
    },
    [scrollTop],
  );

  const quizNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      goStage("ticket");
      return;
    }
    setQuizStep(stepIndex + 1);
    scrollTop();
  }, [stepIndex, steps.length, goStage, scrollTop]);

  const quizBack = useCallback(() => {
    if (stepIndex === 0) {
      goStage("hero");
      return;
    }
    setQuizStep(stepIndex - 1);
    scrollTop();
  }, [stepIndex, goStage, scrollTop]);

  const handleSubmit = useCallback(
    async (company: string) => {
      setSubmitting(true);
      setErrorMessage(null);

      // 형식: 'ENFP · 즉흥 감성 유랑러 (여유·미식)'
      // plan/spot_pref 는 전용 컬럼에 따로 들어가지만 MBTI·pace·focus 는
      // 컬럼이 없어서 이 문자열이 유일한 보존 경로다.
      const travelType = formatTravelTypeForStorage(
        getTravelerType(answers.mbti),
        answers.pace,
        answers.focus,
      );

      const res = await submitJoin({
        name: answers.name,
        contactType: answers.contactType,
        contact: answers.contact,
        wantInterview: answers.wantInterview,
        wantPrototype: answers.wantPrototype,
        word: answers.word || null,
        travelType,
        plan: answers.plan,
        spotPref: answers.spotPref,
        recRegion: answers.recRegion,
        recSpot: answers.recSpot || null,
        pain: answers.pain,
        painText: answers.painText || null,
        source,
        sessionId: getSessionId(),
        company,
      });

      setSubmitting(false);

      if (res.ok) {
        goStage("done");
      } else {
        // error 는 코드값 → 사용자에겐 일반 메시지만(입력값은 유지).
        setErrorMessage(GENERIC_ERROR);
      }
    },
    [answers, source, goStage],
  );

  const showRouteBar =
    stage === "quiz" ||
    stage === "ticket" ||
    stage === "why" ||
    stage === "join";

  // key: 화면/스텝 전환마다 바뀌어 slideIn 을 재생.
  const screenKey = stage === "quiz" ? `quiz-${stepIndex}` : stage;

  // ── 포커스 이동(a11y) ──
  // 화면/스텝 전환 시 새 화면의 제목(heading)으로 포커스를 옮겨
  // 스크린리더 사용자가 변화를 인지하게 한다. 최초 진입(hero)에서는
  // 포커스를 가로채지 않는다(초기 로드 포커스 탈취는 안티패턴).
  const screenRef = useRef<HTMLDivElement>(null);
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const root = screenRef.current;
    if (!root) return;
    // 제목 우선, 없으면 화면 컨테이너(ticket 처럼 heading 이 없는 경우) 사용.
    // heading/컨테이너는 기본 비포커스 → 프로그램적 포커스를 위해 tabindex=-1 부여.
    const target = root.querySelector<HTMLElement>("h1, h2") ?? root;
    target.setAttribute("tabindex", "-1");
    try {
      target.focus({ preventScroll: true });
    } catch {
      /* 포커스 실패는 무시 — UX 를 막지 않는다 */
    }
  }, [screenKey]);

  return (
    <div className="join-container" ref={topRef}>
      {showRouteBar && <RouteBar current={routeIndex(stage, isCollectStep)} />}

      <div className="join-screen" key={screenKey} ref={screenRef}>
        {stage === "hero" && (
          <Hero count={initialCount} onStart={() => goStage("quiz")} config={config} />
        )}

        {stage === "quiz" && (
          <QuizStep
            step={currentStep}
            stepNumber={stepIndex + 1}
            totalSteps={steps.length}
            answers={answers}
            onPickMbti={pickMbti}
            onPickMbtiAnswer={pickMbtiAnswer}
            onPickTravel={pickTravel}
            onChange={patch}
            onBack={quizBack}
            onNext={quizNext}
          />
        )}

        {stage === "ticket" && (
          <Ticket answers={answers} onNext={() => goStage("why")} />
        )}

        {stage === "why" && (
          <Why onNext={() => goStage("join")} config={config} variant={variant} />
        )}

        {stage === "join" && (
          <JoinForm
            answers={answers}
            onChange={patch}
            onSubmit={handleSubmit}
            submitting={submitting}
            errorMessage={errorMessage}
            variant={variant}
          />
        )}

        {stage === "done" && (
          <Done
            name={answers.name}
            contactType={answers.contactType}
            wantInterview={answers.wantInterview}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
