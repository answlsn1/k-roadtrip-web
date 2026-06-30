"use client";

import { useEffect, useState } from "react";

interface JoinSubmissionRow {
  id: string;
  created_at: string;
  name: string;
  contact_type: string;
  contact: string;
  want_interview: boolean;
  want_prototype: boolean;
  word: string | null;
  travel_type: string | null;
  plan: string | null;
  spot_pref: string | null;
  rec_region: string | null;
  rec_spot: string | null;
  pain: string | null;
  pain_text: string | null;
  source: string | null;
  user_agent: string | null;
  referrer: string | null;
}

interface JoinPayload {
  submissions: JoinSubmissionRow[];
  stats: { total: number; wantInterview: number; wantPrototype: number };
  generatedAt: string;
}

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

/** CSV 한 필드 escape — 큰따옴표로 감싸고 내부 " 는 "" 로 (RFC 4180). */
function csvField(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

const CSV_HEADER = [
  "일시",
  "이름",
  "연락방법",
  "연락처",
  "1차희망",
  "2차희망",
  "여행유형",
  "추천지역",
  "추천스팟",
  "최대불편",
  "불편메모",
  "한마디",
  "source",
];

function buildCsv(rows: JoinSubmissionRow[]): string {
  const lines = [CSV_HEADER.map(csvField).join(",")];
  for (const r of rows) {
    const fields = [
      new Date(r.created_at).toLocaleString("ko-KR"),
      r.name,
      r.contact_type,
      r.contact,
      r.want_interview ? "O" : "",
      r.want_prototype ? "O" : "",
      r.travel_type ?? "",
      r.rec_region ?? "",
      r.rec_spot ?? "",
      r.pain ?? "",
      r.pain_text ?? "",
      r.word ?? "",
      r.source ?? "",
    ];
    lines.push(fields.map(csvField).join(","));
  }
  return lines.join("\r\n");
}

export default function AdminJoinPage() {
  const [view, setView] = useState<View>("locked");
  const [data, setData] = useState<JoinPayload | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async (token: string) => {
    setView("loading");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/join", {
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
        const j = await res.json().catch(() => ({}));
        setDetail(
          j.error === "service_role_key_missing"
            ? "서버에 SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
            : "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
        );
        setView("unconfigured");
        return;
      }
      if (!res.ok) {
        setView("error");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      setData((await res.json()) as JoinPayload);
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
    setData(null);
    setDetail(null);
    setActionError(null);
    setView("locked");
  };

  const copyCsv = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(buildCsv(data.submissions));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionError("클립보드 복사에 실패했습니다 (브라우저 권한 확인).");
    }
  };

  const remove = async (row: JoinSubmissionRow) => {
    if (!window.confirm(`'${row.name}' 신청을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      lock();
      return;
    }
    setDeletingId(row.id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/join", {
        method: "DELETE",
        headers: { "x-admin-token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
        cache: "no-store",
      });
      if (!res.ok) {
        setActionError("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              submissions: prev.submissions.filter((s) => s.id !== row.id),
              stats: {
                total: prev.stats.total - 1,
                wantInterview: prev.stats.wantInterview - (row.want_interview ? 1 : 0),
                wantPrototype: prev.stats.wantPrototype - (row.want_prototype ? 1 : 0),
              },
            }
          : prev
      );
    } catch {
      setActionError("삭제 중 네트워크 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl bg-white px-5 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            K-RoadTrip · 비공개
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">동행단 신청 관리</h1>
        </div>
        {view === "ready" && (
          <button
            onClick={lock}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            잠그기
          </button>
        )}
      </div>

      {(view === "locked" || view === "unconfigured" || view === "error") && (
        <Card className="mt-10">
          {view === "unconfigured" ? (
            <>
              <p className="font-bold text-slate-800">설정이 필요합니다</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
            </>
          ) : view === "error" ? (
            <p className="font-bold text-slate-800">데이터를 불러오지 못했습니다</p>
          ) : (
            <>
              <p className="font-bold text-slate-800">관리자 토큰 입력</p>
              <p className="mt-1 text-sm text-slate-500">창업자 전용 화면입니다.</p>
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
        </Card>
      )}

      {view === "loading" && (
        <p className="mt-16 text-center text-sm text-slate-400">불러오는 중…</p>
      )}

      {view === "ready" && data && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              갱신 {new Date(data.generatedAt).toLocaleString("ko-KR")}
            </p>
            <button
              onClick={copyCsv}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-700 hover:border-slate-400 active:scale-[0.99]"
            >
              {copied ? "복사됨 ✓" : "CSV 복사"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="총 신청" value={data.stats.total} />
            <Stat label="1차 희망" value={data.stats.wantInterview} />
            <Stat label="2차 희망" value={data.stats.wantPrototype} />
          </div>

          {actionError && (
            <p className="text-xs font-semibold text-rose-500">{actionError}</p>
          )}

          {data.submissions.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-slate-400">아직 신청이 없어요.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.submissions.map((s) => (
                <SubmissionCard
                  key={s.id}
                  row={s}
                  deleting={deletingId === s.id}
                  onDelete={() => remove(s)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function SubmissionCard({
  row,
  deleting,
  onDelete,
}: {
  row: JoinSubmissionRow;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-extrabold text-slate-900">{row.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.contact_type} · {row.contact}
          </p>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-300 hover:text-rose-500 disabled:opacity-50"
        >
          {deleting ? "삭제 중…" : "삭제"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {row.want_interview && <Tag tone="emerald">1차 희망</Tag>}
        {row.want_prototype && <Tag tone="sky">2차 희망</Tag>}
        {row.travel_type && <Tag>{row.travel_type}</Tag>}
        {row.rec_region && <Tag>{row.rec_region}</Tag>}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        {row.rec_spot && <Field label="픽" value={row.rec_spot} />}
        {(row.pain || row.pain_text) && (
          <Field
            label="불편"
            value={[row.pain, row.pain_text].filter(Boolean).join(" · ")}
          />
        )}
        {row.word && <Field label="한마디" value={row.word} />}
      </dl>

      <p className="mt-3 text-[11px] text-slate-400">
        {new Date(row.created_at).toLocaleString("ko-KR")}
      </p>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-12 shrink-0 text-xs font-semibold text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}

function Tag({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "emerald" | "sky";
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "sky"
        ? "bg-sky-50 text-sky-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-slate-50 p-8 ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-2xl font-extrabold text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
