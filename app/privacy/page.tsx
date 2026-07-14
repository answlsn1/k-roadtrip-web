import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import SiteFooter from "@/components/home/SiteFooter";
import PrivacyContent from "./PrivacyContent";

/* ============================================================
 * /privacy — 개인정보처리방침 (Server Component 셸)
 *   AdSense 승인 선행 요건. 심사 크롤러가 접근해야 하므로 noindex 금지.
 *   본문은 언어 토글(useLangStore)을 따라야 해서 클라이언트 컴포넌트
 *   (PrivacyContent)에 두고, 여기서는 메타데이터 + 사이트 셸만 구성한다.
 * ============================================================ */

export const metadata: Metadata = {
  title: "Privacy Policy — K-RoadTrip",
  description:
    "How K-RoadTrip handles your data: anonymous usage analytics, voluntary form submissions, on-device trip data, Google AdSense advertising, and affiliate links — in plain language.",
};

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <PrivacyContent />
      <SiteFooter />
    </main>
  );
}
