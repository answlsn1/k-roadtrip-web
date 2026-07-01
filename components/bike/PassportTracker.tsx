"use client";

import { useEffect, useState } from "react";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import { useBikePassportStore } from "@/store/useBikePassportStore";
import { BIKE_ROUTES, FOUR_RIVERS_SLUGS } from "@/lib/config/bikeRoutes";

/**
 * 델라이트 기능 — 실제 종이 인증수첩을 본뜬 디지털 완주 체크리스트.
 * 서버 없이 localStorage 만으로 동작. 12개 노선을 눌러 완주 표시하면
 * 진행률 바 + 4대강/그랜드슬램 메달이 실시간으로 잠금 해제된다.
 */
export default function PassportTracker() {
  const lang = useLangStore((s) => s.lang);
  const [mounted, setMounted] = useState(false);
  const completed = useBikePassportStore((s) => s.completed);
  const toggleCompleted = useBikePassportStore((s) => s.toggleCompleted);
  const reset = useBikePassportStore((s) => s.reset);

  useEffect(() => {
    useBikePassportStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const done = mounted ? completed : [];
  const totalKm = BIKE_ROUTES.filter((r) => done.includes(r.slug)).reduce(
    (sum, r) => sum + r.distanceKm,
    0
  );
  const fourRiversUnlocked = FOUR_RIVERS_SLUGS.every((s) => done.includes(s));
  const grandSlamUnlocked = done.length === BIKE_ROUTES.length;
  const pct = Math.round((done.length / BIKE_ROUTES.length) * 100);

  return (
    <section id="passport" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
              {t("bike.passport.title", lang)}
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-slate-500">
              {t("bike.passport.sub", lang)}
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <MedalBadge
              label={t("bike.passport.fourRivers", lang)}
              unlocked={fourRiversUnlocked}
              statusLabel={t(
                fourRiversUnlocked ? "bike.passport.unlocked" : "bike.passport.locked",
                lang
              )}
            />
            <MedalBadge
              label={t("bike.passport.grandSlam", lang)}
              unlocked={grandSlamUnlocked}
              statusLabel={t(
                grandSlamUnlocked ? "bike.passport.unlocked" : "bike.passport.locked",
                lang
              )}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{tf("bike.passport.progress", lang, { n: done.length })}</span>
            <span>{tf("bike.passport.totalKm", lang, { km: totalKm })}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Route chips */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {BIKE_ROUTES.map((r) => {
            const isDone = done.includes(r.slug);
            const name = lang === "ko" ? r.name_ko : r.name_en;
            return (
              <button
                key={r.slug}
                type="button"
                onClick={() => toggleCompleted(r.slug)}
                aria-pressed={isDone}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-colors ${
                  isDone
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <span aria-hidden="true">{r.icon}</span>
                  {isDone && (
                    <span className="text-xs font-extrabold text-emerald-600">✓</span>
                  )}
                </span>
                <span className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-700">
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {mounted && done.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="mt-5 text-xs font-semibold text-slate-400 hover:text-rose-500"
          >
            {t("bike.passport.reset", lang)}
          </button>
        )}
      </div>
    </section>
  );
}

function MedalBadge({
  label,
  unlocked,
  statusLabel,
}: {
  label: string;
  unlocked: boolean;
  statusLabel: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-3.5 py-2.5 text-center ${
        unlocked ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-60"
      }`}
    >
      <p className="text-xs font-extrabold text-ink">{label}</p>
      <p
        className={`text-[10px] font-bold uppercase tracking-wide ${
          unlocked ? "text-amber-600" : "text-slate-400"
        }`}
      >
        {statusLabel}
      </p>
    </div>
  );
}
