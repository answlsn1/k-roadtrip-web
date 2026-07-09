"use client";

/* ============================================================
 * (1) hero — 신뢰 + 후크
 *   운영자 아바타/이름/태그라인 · 진심 헤드라인(그라데이션) · 미션 ·
 *   실제 앱 라이브 링크 · CTA · 마이크로카피 · 신뢰 스트립.
 *   운영자 노출 문구는 전부 config prop 에서 가져온다(하드코딩 금지).
 *   /join(오프라인 인터뷰)과 /recommend(온라인) 가 joinConfig/recommendConfig
 *   를 각각 넘겨 재사용한다 — 이 컴포넌트 자체는 두 화면 모두 동일.
 * ============================================================ */

import { joinConfig, type JoinConfig } from "@/lib/join/config";

export default function Hero({
  count,
  onStart,
  config = joinConfig,
}: {
  count: number;
  onStart: () => void;
  config?: JoinConfig;
}) {
  const {
    appName,
    appUrl,
    mission,
    heroTeaser,
    founderName,
    founderTagline,
    founderInitial,
    govLine,
  } = config;

  return (
    <div className="join-stack">
      <div className="join-founder">
        <div className="join-avatar" aria-hidden="true">
          {founderInitial}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{founderName}</div>
          <div className="join-micro">{founderTagline}</div>
        </div>
      </div>

      <h1 className="join-h1">
        저, 이거 하나에 <span className="join-grad-text">진심으로</span> 몰두하고
        있어요.
      </h1>

      <p className="join-lead">
        {mission}
        <br />
        <strong style={{ color: "var(--ink)" }}>
          {appName}, 직접 만들고 있어요.
        </strong>
      </p>

      <a
        className="join-applink"
        href={appUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="join-livedot" aria-hidden="true" />
        진짜 만들고 있어요 · 실제 앱 보기
      </a>

      <div className="join-merit-teaser">{heroTeaser}</div>

      <button type="button" className="join-cta" onClick={onStart}>
        잠깐만, 도와줄래요? →
      </button>

      <p className="join-micro" style={{ textAlign: "center" }}>
        팔려는 게 아니에요. 만들고 있는 서비스를 더 좋게 만들려고요.
      </p>

      <div className="join-trust">
        <span>✅ 직접 검증</span>
        <span>🏛 {govLine}</span>
        <span>🙌 {count > 0 ? `${count}명 참여` : "0기 동행단 모집 중"}</span>
      </div>
    </div>
  );
}
