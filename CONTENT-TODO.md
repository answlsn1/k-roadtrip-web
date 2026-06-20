# CONTENT-TODO — 런칭 전 실데이터 삽입 체크리스트

> 코드 쪽 **빈 슬롯 + graceful 폴백**은 준비됐습니다. 아래를 채우면 런칭 블로커
> C1·C2·C3가 해소됩니다. **하드룰(CLAUDE.md §5): 프로덕션 경로에 샘플/플레이스홀더
> 미디어·죽은 링크 금지.** 실제·현지검증·자체호스팅 콘텐츠만 넣으세요.
>
> 슬롯이 비어 있어도 화면은 안 깨집니다(영상 없으면 포스터만, 스폰서 없으면 행 숨김).

## C1 · 코스 영상 (자체 호스팅 한국 영상)
파일: [lib/config/cardMeta.ts](lib/config/cardMeta.ts) → `ROUTE_VIDEO_URLS`
모든 샘플 URL(MDN / Big Buck Bunny / learningcontainer)은 제거됨. 슬러그별로 채우세요.

- [ ] `gangneung-coastal-drive`
- [ ] `gyeongju-heritage-loop`
- [ ] `jeju-volcanic-loop`
- [ ] `busan-coastal-metropolis`
- [ ] `andong-scholars-riverside-drive`
- [ ] `gyeongju-ancient-capital-drive`
- [ ] `jeonju-wanju-hanok-drive`

> 장기: `routes.video_url` 컬럼으로 이전 권장 → **마이그레이션 = 사람 승인 필요**(훅이 차단).

## C2 · 제휴 링크 (매출 funnel)
파일: [lib/config/sponsored.ts](lib/config/sponsored.ts) → 각 파트너의 `affiliate_url`
- [ ] 렌터카 제휴 링크 (추적/레퍼럴 파라미터 포함)
- [ ] 항공 제휴 링크 (추적/레퍼럴 파라미터 포함)
- [ ] (선택) `cta_label_en` / `cta_label_ko`로 버튼 문구 커스텀
- [ ] 클릭 → 파트너 → 결제까지 실제로 끝까지 테스트
- [ ] **전환 추적**: `affiliate_click` 이벤트 기록 — `route_events.event_type` 확장
      필요(= 마이그레이션 + 승인). 현재 [SponsoredCard.tsx](components/home/SponsoredCard.tsx)
      `handleBook`에 `TODO(revenue)`로 자리만 잡아둠.

> `affiliate_url`이 비면 예약 버튼은 안 뜸(죽은 링크 방지).

## C3 · 스폰서 데이터
파일: [lib/config/sponsored.ts](lib/config/sponsored.ts) → `SPONSORED_PLACES` (현재 `[]`)
- [ ] 실제·현지검증 파트너로 채우기 (파일 상단 주석 템플릿 사용)
- [ ] 각 항목 `thumbnail_url` = 실제 이미지, `video_url` = 자체호스팅(또는 빈값=포스터)

> 비어 있으면 홈 "⭐ Sponsored Picks" 행 전체가 숨겨짐. 장기: Supabase
> `sponsored_places` 테이블로 이전 권장 → **마이그레이션 = 승인 필요**.

## SEO · 공유 이미지 (선택, 바이너리 에셋)
- [ ] `app/opengraph-image.png` (1200×630) 추가 — 카카오톡/X/슬랙 공유 카드용.
      텍스트 OG 메타데이터(title·description·twitter card)와 SVG 파비콘은 이미
      적용됨. 코드 생성(`next/og`)은 Windows 로컬에서 폰트 경로 버그로 빠져서,
      디자인된 PNG를 직접 넣는 방식을 권장.

## 관련 해소됨 (코드 완료)
- C4 "광고 없음" 모순 → 카피 수정 + disclosure 추가 (정직한 스폰서 모델)
- C5 제휴 disclosure → 푸터 + 스폰서 행에 노출
- i18n: 루트상세·빌더·모든 모달·지도섹션·에러/404 한국어 토글 동작 + 카드 배지/검색 placeholder 누출 수정
- 첫인상: 브랜드 파비콘(SVG), 로딩 스켈레톤, robots.txt·sitemap.xml, 운영자 언어 노출 제거
