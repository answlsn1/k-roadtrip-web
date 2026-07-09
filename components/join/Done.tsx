"use client";

/* ============================================================
 * (6) done — 감사
 *   "고마워요, {name}!" + 연락 안내({contactType}) + 연락처 박스 +
 *   앱 링크 + "다른 친구에게도 보여주기"(Web Share API → 링크 복사 폴백).
 *   wantInterview 가 false(온라인 제출, 만남 선택 안 함)면 "약속 잡으러
 *   연락드릴게요" 문구 대신 "제출 감사" 톤으로 바뀐다.
 * ============================================================ */

import { useState } from "react";
import { joinConfig, type JoinConfig } from "@/lib/join/config";
import type { ContactType } from "@/lib/join/constants";

export default function Done({
  name,
  contactType,
  wantInterview = true,
  config = joinConfig,
}: {
  name: string;
  contactType: ContactType;
  wantInterview?: boolean;
  config?: JoinConfig;
}) {
  const { appName, appUrl, contactBack } = config;
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: `${appName} · 0기 동행단`,
      text: `${appName} — 한국 지방 여행, 같이 만들어볼래요?`,
      url: appUrl,
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // 공유 취소/실패 → 복사 폴백으로 진행
    }
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 복사도 불가한 환경 — 조용히 무시 */
    }
  }

  return (
    <div className="join-stack">
      <div style={{ fontSize: 48, textAlign: "center" }} aria-hidden="true">
        🚗💨
      </div>
      <h2 className="join-h2" style={{ textAlign: "center" }}>
        고마워요, {name}! 이제 0기 동행단이에요.
      </h2>
      <p className="join-lead" style={{ textAlign: "center" }}>
        {wantInterview ? (
          <>
            곧 {contactType}으로 약속 잡으러 연락드릴게요. 커피 한 잔 하면서 편하게
            이야기해요 ☕
          </>
        ) : (
          <>알려주신 스팟, 소중히 받았어요. 실제 코스에 반영되면 앱에서 만나볼 수 있을 거예요 🚗</>
        )}
      </p>

      <div className="join-contactback">{contactBack}</div>

      <a
        className="join-applink"
        href={appUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="join-livedot" aria-hidden="true" />
        실제 앱 보기
      </a>

      <button type="button" className="join-btn-ghost" onClick={handleShare}>
        {copied ? "링크 복사됨 ✓" : "다른 친구에게도 보여주기"}
      </button>
    </div>
  );
}
