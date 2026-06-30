"use client";

/* ============================================================
 * (4) why — 메리트(공정한 교환)
 *   "왜 당신이냐면" 키커 + 헤드라인 + 리드 + 메리트 4카드 +
 *   슬림 앱 링크 + CTA(→ join). reward 등 운영자 문구는 joinConfig 에서.
 * ============================================================ */

import { joinConfig } from "@/lib/join/config";

export default function Why({ onNext }: { onNext: () => void }) {
  const { appUrl, reward } = joinConfig;

  const merits = [
    {
      emoji: "☕",
      title: "시간엔 보답을 드려요",
      body: `제대로 된 이야기엔 ${reward}. 공짜로 안 써요.`,
      mint: true,
    },
    {
      emoji: "🏅",
      title: "‘0기 동행단’ 기록",
      body: "활동 증명·추천서. 스펙·포트폴리오에 써요.",
      mint: false,
    },
    {
      emoji: "🚀",
      title: "시작되는 순간의 멤버",
      body: "베타 제일 먼저, 기능에 의견 반영.",
      mint: false,
    },
    {
      emoji: "📍",
      title: "당신의 로컬 지식이 쓰여요",
      body: "외국인 여행자에게 실제로 가닿아요.",
      mint: false,
    },
  ];

  return (
    <div className="join-stack">
      <span className="join-kicker">왜 당신이냐면</span>
      <h2 className="join-h2">방금 그 한 줄이, 제일 정확한 나침반이에요.</h2>
      <p className="join-lead">
        지도·블로그보다 진짜 여행자의 경험이 정확해요. 그래서 사방에서 긁어모으는
        대신, 당신에게 직접 물어요.
      </p>

      <div className="merit-grid">
        {merits.map((m) => (
          <div key={m.title} className={`merit${m.mint ? " merit--mint" : ""}`}>
            <span className="merit-emoji" aria-hidden="true">
              {m.emoji}
            </span>
            <div>
              <div className="merit-title">{m.title}</div>
              <div className="merit-body">{m.body}</div>
            </div>
          </div>
        ))}
      </div>

      <a
        className="join-applink join-applink--slim"
        href={appUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="join-livedot" aria-hidden="true" />
        저 진짜 만들고 있어요 · 직접 확인
      </a>

      <button type="button" className="join-cta" onClick={onNext}>
        다음, 같이 해볼래요? →
      </button>
    </div>
  );
}
