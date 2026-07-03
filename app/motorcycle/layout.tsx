import type { Metadata } from "next";
import MotorcycleHeader from "@/components/motorcycle/MotorcycleHeader";
import "./motorcycle.css";

export const metadata: Metadata = {
  title: "K-Riders — 라이더를 위한 라이딩 커뮤니티",
  description: "라이딩 루트를 기록하고 공유하고, 다른 라이더와 실시간으로 이야기하세요.",
};

export default function MotorcycleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="krider-scope min-h-screen text-white">
      <MotorcycleHeader />
      <main className="pt-16">{children}</main>
    </div>
  );
}
