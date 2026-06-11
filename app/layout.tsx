import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "K-RoadTrip — Escape Seoul. Discover the Real Korea.",
  description:
    "Curated Korean road-trip courses with local-verified stops, a beautiful map preview and one-tap Naver Map navigation — built for foreign travelers.",
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
        {children}
      </body>
    </html>
  );
}
