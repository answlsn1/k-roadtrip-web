"use client";

/* ============================================================
 * (5) join — 1차 카페 만남 약속(선택) + 연락처
 *   단일 만남 토글카드 + 폼(이름·연락방법 chip·연락처·한마디) +
 *   숨김 허니팟(company) + 제출 버튼(name & contact 모두 입력 시 활성).
 *   실제 submitJoin 호출/세션ID는 JoinFlow 가 owns → 여기선 onSubmit 콜백.
 *   ⚠️ 2차(프로토타입)는 길거리에서 비노출 — 운영자가 1차 만남 후 앱 밖에서 잇는다.
 *
 *   variant="offline"(/join, 기본값) — 카페 만남이 기본 전제. 토글 기본 ON.
 *   variant="online"(/recommend)   — 온라인 제출이 기본. 카페 만남은 완전
 *   선택 사항으로 토글 기본 OFF(JoinFlow 가 초기값을 결정), 카피도 그에 맞춤.
 * ============================================================ */

import { useState } from "react";
import { CONTACT_TYPES } from "@/lib/join/constants";
import type { ContactType } from "@/lib/join/constants";
import { joinConfig } from "@/lib/join/config";
import type { JoinAnswers } from "./join.flow.types";

const PLACEHOLDER: Record<ContactType, string> = {
  카톡: "카톡 아이디",
  인스타: "@아이디",
  이메일: "이메일 주소",
  전화: "휴대폰 번호",
};

// 모바일 키보드 최적화: 이메일·전화는 전용 키보드를 띄운다(type 은 text 유지).
const INPUT_MODE: Record<ContactType, "text" | "email" | "tel"> = {
  카톡: "text",
  인스타: "text",
  이메일: "email",
  전화: "tel",
};

export default function JoinForm({
  answers,
  onChange,
  onSubmit,
  submitting,
  errorMessage,
  variant = "offline",
}: {
  answers: JoinAnswers;
  onChange: (patch: Partial<JoinAnswers>) => void;
  /** 허니팟 값도 함께 넘겨 JoinFlow 가 submitJoin 에 전달 */
  onSubmit: (company: string) => void;
  submitting: boolean;
  errorMessage: string | null;
  variant?: "offline" | "online";
}) {
  // 허니팟은 폼 로컬 상태(제출 시 콜백으로만 전달, answers 오염 방지).
  const [company, setCompany] = useState("");

  const canSubmit =
    answers.name.trim().length > 0 && answers.contact.trim().length > 0;

  const isOnline = variant === "online";

  return (
    <div className="join-stack">
      <span className="join-kicker">거의 다 왔어요</span>
      <h2 className="join-h2">
        {isOnline
          ? "이제 마지막! 어디로 연락드리면 될지 알려주세요."
          : "그럼, 커피 한 잔 하면서 더 들려주세요."}
      </h2>
      {!isOnline && (
        <p className="join-lead">딱 30분, 카페에서 편하게요. 커피는 제가 살게요.</p>
      )}

      {/* 단일 카페-만남 토글 — offline 은 기본 ON, online 은 완전 선택사항(기본 OFF) */}
      <button
        type="button"
        className="join-toggle"
        aria-pressed={answers.wantInterview}
        onClick={() => onChange({ wantInterview: !answers.wantInterview })}
      >
        <span className="join-toggle-emoji" aria-hidden="true">
          ☕
        </span>
        <div>
          <div className="join-toggle-title">
            {isOnline ? "카페에서 직접 만나 이야기하고 싶어요" : "카페에서 30분 · 커피 한 잔"}
          </div>
          <div className="join-toggle-body">
            {isOnline
              ? `온라인 제출도 완전 좋지만, 혹시 만나서 더 들려주고 싶으면 체크해주세요. ${joinConfig.reward} 대접할게요.`
              : `여행 경험 제대로 듣고 싶어요. ${joinConfig.reward} 대접할게요.`}
          </div>
        </div>
        <span className="join-toggle-check" aria-hidden="true">
          {answers.wantInterview ? "✓" : ""}
        </span>
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !submitting) onSubmit(company);
        }}
      >
        {/* 🐝 허니팟 — 시각·스크린리더 모두 숨김. 사람은 안 채움. */}
        <div className="join-honeypot" aria-hidden="true">
          <label htmlFor="join-company">회사 (입력하지 마세요)</label>
          <input
            id="join-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <label className="join-label" htmlFor="join-name">
          이름 또는 별명
        </label>
        <input
          id="join-name"
          className="join-input"
          type="text"
          required
          value={answers.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="뭐라고 부르면 될까요?"
          maxLength={80}
          autoComplete="name"
          aria-describedby="join-name-help"
        />
        <p id="join-name-help" className="join-micro" style={{ marginTop: 6 }}>
          추천 루트에 이 별명으로 크레딧을 남겨드려요. (실명 아니어도 좋아요)
        </p>

        <label className="join-label" id="join-contacttype-label">
          연락 방법
        </label>
        <div
          className="join-chips"
          role="group"
          aria-labelledby="join-contacttype-label"
        >
          {CONTACT_TYPES.map((c) => (
            <button
              key={c}
              type="button"
              className="join-chip"
              aria-pressed={answers.contactType === c}
              onClick={() => onChange({ contactType: c })}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="join-label" htmlFor="join-contact">
          연락처
        </label>
        <input
          id="join-contact"
          className="join-input"
          type="text"
          required
          value={answers.contact}
          onChange={(e) => onChange({ contact: e.target.value })}
          placeholder={PLACEHOLDER[answers.contactType]}
          inputMode={INPUT_MODE[answers.contactType]}
          maxLength={120}
          autoComplete="off"
        />

        <label className="join-label" htmlFor="join-word">
          한마디 (선택)
        </label>
        <input
          id="join-word"
          className="join-input"
          type="text"
          value={answers.word}
          onChange={(e) => onChange({ word: e.target.value })}
          placeholder="하고 싶은 말이 있다면 편하게"
          maxLength={280}
        />

        {errorMessage && (
          <div className="join-error" role="alert">
            {errorMessage}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <button
            type="submit"
            className="join-cta"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "보내는 중…" : isOnline ? "네, 좋아요 · 보내기" : "네, 좋아요 · 약속 잡기"}
          </button>
        </div>

        <p
          className="join-micro"
          style={{ textAlign: "center", marginTop: 10 }}
        >
          연락처는 제가 연락드리는 용도로만 써요.
        </p>
      </form>
    </div>
  );
}
