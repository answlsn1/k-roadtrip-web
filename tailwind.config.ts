import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        naver: "#03C75A",
        ink: "#0f172a",
      },
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "var(--font-noto-kr)",
          "system-ui",
          "sans-serif",
        ],
      },
      // 3D 부양(floating) 그림자 — 핀터레스트 무드의 이중 확산 그림자.
      // 근접(접촉) 그림자 + 멀리 퍼지는 앰비언트 그림자 2겹으로 카드가
      // 페이지에서 6~10px 떠 있는 느낌을 낸다.
      // -dark 계열은 어두운 섹션 또는 어두운 요소(FAB 등 잉크 필)용.
      boxShadow: {
        float:
          "0 2px 8px rgba(2,6,23,0.08), 0 12px 28px -8px rgba(2,6,23,0.28)",
        "float-lg":
          "0 8px 20px rgba(2,6,23,0.12), 0 28px 56px -12px rgba(2,6,23,0.38)",
        "float-dark":
          "0 2px 8px rgba(0,0,0,0.5), 0 16px 40px -8px rgba(0,0,0,0.6)",
        "float-dark-lg":
          "0 4px 12px rgba(0,0,0,0.55), 0 24px 56px -8px rgba(0,0,0,0.65)",
      },
    },
  },
  plugins: [],
};

export default config;
