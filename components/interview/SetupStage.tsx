"use client";

/* ============================================================
 * STAGE 0 — 준비: 대상자가 화면을 보기 전, 인터뷰어가 미리 채운다.
 *   별명(필수) · 길거리 퀴즈에서 받은 여행자 유형 · 만난 곳(선택).
 *   진행 가이드(목적·원칙)는 <details> 로 접어 두고,
 *   지난 세션 기록(복사/삭제)과 진행 중 세션 이어하기를 제공.
 * ============================================================ */

import { TRAVELER_TYPES, type TravelerTypeKey } from "@/lib/join/constants";
import type { InterviewSessionData, PatchInput } from "./interview.types";
import { PRINCIPLES, PURPOSE } from "./interview.types";
import { buildExportText, formatKoDateTime } from "./exportText";
import { useClipboard } from "./ui";

const TYPE_KEYS = Object.keys(TRAVELER_TYPES) as TravelerTypeKey[];

export default function SetupStage({
  data,
  patch,
  onStart,
  saved,
  onDelete,
  resumable,
  onResume,
  onDismissResume,
}: {
  data: InterviewSessionData;
  patch: (p: PatchInput) => void;
  onStart: () => void;
  saved: InterviewSessionData[];
  onDelete: (id: string) => void;
  resumable: InterviewSessionData | null;
  onResume: () => void;
  onDismissResume: () => void;
}) {
  const { copiedKey, fallbackText, copy, liveMessage } = useClipboard();
  const canStart = data.name.trim().length > 0;

  return (
    <div className="join-stack">
      <p className="join-kicker">Interview · 준비</p>
      <h1 className="join-h1">인터뷰 준비</h1>
      <p className="join-lead">
        만나기 전에 미리 채워 두세요. 시작을 누르면 이 화면을 함께 봅니다.
      </p>

      {/* 진행 중이던 세션 이어하기 — 새로고침·중단 복구 */}
      {resumable && (
        <div className="merit merit--mint">
          <span className="merit-emoji" aria-hidden="true">
            ⏳
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="merit-title">진행 중이던 세션이 있어요</div>
            <div className="merit-body">
              {resumable.name.trim() || "(이름 없음)"}님 ·{" "}
              {resumable.startedAt
                ? formatKoDateTime(resumable.startedAt)
                : "시작 전 · 준비 입력 저장됨"}
            </div>
            <div className="iv-row-actions">
              <button
                type="button"
                className="iv-btn iv-btn--primary"
                onClick={onResume}
              >
                이어서 하기
              </button>
              <button type="button" className="iv-btn" onClick={onDismissResume}>
                새로 시작
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="join-label" htmlFor="iv-name">
          어떻게 불러드릴까요? (별명)
        </label>
        <input
          id="iv-name"
          className="join-input"
          value={data.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="예: 지수"
          autoComplete="off"
        />

        <span className="join-label" id="iv-type-label">
          길에서 받은 여행자 유형 (기억나면)
        </span>
        <div className="join-chips" role="group" aria-labelledby="iv-type-label">
          {TYPE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="join-chip"
              aria-pressed={data.travelerTypeKey === key}
              onClick={() =>
                patch((prev) => ({
                  travelerTypeKey: prev.travelerTypeKey === key ? null : key,
                }))
              }
            >
              {TRAVELER_TYPES[key].emoji} {TRAVELER_TYPES[key].name}
            </button>
          ))}
          <button
            type="button"
            className="join-chip"
            aria-pressed={data.travelerTypeKey === null}
            onClick={() => patch({ travelerTypeKey: null })}
          >
            모름
          </button>
        </div>

        <label className="join-label" htmlFor="iv-met">
          만난 곳 (선택)
        </label>
        <input
          id="iv-met"
          className="join-input"
          value={data.metLocation}
          onChange={(e) => patch({ metLocation: e.target.value })}
          placeholder="예: 홍대 연트럴파크"
          autoComplete="off"
        />
      </div>

      {/* 인터뷰어 참고 — 구 대본의 목적·진행 원칙(접어 둠) */}
      <details className="iv-tip">
        <summary>📖 진행 가이드 (인터뷰어 참고)</summary>
        <div className="iv-tip-body">
          <p style={{ margin: 0 }}>
            <strong>목적 —</strong> {PURPOSE}
          </p>
          <ul className="iv-guide-list">
            {PRINCIPLES.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* 지난 세션 기록 — 복사(내보내기 텍스트) / 삭제(확인 후) */}
      {saved.length > 0 && (
        <div className="join-card">
          <p className="join-label" style={{ margin: "0 0 4px" }}>
            지난 기록
          </p>
          {/* 복사 성공을 스크린리더에도 알린다 — 버튼 라벨 교체만으론 낭독 안 됨 */}
          <span className="join-sr-only" aria-live="polite">
            {liveMessage}
          </span>
          {saved.map((s) => (
            <div key={s.id} className="iv-sess">
              <div style={{ minWidth: 0 }}>
                <div className="iv-sess-name">
                  {s.name.trim() || "(이름 없음)"}
                  {s.finishedAt === null ? " · 진행 중" : ""}
                </div>
                <div className="iv-sess-date">
                  {s.startedAt ? formatKoDateTime(s.startedAt) : "시작 전"}
                </div>
              </div>
              <div className="iv-sess-actions">
                <button
                  type="button"
                  className="iv-btn"
                  onClick={() => copy(s.id, buildExportText(s))}
                >
                  {copiedKey === s.id ? "복사됨 ✓" : "복사"}
                </button>
                <button
                  type="button"
                  className="iv-btn"
                  onClick={() => {
                    const label = s.name.trim();
                    const ok = window.confirm(
                      label
                        ? `${label}님 기록을 삭제할까요? 되돌릴 수 없어요.`
                        : "이 기록을 삭제할까요? 되돌릴 수 없어요.",
                    );
                    if (ok) onDelete(s.id);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {fallbackText && (
            <div>
              <p className="join-micro" style={{ marginTop: 10 }}>
                자동 복사가 안 됐어요. 아래 내용을 길게 눌러 직접 복사해 주세요.
              </p>
              <textarea
                className="join-input iv-fallback"
                readOnly
                rows={8}
                value={fallbackText}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="인터뷰 기록 전체 텍스트"
              />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="join-cta"
        disabled={!canStart}
        onClick={onStart}
      >
        {data.startedAt ? "세션 계속하기 →" : "세션 시작하기"}
      </button>
      {!canStart && (
        <p className="join-micro" style={{ textAlign: "center" }}>
          별명을 먼저 적어 주세요 — 화면에서 그 이름으로 불러요.
        </p>
      )}
    </div>
  );
}
