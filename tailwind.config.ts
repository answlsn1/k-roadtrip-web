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
    },
  },
  plugins: [],
};

export default config;
