"use client";

/* ============================================================
 * (4) why — 메리트(공정한 교환)
 *   "왜 당신이냐면" 키커 + 헤드라인 + 리드 + 메리트 4카드 +
 *   슬림 앱 링크 + CTA(→ join). reward 등 운영자 문구는 joinConfig 에서.
 *   variant="online" (/recommend) 은 첫 카드만 "카페 만남" 대신
 *   "약속 없이 바로 끝남"으로 바뀐다 — 나머지 3장은 동일.
 * ============================================================ */

import { joinConfig, type JoinConfig } from "@/lib/join/config";

export default function Why({
  onNext,
  config = joinConfig,
  variant = "offline",
}: {
  onNext: () => void;
  config?: JoinConfig;
  variant?: "offline" | "online";
}) {
  const { appUrl, reward, aliasCredit } = config;

  const firstMerit =
    variant === "online"
      ? {
          emoji: "⚡",
          title: "약속 잡을 필요 없어요",
          body: "지금 여기서 3분이면 끝. 이동 시간도, 약속도 필요 없어요.",
          mint: true,
        }
      : {
          emoji: "☕",
          title: "커피는 제가 살게요",
          body: `카페에서 30분, 편하게. ${reward} 대접할게요.`,
          mint: true,
        };

  const merits = [
    firstMerit,
    {
      emoji: "🗺️",
      title: "추천이 ‘당신 별명’으로 앱에",
      body: aliasCredit,
      mint: false,
    },
    {
      emoji: "🏅",
      title: "‘0기 동행단’ 기록",
      body: "활동 증명·추천서. 스펙·포트폴리오에 써요.",
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
