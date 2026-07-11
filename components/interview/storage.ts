/* ============================================================
 * 동행단 카페 인터뷰 — localStorage 세션 저장소.
 *   서버 기록 없음(어드민 로컬 전용). 모든 읽기/쓰기는 try/catch 로
 *   감싸 저장 실패가 인터뷰 진행(UX)을 절대 막지 않게 한다.
 * ============================================================ */

import type { InterviewSessionData } from "./interview.types";
import { INTERVIEW_STAGE_IDS } from "./interview.types";

const STORAGE_KEY = "krt-interview-sessions";

/** crypto.randomUUID 폴백 포함 세션 ID 생성(JoinFlow 의 세션ID 방식과 동일 정신). */
export function newSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* 폴백으로 진행 */
  }
  return `iv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptySession(): InterviewSessionData {
  return {
    id: newSessionId(),
    startedAt: null,
    finishedAt: null,
    stage: "setup",
    name: "",
    travelerTypeKey: null,
    metLocation: "",
    consent: false,
    companions: [],
    recentTripMemo: "",
    typeMatch: null,
    typeMemo: "",
    spots: [],
    sources: [],
    pains: [],
    styleMemo: "",
    foreignFriendMemo: "",
    topPickIndex: null,
  };
}

/** 저장된 항목이 세션으로 볼 수 있는 최소 형태인지 검사. */
function isSessionLike(v: unknown): v is Record<string, unknown> {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.id === "string" && typeof s.name === "string";
}

/** 구버전/손상 데이터 방어 — 기본값 위에 저장값을 얹고 위험 필드만 보정. */
function normalize(raw: Record<string, unknown>): InterviewSessionData {
  const merged = { ...createEmptySession(), ...raw } as InterviewSessionData;
  if (!INTERVIEW_STAGE_IDS.includes(merged.stage)) merged.stage = "setup";
  if (!Array.isArray(merged.spots)) merged.spots = [];
  if (!Array.isArray(merged.companions)) merged.companions = [];
  if (!Array.isArray(merged.sources)) merged.sources = [];
  if (!Array.isArray(merged.pains)) merged.pains = [];
  if (typeof merged.topPickIndex !== "number") merged.topPickIndex = null;
  // 초안은 선택 필드 — 형태가 깨져 있으면 버린다(이미 추가된 spots 는 별개).
  const sd = merged.spotDraft;
  if (
    sd !== undefined &&
    (typeof sd !== "object" ||
      sd === null ||
      typeof sd.place !== "string" ||
      typeof sd.why !== "string" ||
      typeof sd.recommendTo !== "string")
  ) {
    merged.spotDraft = undefined;
  }
  return merged;
}

/** 전체 세션 로드(최신이 앞). 실패 시 빈 배열 — 절대 throw 하지 않는다. */
export function loadSessions(): InterviewSessionData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSessionLike).map(normalize);
  } catch {
    return [];
  }
}

/** 세션 upsert — 같은 id 는 교체, 새 세션은 맨 앞(최신순 유지). */
export function upsertSession(session: InterviewSessionData): void {
  try {
    const all = loadSessions();
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) all[idx] = session;
    else all.unshift(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* 저장 실패는 진행을 막지 않는다 — 다음 변경에서 재시도됨 */
  }
}

export function removeSession(id: string): void {
  try {
    const all = loadSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* 삭제 실패도 UX 를 막지 않는다 */
  }
}
