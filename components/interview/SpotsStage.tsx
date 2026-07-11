"use client";

/* ============================================================
 * STAGE 3 — 스팟 수집(핵심, 구 대본 ③ 각색).
 *   대화 프롬프트(구 대본의 질문 원문)를 크게 띄우고, 아래 수집기로
 *   장소명 + 지역 칩(REGIONS 단일 소스) + 이유 + 추천 대상을 담는다.
 *   추가한 스팟은 카드 리스트 + 실시간 카운트로 쌓인다 —
 *   대상자가 자기 지식이 "데이터로 쌓이는" 걸 눈으로 보는 순간.
 * ============================================================ */

import { REGIONS } from "@/lib/join/constants";
import type { InterviewSpot, StageProps } from "./interview.types";
import { TipDetails } from "./ui";

export default function SpotsStage({
  data,
  onNext,
  onBack,
  draft,
  onDraft,
  onAdd,
  onRemove,
}: Omit<StageProps, "patch"> & {
  draft: InterviewSpot;
  /** 바뀐 필드만 넘긴다 — 병합·이전 값 파생은 부모(patch 함수형)가 담당. */
  onDraft: (d: Partial<InterviewSpot>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const name = data.name.trim() || "동행자";

  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      <p className="join-kicker">스팟 수집</p>
      <h2 className="join-h2">
        <span className="join-grad-text">{name}님</span>의 기억에 남는 스팟
      </h2>
      <p className="join-lead">여기서 나온 이야기가 실제 코스의 재료가 돼요.</p>

      {/* 대화 프롬프트 — 구 대본의 질문 원문을 같이 읽는다 */}
      <section className="join-card">
        <p className="iv-q">
          사진 찍어서 친구한테 ‘여기 미쳤다’ 보낸 곳 있어요?
        </p>
        <p className="iv-q">남들은 잘 모르는데 나만 아는 좋은 곳은요?</p>
        <p className="iv-q">거기, 왜 그렇게 좋았어요?</p>
        <TipDetails tip="막히면 폰 사진첩을 같이 열어봐요 — 기억 트리거로 최고예요. 하나 나오면 ‘뭐 먹었어요? 그때 기분은요?’ 같은 꼬리 질문으로 깊게. 이유와 감정이 코스를 만들 때 가장 중요한 재료예요." />
      </section>

      {/* 스팟 수집기 */}
      <section className="join-card">
        <label className="join-label" htmlFor="iv-spot-place" style={{ marginTop: 0 }}>
          장소명
        </label>
        <input
          id="iv-spot-place"
          className="join-input"
          value={draft.place}
          onChange={(e) => onDraft({ place: e.target.value })}
          placeholder="예: 안목해변"
          autoComplete="off"
        />

        <span className="join-label" id="iv-spot-region-label">
          지역
        </span>
        <div
          className="join-chips"
          role="group"
          aria-labelledby="iv-spot-region-label"
        >
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              className="join-chip"
              aria-pressed={draft.region === region}
              onClick={() =>
                onDraft({ region: draft.region === region ? null : region })
              }
            >
              {region}
            </button>
          ))}
        </div>

        <label className="join-label" htmlFor="iv-spot-why">
          왜 좋았어요?
        </label>
        <textarea
          id="iv-spot-why"
          className="join-input"
          value={draft.why}
          onChange={(e) => onDraft({ why: e.target.value })}
          placeholder="분위기, 먹은 것, 그때 기분 — 들리는 대로 메모"
        />

        <label className="join-label" htmlFor="iv-spot-rec">
          추천 대상 (선택)
        </label>
        <input
          id="iv-spot-rec"
          className="join-input"
          value={draft.recommendTo}
          onChange={(e) => onDraft({ recommendTo: e.target.value })}
          placeholder="예: 사진 좋아하는 친구"
          autoComplete="off"
        />

        <button
          type="button"
          className="join-cta iv-add"
          disabled={!draft.place.trim()}
          onClick={onAdd}
        >
          + 스팟 추가
        </button>
      </section>

      {/* 수집된 스팟 — 쌓이는 게 눈에 보이는 리스트 */}
      {data.spots.length > 0 && (
        <div>
          <p className="iv-count" aria-live="polite">
            오늘 수집한 스팟{" "}
            <strong className="join-grad-text">{data.spots.length}개</strong> 🗺️
          </p>
          <div className="join-stack-sm">
            {data.spots.map((spot, i) => (
              <div key={`${spot.place}-${i}`} className="iv-spot">
                <div className="iv-spot-main">
                  <span className="iv-spot-place">{spot.place}</span>
                  {spot.region && (
                    <span className="iv-spot-region">{spot.region}</span>
                  )}
                  {spot.why.trim() && (
                    <div className="iv-spot-why">{spot.why}</div>
                  )}
                  {spot.recommendTo.trim() && (
                    <div className="iv-spot-why">추천: {spot.recommendTo}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="iv-spot-x"
                  aria-label={`${spot.place} 삭제`}
                  onClick={() => onRemove(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button type="button" className="join-cta" onClick={onNext}>
        여행 방식 이야기로 →
      </button>
    </div>
  );
}
