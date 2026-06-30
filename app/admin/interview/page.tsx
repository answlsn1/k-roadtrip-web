"use client";

/* ============================================================
 * 1차 카페 인터뷰 가이드 (인터뷰어 전용, 읽기 전용).
 * 토큰 게이트는 /admin/metrics·/admin/join 패턴 그대로 미러
 * (krt-admin-token 재사용 → 토큰 하나로 모든 어드민 화면 열림).
 * 콘텐츠는 정적 — 대상자 답변 기록(메모) 기능은 추후(v2).
 * ============================================================ */

import { useEffect, useState } from "react";

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

interface QItem {
  q: string;
  why?: string;
  probe?: string;
  hint?: string;
}
interface Section {
  tag: string;
  time: string;
  title: string;
  star?: boolean;
  items: QItem[];
}

const PURPOSE =
  "이 사람의 ‘기억에 남는 여행 스토리·스팟’을 듣고 데이터로 쌓기 — 어디를(스팟) · 왜 좋았는지(이유·감정) · 어떻게 여행을 만들었는지(과정·불편) · 외국인에게 추천한다면(제품 연결).";

const PRINCIPLES = [
  "“정답 없어요, 그냥 여행 수다예요”를 계속 상기시키기.",
  "추상적(“최고의 여행은?”) 대신 구체적(“최근 다녀온 데는?”)으로 물어 기억을 쉽게 꺼내게.",
  "막히면 같이 폰 사진첩 열어보기 — 기억 트리거 끝판왕.",
  "답보다 “왜”를 더 캐기. 이유·감정이 우리 데이터의 핵심.",
  "리스트 다 채우려 서두르지 말고, 하나 나오면 꼬리질문으로 깊게.",
];

const SECTIONS: Section[] = [
  {
    tag: "①",
    time: "2–3분",
    title: "워밍업 · 긴장 풀기",
    items: [
      { q: "와줘서 고마워요. 오늘 그냥 여행 수다 떤다 생각하면 돼요 — 정답 같은 거 없어요." },
      { q: "정리용으로 메모/녹음 살짝 해도 괜찮을까요?", why: "동의 받기" },
      { q: "요즘 어떻게 지내요? 학교/일 바빠요?", why: "사람 대 사람으로 풀기" },
    ],
  },
  {
    tag: "②",
    time: "5분",
    title: "진입 · 최근 여행부터",
    items: [
      {
        q: "최근에 다녀온 여행 있어요? 어디였어요?",
        probe: "누구랑? 며칠? 어땠어요?",
        why: "회상이 제일 쉬운 최근 기억으로 입을 열게",
      },
      {
        q: "지난번 길에서 푼 퀴즈에서 [유형] 나왔던데, 진짜 그런 편이에요?",
        why: "아이스브레이킹 + 성향 확인",
      },
    ],
  },
  {
    tag: "③",
    time: "10–15분",
    title: "기억에 남는 스팟",
    star: true,
    items: [
      {
        q: "지금까지 다닌 데 중에, 사진 찍어서 친구한테 ‘여기 미쳤다’ 보낸 곳 있어요?",
        hint: "막히면 폰 사진첩 같이 보기 (예: 강릉 안목해변, 대구 김광석거리, 여수 밤바다…)",
      },
      { q: "남들은 잘 모르는데 나만 아는 좋은 곳 있어요?", why: "로컬 스팟 — 제일 원하는 데이터" },
      {
        q: "거기 왜 그렇게 좋았어요? 뭐가 기억에 남아요?",
        probe: "뭐 먹었어요? 뭐 했어요? 분위기? 그때 기분?",
        why: "가장 중요 — 이유·감정",
      },
      { q: "거기 누구한테 꼭 추천하고 싶어요? 왜요?" },
    ],
  },
  {
    tag: "④",
    time: "5–7분",
    title: "여행 만드는 방식 + 불편",
    items: [
      { q: "여행 계획 짤 때 정보 어디서 찾아요?", hint: "인스타·블로그·유튜브·지도·지인?" },
      { q: "계획하면서 제일 귀찮거나 막막했던 순간 있어요?" },
      { q: "현지 가서 ‘이건 진짜 불편하다’ 했던 거?", hint: "예: 교통·주차·언어·정보 흩어짐·예약" },
    ],
  },
  {
    tag: "⑤",
    time: "5분",
    title: "제품 연결 + 마무리",
    items: [
      { q: "외국인 친구가 한국 여행 온다면, 어디 데려가고 왜요?", why: "우리 타깃 직접 연결" },
      { q: "여행지에서 ‘이런 게 있었으면’ 했던 거 있어요?" },
      { q: "오늘 얘기 중 딱 하나만 추천 스팟 콕 집으면?" },
      {
        q: "감사 + 보상 전달 + “더 생각나면 편하게 연락 줘요.”",
        why: "2차 만남은 분위기 좋으면 여기서 운영자 판단으로 자연스럽게",
      },
    ],
  },
];

export default function AdminInterviewPage() {
  const [view, setView] = useState<View>("locked");
  const [tokenInput, setTokenInput] = useState("");
  const [detail, setDetail] = useState<string | null>(null);

  const load = async (token: string) => {
    setView("loading");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/interview", {
        headers: { "x-admin-token": token },
        cache: "no-store",
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setDetail("토큰이 올바르지 않습니다. 다시 입력해 주세요.");
        setView("locked");
        return;
      }
      if (res.status === 503) {
        setDetail(
          "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
        );
        setView("unconfigured");
        return;
      }
      if (!res.ok) {
        setView("error");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      setView("ready");
    } catch {
      setView("error");
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (t) load(t);
  };

  const lock = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setTokenInput("");
    setDetail(null);
    setView("locked");
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl bg-white px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            K-RoadTrip · 비공개
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">1차 카페 인터뷰 가이드</h1>
        </div>
        {view === "ready" && (
          <button
            onClick={lock}
            className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            잠그기
          </button>
        )}
      </div>

      {(view === "locked" || view === "unconfigured" || view === "error") && (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          {view === "unconfigured" ? (
            <>
              <p className="font-bold text-slate-800">설정이 필요합니다</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
            </>
          ) : view === "error" ? (
            <p className="font-bold text-slate-800">불러오지 못했습니다</p>
          ) : (
            <>
              <p className="font-bold text-slate-800">관리자 토큰 입력</p>
              <p className="mt-1 text-sm text-slate-500">인터뷰어 전용 가이드입니다.</p>
              <form onSubmit={submit} className="mt-4 flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ADMIN_DASHBOARD_TOKEN"
                  autoFocus
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white active:scale-[0.99]"
                >
                  열기
                </button>
              </form>
              {detail && <p className="mt-2 text-xs font-semibold text-rose-500">{detail}</p>}
            </>
          )}
        </div>
      )}

      {view === "loading" && (
        <p className="mt-16 text-center text-sm text-slate-400">불러오는 중…</p>
      )}

      {view === "ready" && (
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              🎯 목적 (딱 이거 하나)
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{PURPOSE}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-extrabold text-slate-900">🧭 진행 원칙</p>
            <ul className="mt-3 space-y-2">
              {PRINCIPLES.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                  <span className="text-slate-300">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          {SECTIONS.map((s) => (
            <section key={s.tag} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">{s.tag}</span>
                <h2 className="text-base font-extrabold text-slate-900">
                  {s.title}
                  {s.star && <span className="ml-1 text-amber-500">⭐</span>}
                </h2>
                <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {s.time}
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {s.items.map((it, i) => (
                  <li key={i} className="border-l-2 border-emerald-200 pl-3">
                    <p className="text-[15px] font-bold leading-relaxed text-slate-800">
                      🗣 {it.q}
                    </p>
                    {it.hint && (
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">💡 {it.hint}</p>
                    )}
                    {it.probe && (
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        ↳ 꼬리: {it.probe}
                      </p>
                    )}
                    {it.why && (
                      <p className="mt-1 text-[12px] font-semibold text-emerald-600">목적: {it.why}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="pb-6 pt-2 text-center text-[11px] text-slate-400">
            읽기 전용 가이드 · 대상자 답변은 따로 기록 (메모 기능은 추후 v2)
          </p>
        </div>
      )}
    </main>
  );
}
