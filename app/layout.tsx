import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import LangSync from "@/components/LangSync";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://k-roadtrip.app";
const TITLE = "K-RoadTrip — Escape Seoul. Discover the Real Korea.";
const DESCRIPTION =
  "Curated Korean road-trip courses with local-verified stops, a beautiful map preview and one-tap Naver Map navigation — built for foreign travelers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "K-RoadTrip",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${notoKr.variable} bg-white font-sans text-slate-800 antialiased`}
      >
        <LangSync />
        {children}
        {/* AdSense 로더는 여기(전 페이지)가 아니라 app/page.tsx(홈)에만 둔다 —
            콘솔에서 자동광고가 실수로 켜져도 루트 상세·빌더 등 예약/핸드오프
            funnel 페이지에는 광고가 주입될 수 없도록 코드 레벨에서 스코프. */}
      </body>
    </html>
  );
}
