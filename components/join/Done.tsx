"use client";

/* ============================================================
 * (6) done — 감사
 *   "고마워요, {name}!" + 연락 안내({contactType}) + 연락처 박스 +
 *   앱 링크 + "다른 친구에게도 보여주기"(Web Share API → 링크 복사 폴백).
 * ============================================================ */

import { useState } from "react";
import { joinConfig } from "@/lib/join/config";
import type { ContactType } from "@/lib/join/constants";

export default function Done({
  name,
  contactType,
}: {
  name: string;
  contactType: ContactType;
}) {
  const { appName, appUrl, contactBack } = joinConfig;
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
        곧 {contactType}으로 연락드릴게요. 궁금한 건 언제든 저한테 편하게요.
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
