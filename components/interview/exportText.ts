/* ============================================================
 * 동행단 카페 인터뷰 — 세션 → 사람이 읽는 한국어 기록(클립보드용).
 *   운영자가 노션/메모 앱에 그대로 붙여 넣는 마크다운 형태.
 * ============================================================ */

import { TRAVELER_TYPES } from "@/lib/join/constants";
import type { InterviewSessionData } from "./interview.types";

/** ISO → "2026년 7월 12일 오후 02:30" 형태(실패 시 "—"). */
export function formatKoDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function buildExportText(s: InterviewSessionData): string {
  const type = s.travelerTypeKey ? TRAVELER_TYPES[s.travelerTypeKey] : null;
  const L: string[] = [];

  L.push(`# K-RoadTrip 동행단 인터뷰 — ${s.name.trim() || "(이름 없음)"}님`);
  L.push("");
  L.push(`- 일시: ${formatKoDateTime(s.startedAt)}`);
  L.push(`- 만난 곳: ${s.metLocation.trim() || "—"}`);
  L.push(`- 여행자 유형: ${type ? `${type.emoji} ${type.name}` : "모름"}`);
  L.push(`- 메모 동의: ${s.consent ? "예" : "아니요"}`);

  L.push("");
  L.push("## 최근 여행");
  L.push(`- 누구랑: ${s.companions.length ? s.companions.join(", ") : "—"}`);
  L.push(`- 유형 공감: ${s.typeMatch ?? "—"}`);
  if (s.recentTripMemo.trim()) L.push(`- 메모: ${s.recentTripMemo.trim()}`);
  if (s.typeMemo.trim()) L.push(`- 유형 메모: ${s.typeMemo.trim()}`);

  L.push("");
  L.push(`## 수집한 스팟 (${s.spots.length}개)`);
  if (s.spots.length === 0) L.push("- 없음");
  s.spots.forEach((sp, i) => {
    const star = s.topPickIndex === i ? " ⭐ 최애 픽" : "";
    L.push(`${i + 1}. ${sp.place}${sp.region ? ` [${sp.region}]` : ""}${star}`);
    if (sp.why.trim()) L.push(`   - 왜 좋았나: ${sp.why.trim()}`);
    if (sp.recommendTo.trim()) L.push(`   - 추천 대상: ${sp.recommendTo.trim()}`);
  });

  L.push("");
  L.push("## 여행 방식");
  L.push(`- 정보 출처: ${s.sources.length ? s.sources.join(", ") : "—"}`);
  L.push(`- 답답했던 점: ${s.pains.length ? s.pains.join(", ") : "—"}`);
  if (s.styleMemo.trim()) L.push(`- 메모: ${s.styleMemo.trim()}`);

  L.push("");
  L.push("## 같이 만들기");
  L.push(`- 외국인 친구 데려갈 곳: ${s.foreignFriendMemo.trim() || "—"}`);

  return L.join("\n");
}
