# 지역 가치 증거 레이어 — 운영 가이드

> 목적: "외국인을 지방으로 보내 외화·지역 활성화를 만든다"를 **측정·증명**하고
> 자생 BM(제휴 전환)을 수치화한다. 지원금 심사·지자체 제안용 증거.
> 데이터는 런칭+마케팅 이후 누적된다 — 지금은 계측 장치가 심어진 상태.

## 활성화 절차 (사람 단계)
런칭 전 이 4단계를 마치면 증거가 쌓이기 시작합니다.

1. **DB 마이그레이션 적용** — `supabase/migrations/0005_events.sql`
   - Supabase Dashboard → SQL Editor에 붙여넣고 실행, 또는 `supabase db push`.
   - `events` 테이블 + RLS(anon insert만, 조회 차단) 생성.
2. **서비스롤 키 추가 (대시보드 조회용)** — Vercel → Project Settings → Environment Variables
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Settings → API → `service_role` 키
   - **절대 `NEXT_PUBLIC_` 접두사 금지** (서버 전용 시크릿). 클라이언트에 노출되면 안 됨.
3. **(선택) 관리자 이메일** — 기본값은 `answlsn1@gmail.com`. 추가하려면 `ADMIN_EMAILS`(콤마 구분) 환경변수.
4. **프로덕션 배포** (사람 승인 후) → 국가코드(`country`)는 프로덕션(Vercel geo)에서만 채워짐.

## 측정 이벤트 (`events` 테이블)
클라이언트 → `POST /api/track` → 서버가 국가코드 보강 후 적재. PII 없음.

| event_type | 발사 지점 |
|---|---|
| `region_view` | 홈 지도에서 지역 필터 선택 (MapSection) |
| `route_view` | 코스 상세 진입 (RouteViewer) |
| `plan_created` | 빌더에서 장소 2개 이상 담길 때 (RouteBuilder) |
| `naver_handoff` | 네이버 지도로 길안내 시작 (코스 상세 모달 · 빌더 CTA) |
| `affiliate_click` | 스폰서 카드 예약 클릭 (SponsoredCard, 링크 자체는 불변) |

기록 필드: `session_id`(익명 랜덤), `region`, `route_id`, `locale`(언어), `country`(국가코드), `affiliate_partner`, `referrer`.

## 지표 (`/admin/metrics`, 창업자 전용)
구글 로그인 + 이메일 허용목록으로 보호. 서버에서 service_role로만 집계 조회.

1. **지역 커버리지** — 발행 코스/지역/장소 수 (실데이터)
2. **외국인 유입** — 비한국 로케일·국가 세션 비율
3. **지방 분산** — 지역별 반응 분포 + 수도권 vs 지방
4. **핵심 전환 (발견→기획→예약)** — 지역발견→코스조회→플랜→**예약(제휴 클릭)** 전환율.
   무게중심은 예약 전환이며, 원탭 길안내(핸드오프)는 commodity 기능 지표로 함께 봄.

## 가드레일 (지켜진 것)
- 제휴 링크·결제 경로 **불변** — 클릭 시점 트래킹만 추가
- RLS ON: anon insert만, 조회는 service_role(서버)만
- 시크릿 클라이언트 노출 0, 플레이스홀더·가짜 수치 0 (실 이벤트만)
- 개인정보: 집계 전용, PII 미저장 (session_id는 익명, country/locale은 거친 수준)

> 데이터가 커지면 JS 집계 → SQL RPC/머티리얼라이즈드 뷰로 전환 권장 (현재는 ≤5만건 서버 집계).
