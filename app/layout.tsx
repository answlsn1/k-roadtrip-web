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
      </body>
    </html>
  );
}
