"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { logOut } from "@/lib/motorcycle/auth";

const NAV_LINKS = [
  { href: "/motorcycle", label: "피드" },
  { href: "/motorcycle/chat", label: "채팅" },
  { href: "/motorcycle/my", label: "내 루트" },
];

export default function MotorcycleHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const router = useRouter();
  const { profile, isLoggedIn } = useMotorcycleSession();

  const handleLogout = async () => {
    close();
    await logOut();
    router.push("/motorcycle");
    router.refresh();
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/motorcycle"
            onClick={close}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-extrabold tracking-tight text-white"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500 text-sm font-black text-ink">
              K
            </span>
            K-Riders
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-300 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-amber-400">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <span className="text-sm font-bold text-slate-300">
                  {profile?.nickname ?? "라이더"}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/motorcycle/login"
                  className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-amber-400"
                >
                  로그인
                </Link>
                <Link
                  href="/motorcycle/signup"
                  className="rounded-full bg-amber-500 px-3.5 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-amber-400"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 text-slate-300 active:bg-white/5"
            >
              {open ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={close}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 top-16 bg-ink shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-200 hover:bg-white/5 active:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-white/10" />
              {isLoggedIn ? (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-bold text-slate-300">
                    {profile?.nickname ?? "라이더"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-slate-300"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Link
                    href="/motorcycle/login"
                    onClick={close}
                    className="flex-1 rounded-full border border-white/15 py-2 text-center text-sm font-semibold text-slate-300"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/motorcycle/signup"
                    onClick={close}
                    className="flex-1 rounded-full bg-amber-500 py-2 text-center text-sm font-bold text-ink"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
