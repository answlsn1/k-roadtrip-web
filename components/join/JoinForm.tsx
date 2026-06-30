"use client";

/* ============================================================
 * (5) join — 2회 옵트인 + 연락처
 *   토글카드 2개(독립 선택) + 폼(이름·연락방법 chip·연락처·한마디) +
 *   숨김 허니팟(company) + 제출 버튼(name & contact 모두 입력 시 활성).
 *   실제 submitJoin 호출/세션ID는 JoinFlow 가 owns → 여기선 onSubmit 콜백.
 * ============================================================ */

import { useState } from "react";
import { CONTACT_TYPES } from "@/lib/join/constants";
import type { ContactType } from "@/lib/join/constants";
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
}: {
  answers: JoinAnswers;
  onChange: (patch: Partial<JoinAnswers>) => void;
  /** 허니팟 값도 함께 넘겨 JoinFlow 가 submitJoin 에 전달 */
  onSubmit: (company: string) => void;
  submitting: boolean;
  errorMessage: string | null;
}) {
  // 허니팟은 폼 로컬 상태(제출 시 콜백으로만 전달, answers 오염 방지).
  const [company, setCompany] = useState("");

  const canSubmit =
    answers.name.trim().length > 0 && answers.contact.trim().length > 0;

  return (
    <div className="join-stack">
      <span className="join-kicker">다음 단계</span>
      <h2 className="join-h2">부담 갖지 마세요. 여기까지도 진짜 감사해요.</h2>
      <p className="join-lead">관심 있는 만큼만 골라주세요.</p>

      {/* 옵트인 토글 2개 — 독립 선택 */}
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
          <div className="join-toggle-title">1차 · 30분 제대로 이야기</div>
          <div className="join-toggle-body">
            여행 경험 제대로 듣고 싶어요. 커피·식사 드려요.
          </div>
        </div>
        <span className="join-toggle-check" aria-hidden="true">
          {answers.wantInterview ? "✓" : ""}
        </span>
      </button>

      <button
        type="button"
        className="join-toggle"
        aria-pressed={answers.wantPrototype}
        onClick={() => onChange({ wantPrototype: !answers.wantPrototype })}
      >
        <span className="join-toggle-emoji" aria-hidden="true">
          🧪
        </span>
        <div>
          <div className="join-toggle-title">2차 · 프로토타입 같이 써보기</div>
          <div className="join-toggle-body">
            0기 동행단으로, 만들어지는 걸 같이 다듬어요.
          </div>
        </div>
        <span className="join-toggle-check" aria-hidden="true">
          {answers.wantPrototype ? "✓" : ""}
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
          이름 / 닉네임
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
        />

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
            {submitting ? "보내는 중…" : "보내기 · 0기 동행단 되기"}
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
