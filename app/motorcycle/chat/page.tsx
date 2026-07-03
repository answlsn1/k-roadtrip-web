"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { listRecentMessages, sendMessage, subscribeToNewMessages } from "@/lib/motorcycle/chat";
import type { MotorcycleChatMessage } from "@/lib/motorcycle/types";
import RiderChatTabs from "@/components/motorcycle/RiderChatTabs";

const RATE_LIMIT_MESSAGE =
  "도배 방지를 위해 잠시 후 다시 시도해주세요. 같은 내용을 반복해서 올릴 수는 없어요.";

export default function MotorcycleChatPage() {
  const { session, profile, isLoggedIn, loading } = useMotorcycleSession();
  const [messages, setMessages] = useState<MotorcycleChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const errorTimerRef = useRef<number | null>(null);

  const clearSendErrorTimer = () => {
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  useEffect(() => {
    return clearSendErrorTimer;
  }, []);

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
      clearSendErrorTimer();
      setSendError(null);
    } else if (result.error === "rate_limited") {
      clearSendErrorTimer();
      setSendError(RATE_LIMIT_MESSAGE);
      errorTimerRef.current = window.setTimeout(() => {
        setSendError(null);
        errorTimerRef.current = null;
      }, 4000);
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
        <Link href="/motorcycle/login" className="kr-btn-primary mt-8 px-6 py-2.5 text-sm">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-5 pb-4">
      <div className="border-b border-white/10 py-5">
        <RiderChatTabs active="lounge" />
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
                        ? "rounded-tr-md bg-amber-500 text-ink"
                        : "rounded-tl-md bg-[var(--kr-surface-2)] text-slate-100"
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

      {sendError && (
        <div
          role="alert"
          className="mb-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400"
        >
          {sendError}
        </div>
      )}
      <div className="border-t border-[var(--kr-line)] bg-[#0c0e12]/90 pt-4 backdrop-blur">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="메시지를 입력하세요"
            maxLength={500}
            className="kr-input min-w-0 flex-1 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="kr-btn-primary shrink-0 px-5 text-sm"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
