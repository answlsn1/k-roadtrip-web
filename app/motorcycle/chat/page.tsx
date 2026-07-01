"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { listRecentMessages, sendMessage, subscribeToNewMessages } from "@/lib/motorcycle/chat";
import type { MotorcycleChatMessage } from "@/lib/motorcycle/types";

export default function MotorcycleChatPage() {
  const { session, profile, isLoggedIn, loading } = useMotorcycleSession();
  const [messages, setMessages] = useState<MotorcycleChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    listRecentMessages().then(setMessages);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const unsubscribe = subscribeToNewMessages((msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return unsubscribe;
  }, [isLoggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !profile) return;

    setSending(true);
    const result = await sendMessage(profile.nickname, trimmed);
    setSending(false);

    if (result.ok) {
      setText("");
    } else {
      console.error("sendMessage error:", result.error);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/15 text-2xl">
          🔒
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-white">
          채팅은 로그인 후 이용할 수 있어요
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          라이더 라운지에서 다른 라이더들과 실시간으로 이야기해보세요.
        </p>
        <Link
          href="/motorcycle/login"
          className="mt-8 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-5 pb-4">
      <div className="border-b border-white/10 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500">라이더 라운지</p>
        <h1 className="mt-1 text-xl font-extrabold text-white">실시간 채팅</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            아직 대화가 없어요. 첫 메시지를 남겨보세요.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.user_id === session?.user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMine && (
                    <span className="mb-1 px-1 text-xs font-bold text-slate-400">{msg.nickname}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? "rounded-tr-sm bg-amber-500 text-ink"
                        : "rounded-tl-sm bg-white/10 text-slate-100"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 pt-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          maxLength={500}
          className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="shrink-0 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-ink transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          전송
        </button>
      </form>
    </div>
  );
}
