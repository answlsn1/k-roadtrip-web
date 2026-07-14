"use client";

import { useLangStore } from "@/store/useLangStore";
import type { Lang } from "@/lib/i18n";

/* ============================================================
 * 개인정보처리방침 본문 — 언어 토글을 따르는 클라이언트 컴포넌트.
 *   법적 장문 콘텐츠는 i18n dict를 비대하게 만들므로 (RoadTripTips의
 *   프레젠테이션 콘텐츠 관례처럼) 페이지 로컬 타입 객체로 둔다.
 *   내용 원칙(런칭 헌장 §4-6 신뢰·일관성): 실제·임박한 관행만 정직하게
 *   기술한다. 하지 않는 것을 한다고, 하는 것을 안 한다고 쓰지 않는다.
 * ============================================================ */

interface Section {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  links?: { label: string; href: string }[];
}

interface PolicyContent {
  label: string;
  title: string;
  effective: string;
  intro: string;
  sections: Section[];
}

const CONTACT_EMAIL = "kroadtripapp@gmail.com";

const CONTENT: Record<Lang, PolicyContent> = {
  en: {
    label: "Privacy",
    title: "Privacy Policy",
    effective: "Effective July 12, 2026",
    intro:
      "K-RoadTrip helps travelers discover and plan road trips across Korea. We collect as little as possible — this page explains, in plain language, what we do collect and why.",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `K-RoadTrip (https://k-roadtrip.app) is a web service for discovering, planning, and booking road trips beyond Seoul. If you have any question about this policy or your data, email us at ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "Anonymous usage analytics",
        paragraphs: [
          "To understand which regions and routes travelers find useful, we log product events such as route views, plan creations, navigation handoffs to Naver Map, and clicks on affiliate booking links.",
        ],
        bullets: [
          "Events are tied to a random session identifier stored in your browser — not to an account, a name, or an email. You can browse routes and plan trips without creating any account.",
          "We derive an approximate, country-level location from the request (for example, \"visited from Germany\") to understand international usage. We do not track precise location.",
          "This data is stored with our database provider, Supabase. It is not sold and is never used to identify individuals.",
        ],
      },
      {
        heading: "Information you submit",
        paragraphs: [
          "Parts of the service include voluntary forms — the travel-companion recruitment form (/join) and the route recommendation form (/recommend). If you fill one in, we collect what you type: a name or nickname, one contact handle of your choice (KakaoTalk ID, Instagram, email, or phone number), and your answers about travel.",
          "Along with your answers, we record basic technical context — your browser type, the page you came from, and your anonymous session identifier — to protect the forms from spam.",
          `We use this only to contact you about participation and to build better routes. We delete it on request — just email ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "Optional sign-in and saved routes",
        paragraphs: [
          "Most of K-RoadTrip needs no account. If you choose to sign in with Google to keep favorite routes saved to your account (the heart button on a route page), we store your Google account email and your list of saved routes with our database provider, Supabase. We never post anything on your behalf or read anything else from your Google account.",
          "The K-Riders motorcycle community (k-roadtrip.app/motorcycle) is a separate service where members create accounts; community profiles and the routes or posts you share there are stored with Supabase as well.",
          `To delete an account or anything tied to it, email ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "Data that stays on your device",
        paragraphs: [
          "Trips you assemble in the route builder (My Trip) and the trip expense ledger live in your browser's localStorage only — they never leave your device and we cannot see them. Clearing your browser data removes them. Routes you save with the heart button while signed in are stored to your account instead, as described above.",
        ],
      },
      {
        heading: "Advertising (Google AdSense)",
        paragraphs: [
          "To keep the service free, we may show ads served by Google AdSense. Google and its partners may use cookies or device identifiers to personalize the ads you see and to measure their performance.",
          "If you visit from the EEA or the UK, you will be asked for consent before any personalized advertising is used.",
        ],
        links: [
          {
            label: "How Google uses information from sites that use its services",
            href: "https://policies.google.com/technologies/partner-sites",
          },
          {
            label: "Manage your Google ad settings",
            href: "https://adssettings.google.com",
          },
          {
            label: "Opt out of interest-based advertising (AboutAds)",
            href: "https://www.aboutads.info",
          },
        ],
      },
      {
        heading: "Affiliate links",
        paragraphs: [
          "Some booking links (for example, rental cars or flights) are affiliate links: if you book through them, we may earn a commission at no extra cost to you. Sponsored placements are always labeled.",
        ],
      },
      {
        heading: "Links to other services",
        paragraphs: [
          "K-RoadTrip links out to third-party services — such as Naver Map for navigation and partner booking sites. Once you leave our site, their own privacy policies apply; we encourage you to review them.",
        ],
      },
      {
        heading: "We don't sell your data",
        paragraphs: [
          "We do not sell personal data. We do not share the information you submit with third parties, except as needed to operate the service (for example, our database provider) or where required by law.",
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "As the service evolves, we may update this policy. Changes will be posted on this page with an updated effective date.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions, deletion requests, or anything that isn't clear — send us an email. We read everything.",
        ],
        links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
      },
    ],
  },
  ko: {
    label: "개인정보",
    title: "개인정보처리방침",
    effective: "시행일: 2026년 7월 12일",
    intro:
      "K-RoadTrip은 한국 지방 로드트립을 발견하고 계획하도록 돕는 서비스입니다. 저희는 꼭 필요한 최소한의 정보만 수집합니다 — 무엇을, 왜 수집하는지 이 페이지에서 쉽게 설명합니다.",
    sections: [
      {
        heading: "저희는 누구인가요",
        paragraphs: [
          `K-RoadTrip(https://k-roadtrip.app)은 서울 너머의 로드트립을 발견·계획·예약하도록 돕는 웹 서비스입니다. 이 방침이나 내 정보에 대해 궁금한 점이 있으면 ${CONTACT_EMAIL} 로 문의해 주세요.`,
        ],
      },
      {
        heading: "익명 사용 분석",
        paragraphs: [
          "여행자들이 어떤 지역과 코스를 유용하게 쓰는지 파악하기 위해 코스 조회, 일정 생성, 네이버 지도 길안내 연결, 제휴 예약 링크 클릭 같은 제품 이벤트를 기록합니다.",
        ],
        bullets: [
          "이벤트는 브라우저에 저장되는 무작위 세션 식별자에만 연결됩니다 — 계정·이름·이메일과 연결되지 않습니다. 코스 둘러보기와 여행 계획은 계정 없이 이용할 수 있습니다.",
          "해외 이용 현황을 파악하기 위해 접속 요청에서 국가 수준의 대략적인 위치(예: \"독일에서 접속\")만 파악합니다. 정밀한 위치는 추적하지 않습니다.",
          "이 데이터는 데이터베이스 제공사인 Supabase에 저장되며, 판매되지 않고, 개인을 식별하는 데 사용되지 않습니다.",
        ],
      },
      {
        heading: "직접 제출하시는 정보",
        paragraphs: [
          "서비스 일부에는 자발적으로 작성하는 양식이 있습니다 — 여행 동행단 모집 양식(/join)과 코스 추천 양식(/recommend)입니다. 양식을 작성하시면 입력하신 내용, 즉 이름 또는 닉네임, 직접 선택한 연락 수단 하나(카카오톡 ID, 인스타그램, 이메일 또는 전화번호), 여행 관련 답변을 수집합니다.",
          "답변과 함께, 양식을 스팸으로부터 보호하기 위한 기본적인 기술 정보 — 브라우저 종류, 유입 페이지, 익명 세션 식별자 — 를 함께 기록합니다.",
          `이 정보는 참여 안내 연락과 더 나은 코스 제작에만 사용합니다. 삭제를 원하시면 ${CONTACT_EMAIL} 로 메일 한 통이면 됩니다.`,
        ],
      },
      {
        heading: "선택적 로그인과 저장한 코스",
        paragraphs: [
          "K-RoadTrip 대부분은 계정 없이 이용할 수 있습니다. 마음에 드는 코스를 계정에 저장하기 위해(코스 페이지의 하트 버튼) Google 로그인을 선택하시면, Google 계정 이메일과 저장한 코스 목록을 데이터베이스 제공사인 Supabase에 저장합니다. 저희가 회원님 명의로 무언가를 게시하거나 Google 계정의 다른 정보를 읽는 일은 없습니다.",
          "K-Riders 모터사이클 커뮤니티(k-roadtrip.app/motorcycle)는 회원 가입으로 운영되는 별도 서비스입니다. 커뮤니티 프로필과 그곳에서 공유하시는 루트·게시글도 Supabase에 저장됩니다.",
          `계정이나 계정에 연결된 정보의 삭제를 원하시면 ${CONTACT_EMAIL} 로 문의해 주세요.`,
        ],
      },
      {
        heading: "기기에만 저장되는 데이터",
        paragraphs: [
          "루트 빌더에서 직접 구성한 여행(My Trip)과 여행경비 기록부는 브라우저의 localStorage에만 저장됩니다 — 기기를 떠나지 않으며 저희도 볼 수 없습니다. 브라우저 데이터를 지우면 함께 삭제됩니다. 로그인 상태에서 하트 버튼으로 저장한 코스는 위에서 설명한 대로 계정에 저장됩니다.",
        ],
      },
      {
        heading: "광고 (Google 애드센스)",
        paragraphs: [
          "서비스를 무료로 유지하기 위해 Google 애드센스가 제공하는 광고를 표시할 수 있습니다. Google과 그 파트너는 쿠키나 기기 식별자를 사용해 표시되는 광고를 맞춤화하고 성과를 측정할 수 있습니다.",
          "EEA(유럽경제지역)·영국에서 접속하시는 경우, 맞춤 광고가 사용되기 전에 먼저 동의를 여쭙습니다.",
        ],
        links: [
          {
            label: "Google이 정보를 사용하는 방식",
            href: "https://policies.google.com/technologies/partner-sites",
          },
          {
            label: "Google 광고 설정 관리",
            href: "https://adssettings.google.com",
          },
          {
            label: "관심 기반 광고 수신 거부 (AboutAds)",
            href: "https://www.aboutads.info",
          },
        ],
      },
      {
        heading: "제휴 링크",
        paragraphs: [
          "일부 예약 링크(예: 렌터카, 항공권)는 제휴 링크입니다. 이 링크를 통해 예약하시면 추가 비용 없이 저희에게 수수료가 발생할 수 있습니다. 스폰서 콘텐츠에는 항상 표시가 붙습니다.",
        ],
      },
      {
        heading: "외부 서비스 링크",
        paragraphs: [
          "K-RoadTrip은 길안내를 위한 네이버 지도, 파트너 예약 사이트 등 외부 서비스로 연결됩니다. 저희 사이트를 벗어난 뒤에는 해당 서비스의 개인정보처리방침이 적용되니 함께 확인해 주세요.",
        ],
      },
      {
        heading: "개인정보를 판매하지 않습니다",
        paragraphs: [
          "저희는 개인정보를 판매하지 않습니다. 서비스 운영에 필요한 경우(예: 데이터베이스 제공사)나 법령상 요구되는 경우를 제외하고, 제출하신 정보를 제3자에게 제공하지 않습니다.",
        ],
      },
      {
        heading: "정책 변경",
        paragraphs: [
          "서비스가 발전함에 따라 이 방침은 업데이트될 수 있습니다. 변경 사항은 갱신된 시행일과 함께 이 페이지에 게시됩니다.",
        ],
      },
      {
        heading: "문의하기",
        paragraphs: [
          "궁금한 점, 삭제 요청, 불명확한 내용 — 무엇이든 메일로 보내주세요. 빠짐없이 읽습니다.",
        ],
        links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
      },
    ],
  },
};

export default function PrivacyContent() {
  const lang = useLangStore((s) => s.lang);
  const c = CONTENT[lang];

  return (
    // Navbar(fixed h-16) 아래로 여백 확보 — 읽기 좋은 단일 칼럼.
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-600">
        {c.label}
      </p>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
        {c.title}
      </h1>
      <p className="mt-3 text-sm font-semibold text-slate-500">{c.effective}</p>
      <p className="mt-5 text-base leading-relaxed text-slate-600">{c.intro}</p>

      {c.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {section.links && (
            <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-ink hover:decoration-slate-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
