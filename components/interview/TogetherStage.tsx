"use client";

/* ============================================================
 * STAGE 5 — 같이 만들기(구 대본 ⑤ + 마무리 각색).
 *   (a) 우리가 만드는 것 한 줄 + 라이브 앱을 같이 열어보는 링크
 *   (b) 별명 크레딧 약속(하이라이트 카드 — joinConfig.aliasCredit 정신)
 *   (c) 외국인 친구 질문 (d) 오늘의 최애 픽(수집한 스팟 칩에서 선택)
 * ============================================================ */

import type { StageProps } from "./interview.types";
import { QuestionCard, TipDetails } from "./ui";

export default function TogetherStage({ data, patch, onNext, onBack }: StageProps) {
  const name = data.name.trim() || "동행자";

  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      <p className="join-kicker">같이 만들기</p>
      <h2 className="join-h2">이제, 같이 만들 차례예요</h2>

      {/* (a) 제품 순간 — 라이브 앱을 함께 열어본다 */}
      <section className="join-card join-stack-sm">
        <p className="iv-q">서울 너머, 한국 지방 여행을 제대로 만드는 앱이에요.</p>
        <p className="join-micro">오늘 같은 이야기가 모여 실제 코스가 돼요.</p>
        <a
          className="join-applink"
          href="https://k-roadtrip.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="join-livedot" aria-hidden="true" />
          실제로 움직이는 앱, 같이 볼래요?
        </a>
      </section>

      {/* (b) 별명 크레딧 약속 — lib/join/config aliasCredit 과 같은 정신 */}
      <div className="merit merit--mint">
        <span className="merit-emoji" aria-hidden="true">
          🏷️
        </span>
        <div>
          <div className="merit-title">
            오늘 나온 스팟, {name}님 별명을 달고 실제 코스로 올라갈 수 있어요
          </div>
          <div className="merit-body">
            ‘이거 내가 추천한 거예요’ 하고 자랑해도 돼요.
          </div>
        </div>
      </div>

      {/* (c) 외국인 친구 — 제품 타깃과 바로 닿는 질문 */}
      <QuestionCard question="외국인 친구가 온다면 어디 데려갈래요?">
        <label className="join-label" htmlFor="iv-foreign-memo">
          메모
        </label>
        <textarea
          id="iv-foreign-memo"
          className="join-input"
          value={data.foreignFriendMemo}
          onChange={(e) => patch({ foreignFriendMemo: e.target.value })}
          placeholder="어디로, 왜 — 이야기 나온 대로 메모"
        />
        <TipDetails tip="우리가 만드는 앱의 손님과 바로 닿는 질문이에요. ‘왜 거기예요?’를 꼭 물어봐요." />
      </QuestionCard>

      {/* (d) 오늘의 최애 픽 — 수집한 스팟을 칩으로 다시 보여준다 */}
      <QuestionCard question="오늘 나온 스팟 중 최애 픽 하나만 꼽으면?">
        {data.spots.length === 0 ? (
          <p className="join-micro" style={{ marginTop: 10 }}>
            아직 수집한 스팟이 없어요 — 이전 단계에서 추가할 수 있어요.
          </p>
        ) : (
          <div className="join-chips" style={{ marginTop: 14 }} role="group" aria-label="오늘의 최애 픽">
            {data.spots.map((spot, i) => (
              <button
                key={`${spot.place}-${i}`}
                type="button"
                className="join-chip"
                aria-pressed={data.topPickIndex === i}
                onClick={() =>
                  patch((prev) => ({
                    topPickIndex: prev.topPickIndex === i ? null : i,
                  }))
                }
              >
                {data.topPickIndex === i ? "⭐ " : ""}
                {spot.place}
              </button>
            ))}
          </div>
        )}
      </QuestionCard>

      <button type="button" className="join-cta" onClick={onNext}>
        오늘 기록 정리하기 →
      </button>
    </div>
  );
}
