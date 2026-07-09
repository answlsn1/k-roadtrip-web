"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Polyline, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import LeafletCanvas from "@/components/map/LeafletCanvas";
import { numberedIcon } from "@/components/map/markerIcon";

export interface DraftStop {
  tempId: string;
  name: string;
  latitude: number;
  longitude: number;
  note?: string;
}

/* ── 경유지 변경 시 지도 자동 맞춤(BuilderMap FitBounds 패턴) ──
 * 후보 핀 이동으로는 refit 하지 않는다 — stops 만 의존. */
function FitBounds({ stops }: { stops: DraftStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) return;
    if (stops.length === 1) {
      map.setView([stops[0].latitude, stops[0].longitude], 12);
      return;
    }
    const bounds = L.latLngBounds(
      stops.map((s) => [s.latitude, s.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);
  return null;
}

/* 라이더스 전용 핀 드롭 아이콘 — 공유 markerIcon.ts 는 수정 금지라 여기서 생성.
 * 스타일(.kr-pin-dot)은 app/motorcycle/motorcycle.css.
 * 모듈 상수로 한 번만 생성 — 렌더마다 새 아이콘이면 setIcon 이 펄스
 * 애니메이션을 리셋한다(이 파일은 ssr:false 로만 로드돼 안전). */
const PIN_DROP_ICON: L.DivIcon = L.divIcon({
  html: '<span class="kr-pin-dot"><span class="kr-pin-dot-ring"></span></span>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/* ── 핀 드롭: 클릭/탭 → 후보 도트 + 확인 팝업(BuilderMap PinDropLayer 포트) ──
 * Leaflet 은 실제 클릭·탭에만 click 을 발화하고(드래그·핀치줌 X),
 * 마커 클릭은 지도에 버블되지 않아 이 핸들러 하나로 데스크톱+모바일 커버. */

interface PinCandidate {
  lat: number;
  lng: number;
}

function PinDropLayer({
  stopCount,
  onAddStop,
}: {
  stopCount: number;
  onAddStop: (name: string, lat: number, lng: number) => void;
}) {
  const [pin, setPin] = useState<PinCandidate | null>(null);
  // geocoded=true 면 실제 역지오코딩 라벨, false 면 좌표 문자열 폴백.
  const [label, setLabel] = useState<{ text: string; geocoded: boolean } | null>(null);
  const [name, setName] = useState("");

  // 최신 후보 — 아래 팝업 remove 클로저에서 읽는다.
  const pinRef = useRef<PinCandidate | null>(null);
  pinRef.current = pin;

  useMapEvents({
    click: (e) => {
      // 재클릭은 단일 후보를 새 지점으로 옮길 뿐이다.
      setPin({ lat: e.latlng.lat, lng: e.latlng.lng });
      setName("");
    },
  });

  // 사람이 읽을 라벨 확보(한국어 주소 → 실패 시 좌표 폴백).
  useEffect(() => {
    if (!pin) {
      setLabel(null);
      return;
    }
    setLabel(null);
    const coordLabel = `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;
    const ac = new AbortController();
    fetch(`/api/geocode?lat=${pin.lat}&lng=${pin.lng}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data: { pin?: { label_ko?: string } | null }) => {
        if (ac.signal.aborted) return;
        // 서버는 지오코딩 실패·한국 밖 좌표에서도 좌표 문자열을 label_ko 에
        // 담아 200 으로 응답한다 — 클라이언트 coordLabel 과 동일 포맷이라
        // 문자열 비교로 "진짜 주소" 여부를 판별해야 이름 폴백이 의도대로 동작.
        const ko = data.pin?.label_ko;
        const isReal = !!ko && ko !== coordLabel;
        setLabel(
          ko ? { text: ko, geocoded: isReal } : { text: coordLabel, geocoded: false }
        );
      })
      .catch(() => {
        if (!ac.signal.aborted) setLabel({ text: coordLabel, geocoded: false });
      });
    return () => ac.abort();
  }, [pin]);

  // 위치 배열의 참조를 후보가 살아있는 동안 고정 — 매 렌더 새 배열이면
  // react-leaflet Popup 라이프사이클 effect(deps 에 position 포함)가 키
  // 입력마다 팝업을 떼었다 붙여 input 포커스가 날아간다(모바일은 키보드
  // 닫힘). pin 변경 시엔 key 로 리마운트되므로 이 memo 로 충분하다.
  const popupPos = useMemo<[number, number]>(
    () => (pin ? [pin.lat, pin.lng] : [0, 0]),
    [pin]
  );

  if (!pin) return null;

  const coordCaption = `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;

  const handleAdd = () => {
    // 이름이 비어 있으면 지오코딩 라벨 → 그것도 없으면 "장소 N".
    const fallback = label?.geocoded ? label.text : `장소 ${stopCount + 1}`;
    onAddStop((name.trim() || fallback).slice(0, 80), pin.lat, pin.lng);
    setPin(null); // 여기서부터는 번호 마커가 이어받는다
    setName("");
  };

  return (
    <>
      <Marker
        position={popupPos}
        icon={PIN_DROP_ICON}
        interactive={false}
        zIndexOffset={2000}
      />
      <Popup
        key={`${pin.lat},${pin.lng}`}
        position={popupPos}
        offset={[0, -10]}
        eventHandlers={{
          // 팝업 닫힘(X·지도 클릭에 의한 Leaflet 자동 닫힘)= 후보 취소 —
          // 단, 이 지점의 후보일 때만(재클릭으로 핀이 이미 이동한 뒤
          // 이전 팝업 unmount 가 새 후보를 지우는 레이스 방지).
          remove: () => {
            if (pinRef.current === pin) setPin(null);
          },
        }}
      >
        <div className="min-w-[210px] max-w-[240px]">
          {label ? (
            <p className="text-[13px] font-bold leading-snug text-white">{label.text}</p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-amber-500" />
              위치 확인 중…
            </p>
          )}
          {/* 라벨 자체가 좌표 문자열이면 캡션 중복 생략 */}
          {(!label || label.text !== coordCaption) && (
            <p className="mt-0.5 text-[10px] font-medium tabular-nums text-slate-500">
              {coordCaption}
            </p>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 바깥 form 제출 방지
                handleAdd();
              }
            }}
            placeholder={label?.geocoded ? label.text : "경유지 이름 (선택)"}
            maxLength={80}
            aria-label="경유지 이름"
            // 데스크톱(fine pointer)만 자동 포커스 — 모바일은 키보드가 팝업을 가림.
            // ssr:false 전용 컴포넌트라 window 접근 안전.
            autoFocus={window.matchMedia("(pointer: fine)").matches}
            // 모바일 16px — iOS Safari 는 16px 미만 input 포커스 시 페이지를 강제 확대한다.
            className="mt-2 w-full rounded-lg border border-[var(--kr-line-strong)] bg-[#232933] px-2.5 py-1.5 text-[16px] font-semibold text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none sm:text-xs"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 w-full rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-[#16181d] transition-transform hover:bg-amber-400 active:scale-[0.98]"
          >
            경유지 추가
          </button>
        </div>
      </Popup>
    </>
  );
}

interface NewRouteMapProps {
  stops: DraftStop[];
  onAddStop: (name: string, lat: number, lng: number) => void;
}

export default function NewRouteMap({ stops, onAddStop }: NewRouteMapProps) {
  const path: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);

  return (
    <LeafletCanvas
      center={[36.5, 127.8]}
      zoom={7}
      scrollWheelZoom
      style={{ position: "absolute", inset: 0 }}
    >
      <FitBounds stops={stops} />

      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: "#f59e0b", opacity: 0.8, weight: 3 }} />
      )}

      {stops.map((s, i) => (
        <Marker
          key={s.tempId}
          position={[s.latitude, s.longitude]}
          icon={numberedIcon("#f59e0b", i + 1)}
          zIndexOffset={(i + 1) * 10}
        />
      ))}

      <PinDropLayer stopCount={stops.length} onAddStop={onAddStop} />
    </LeafletCanvas>
  );
}
