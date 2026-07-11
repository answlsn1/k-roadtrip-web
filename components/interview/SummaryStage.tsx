"use client";

/* ============================================================
 * 요약 — 감사 인사 + 오늘 담은 것 전부 리캡 + 기록 복사 + 새 세션.
 *   복사 실패(클립보드 차단) 시 수동 복사용 textarea 폴백.
 *   인터뷰어용 마무리 체크는 다른 스테이지처럼 조용한 disclosure 에 —
 *   같이 보는 화면에 운영 지시문을 그대로 노출하지 않는다.
 * ============================================================ */

import type { ReactNode } from "react";
import { TRAVELER_TYPES } from "@/lib/join/constants";
import type { InterviewSessionData } from "./interview.types";
import { buildExportText } from "./exportText";
import { TipDetails, useClipboard } from "./ui";

function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="iv-recap-row">
      <span className="iv-recap-k">{k}</span>
      <span className="iv-recap-v">{children}</span>
    </div>
  );
}

export default function SummaryStage({
  data,
  onBack,
  onReset,
}: {
  data: InterviewSessionData;
  onBack: () => void;
  onReset: () => void;
}) {
  const { copiedKey, fallbackText, copy, liveMessage } = useClipboard();
  const type = data.travelerTypeKey ? TRAVELER_TYPES[data.travelerTypeKey] : null;
  const name = data.name.trim() || "동행자";

  // 어떤 메모가 담겼는지(내용 자체는 복사본에 — 리캡엔 존재 여부만).
  const memoLabels = [
    data.recentTripMemo.trim() && "최근 여행",
    data.typeMemo.trim() && "유형",
    data.styleMemo.trim() && "여행 방식",
    data.foreignFriendMemo.trim() && "외국인 친구",
  ].filter((v): v is string => Boolean(v));

  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      <p className="join-kicker">종착역</p>
      <h1 className="join-h1">
        고마워요, {name}님.
        <br />
        오늘 이야기가 지도가 돼요.
      </h1>

      <div className="join-card">
        <Row k="여행자 유형">{type ? `${type.emoji} ${type.name}` : "모름"}</Row>
        <Row k="메모 동의">{data.consent ? "네, 괜찮아요" : "아니요"}</Row>
        {data.metLocation.trim() && <Row k="만난 곳">{data.metLocation}</Row>}
        <Row k="누구랑">
          {data.companions.length ? data.companions.join(" · ") : "—"}
        </Row>
        <Row k="유형 공감">{data.typeMatch ?? "—"}</Row>
        <Row k={`스팟 ${data.spots.length}개`}>
          {data.spots.length === 0 ? (
            "—"
          ) : (
            <span>
              {data.spots.map((spot, i) => (
                <span key={`${spot.place}-${i}`} style={{ display: "block" }}>
                  {data.topPickIndex === i ? "⭐ " : ""}
                  {spot.place}
                  {spot.region ? ` (${spot.region})` : ""}
                </span>
              ))}
            </span>
          )}
        </Row>
        <Row k="정보 출처">
          {data.sources.length ? data.sources.join(" · ") : "—"}
        </Row>
        <Row k="답답했던 것">
          {data.pains.length ? data.pains.join(" · ") : "—"}
        </Row>
        <Row k="메모">
          {memoLabels.length ? `${memoLabels.join(" · ")} ✓` : "—"}
        </Row>
      </div>

      <button
        type="button"
        className="join-cta"
        onClick={() => copy("summary", buildExportText(data))}
      >
        {copiedKey === "summary" ? "복사됨 ✓" : "📋 기록 복사하기"}
      </button>
      {/* 복사 성공을 스크린리더에도 알린다 — 버튼 라벨 교체만으론 낭독 안 됨 */}
      <span className="join-sr-only" aria-live="polite">
        {liveMessage}
      </span>

      {fallbackText && (
        <div>
          <p className="join-micro">
            자동 복사가 안 됐어요. 아래 내용을 길게 눌러 직접 복사해 주세요.
          </p>
          <textarea
            className="join-input iv-fallback"
            readOnly
            rows={10}
            value={fallbackText}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="인터뷰 기록 전체 텍스트"
          />
        </div>
      )}

      <button type="button" className="join-btn-ghost" onClick={onReset}>
        새 세션 시작
      </button>

      {/* 인터뷰어용 마무리 체크 — 대상자가 열어 봐도 괜찮은 문장으로, 조용한 disclosure 에 */}
      <TipDetails tip="마무리 체크: 오늘 약속한 감사 선물 잊지 말고 전해 드리기 · ‘더 생각나면 편하게 연락 주세요’ 인사로 마무리해요." />
    </div>
  );
}
