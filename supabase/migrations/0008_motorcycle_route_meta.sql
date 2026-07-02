-- ============================================================
--  K-Riders P1 (트래픽 전략) — 루트 메타 확장.
--  TRAFFIC-STRATEGY.md §2 근거: 이륜차 안전 배지(A) + 와인딩
--  지수(B) + 루트 유형(C). 실행 전제: 0007 적용 완료.
-- ============================================================

alter table public.motorcycle_routes
  -- 루트 유형: winding(와인딩)/touring(투어링)/offroad(임도·오프로드)/city(시내).
  add column if not exists route_type text
    check (route_type in ('winding', 'touring', 'offroad', 'city')),
  -- 와인딩 지수 0~100 — 기록 트랙의 단위거리당 방위각 변화로 저장 시 계산.
  add column if not exists winding_score numeric,
  -- 이륜차 안전 자기선언: true = 작성자가 "자동차전용도로/고속도로를 지나지
  -- 않는다"고 확인. null = 미확인(기존 데이터 포함). 자동 검증은 P3.
  add column if not exists moto_safe boolean;
