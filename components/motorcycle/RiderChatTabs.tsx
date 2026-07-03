import Link from "next/link";

const TABS = [
  { key: "board", label: "게시판", href: "/motorcycle/board" },
  { key: "lounge", label: "실시간 라운지", href: "/motorcycle/chat" },
] as const;

/** 라이더챗 섹션 공용 헤더 — 게시판·실시간 라운지를 잇는 탭. */
export default function RiderChatTabs({ active }: { active: "board" | "lounge" }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-amber-500">라이더챗</p>
      <nav
        aria-label="라이더챗 메뉴"
        className="mt-3 flex w-fit gap-1 rounded-full border border-[var(--kr-line)] bg-[var(--kr-surface-1)] p-1"
      >
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active === tab.key ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              active === tab.key ? "bg-amber-500 text-ink" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
