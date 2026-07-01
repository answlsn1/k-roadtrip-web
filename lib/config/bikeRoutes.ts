/* ============================================================
 * Bike-RoadTrip — 국토종주 자전거길 실데이터.
 *   대한민국 행정안전부/K-water 가 실제로 조성·운영하는 전국 자전거
 *   종주 노선(12개) + 인증센터 시스템을 기반으로 한다. CLAUDE.md §5
 *   하드룰(더미 0)에 따라 좌표·거리·인증센터명은 공식 노선 정보를
 *   기준으로 하되, 개별 인증센터는 확인 가능한 대표 지점만 표기했다
 *   (전체 90여 개소를 다 나열하지 않음 — 과장된 정확성 주장 방지).
 *   사진 없이 아이콘·그라데이션 카드로 구성(실제 검증 안 된 사진을
 *   특정 노선 사진인 양 붙이는 것을 피하기 위한 의도적 선택).
 * ============================================================ */

export type BikeCategory = "river" | "coastal" | "mountain" | "island";
export type BikeDifficulty = "easy" | "moderate" | "challenging";

export interface CertCenter {
  name_en: string;
  name_ko: string;
}

export interface BikeRoute {
  slug: string;
  name_en: string;
  name_ko: string;
  region_en: string;
  region_ko: string;
  distanceKm: number;
  category: BikeCategory;
  difficulty: BikeDifficulty;
  icon: string;
  gradient: string; // tailwind gradient classes for the card
  summary_en: string;
  summary_ko: string;
  highlights_en: string[];
  highlights_ko: string[];
  /** 대표 인증센터 2~4곳(시작·주요 경유·종점) — 전 구간 나열 아님. */
  certCenters: CertCenter[];
  /** 4대강(한강·낙동강·금강·영산강) 완주 메달 대상 노선인지. */
  fourRivers: boolean;
}

export const BIKE_ROUTES: BikeRoute[] = [
  {
    slug: "ara",
    name_en: "Ara Bikeway",
    name_ko: "아라자전거길",
    region_en: "Incheon",
    region_ko: "인천",
    distanceKm: 21,
    category: "river",
    difficulty: "easy",
    icon: "⛴️",
    gradient: "from-sky-500 to-cyan-400",
    summary_en:
      "The gateway to Korea's cross-country cycling network. A short, flat canal path from the Yellow Sea to the Han River — most riders buy their certification passport here and start the ride to Busan.",
    summary_ko:
      "국토종주 자전거길의 관문. 서해에서 한강까지 이어지는 짧고 평탄한 운하 길로, 대부분의 라이더가 여기서 인증수첩을 사고 부산까지의 여정을 시작합니다.",
    highlights_en: [
      "Classic start of the Incheon→Busan cross-country ride",
      "Flat, fully paved canal-side path",
      "Buy your certification passport at the West Sea Lock",
    ],
    highlights_ko: [
      "인천→부산 국토종주의 전통적인 출발점",
      "평탄하게 포장된 운하 옆길",
      "서해갑문에서 인증수첩 구매 가능",
    ],
    certCenters: [
      { name_en: "Ara West Sea Lock", name_ko: "아라 서해갑문" },
      { name_en: "Ara Han River Lock", name_ko: "아라 한강갑문" },
    ],
    fourRivers: false,
  },
  {
    slug: "hangang",
    name_en: "Han River Bikeway",
    name_ko: "한강종주자전거길",
    region_en: "Seoul · Gyeonggi",
    region_ko: "서울·경기",
    distanceKm: 192,
    category: "river",
    difficulty: "easy",
    icon: "🌉",
    gradient: "from-emerald-500 to-teal-400",
    summary_en:
      "Korea's most-ridden bike path — straight through the heart of Seoul along the Han River, past Yeouido and the Jamsil area, before continuing upriver to Paldang where the route splits toward the mountains or the north.",
    summary_ko:
      "한국에서 가장 많이 달리는 자전거길. 여의도·잠실을 지나 서울 도심을 관통하고, 팔당에서 새재(산길) 방향과 북한강 방향으로 갈라집니다.",
    highlights_en: [
      "Runs straight through downtown Seoul, Yeouido Hangang Park",
      "Fully flat, wide, well-signed — great first day for beginners",
      "Ends at Paldang, where the route forks toward Chuncheon or the Saejae mountain pass",
    ],
    highlights_ko: [
      "서울 도심·여의도 한강공원 관통",
      "평탄하고 넓은 길, 초심자에게도 부담 없는 첫날 코스",
      "팔당에서 춘천 방향과 새재 고갯길 방향으로 분기",
    ],
    certCenters: [
      { name_en: "Ara Han River Lock", name_ko: "아라 한강갑문" },
      { name_en: "Yeouido", name_ko: "여의도" },
      { name_en: "Paldang Bridge", name_ko: "팔당대교" },
    ],
    fourRivers: true,
  },
  {
    slug: "bukhangang",
    name_en: "North Han River Bikeway",
    name_ko: "북한강자전거길",
    region_en: "Gyeonggi · Gangwon",
    region_ko: "경기·강원",
    distanceKm: 70,
    category: "river",
    difficulty: "easy",
    icon: "🚞",
    gradient: "from-lime-500 to-green-400",
    summary_en:
      "A favorite weekend escape from Seoul, following an old railway line up the North Han River toward Chuncheon — some stretches even reuse repurposed train tunnels and bridges.",
    summary_ko:
      "서울에서 즐겨 찾는 주말 라이딩 코스. 옛 철도 노선을 따라 북한강을 거슬러 춘천까지 이어지며, 일부 구간은 폐선된 철길·터널을 그대로 재활용했습니다.",
    highlights_en: [
      "Repurposed rail-trail sections with real train tunnels",
      "Forested riverside scenery, popular day trip from Seoul",
      "Ends near Chuncheon, famous for dak-galbi (spicy stir-fried chicken)",
    ],
    highlights_ko: [
      "옛 철길·터널을 재활용한 구간",
      "숲이 우거진 강변 풍경, 서울 근교 인기 당일 코스",
      "닭갈비로 유명한 춘천 인근에서 종료",
    ],
    certCenters: [
      { name_en: "Saetgangyo", name_ko: "샛터삼거리" },
      { name_en: "Chuncheon", name_ko: "춘천" },
    ],
    fourRivers: false,
  },
  {
    slug: "saejae",
    name_en: "Saejae Bikeway",
    name_ko: "새재자전거길",
    region_en: "Chungbuk · Gyeongbuk",
    region_ko: "충북·경북",
    distanceKm: 100,
    category: "mountain",
    difficulty: "challenging",
    icon: "⛰️",
    gradient: "from-orange-500 to-amber-400",
    summary_en:
      "The one true climb of the whole cross-country route — over the Ihwaryeong Pass connecting the Han River watershed to the Nakdong River watershed. Steep, legendary, and the most talked-about section among riders.",
    summary_ko:
      "국토종주 전 구간 중 유일한 진짜 오르막. 한강과 낙동강 수계를 잇는 이화령 고개를 넘으며, 라이더들 사이에서 가장 많이 회자되는 전설의 구간입니다.",
    highlights_en: [
      "Ihwaryeong Pass — the toughest single climb on the national bike network",
      "Historic Mungyeong Saejae area, a former Joseon-era mountain road",
      "The certification center at the summit is a badge of honor to reach",
    ],
    highlights_ko: [
      "이화령 고개 — 국토종주 최고 난도 구간",
      "조선시대 옛길이 남아 있는 문경새재 인근",
      "정상 인증센터 도장이 곧 완주의 자부심",
    ],
    certCenters: [
      { name_en: "Tangeumdae, Chungju", name_ko: "충주 탄금대" },
      { name_en: "Ihwaryeong Pass (summit)", name_ko: "이화령마루" },
      { name_en: "Mungyeong", name_ko: "문경" },
    ],
    fourRivers: false,
  },
  {
    slug: "nakdonggang",
    name_en: "Nakdong River Bikeway",
    name_ko: "낙동강자전거길",
    region_en: "Gyeongbuk · Gyeongnam · Busan",
    region_ko: "경북·경남·부산",
    distanceKm: 385,
    category: "river",
    difficulty: "moderate",
    icon: "🏁",
    gradient: "from-blue-600 to-indigo-500",
    summary_en:
      "The longest single route in the network, and the final stretch of the Incheon-to-Busan crossing. Rolls through Gumi and Daegu before finishing at the Nakdong River Estuary Bank — the official finish line.",
    summary_ko:
      "전체 노선 중 가장 긴 구간이자, 인천에서 부산까지 국토종주의 마지막 여정. 구미·대구를 지나 낙동강하구둑에서 끝나는, 국토종주의 공식 결승점입니다.",
    highlights_en: [
      "The official finish line of the Incheon→Busan cross-country ride",
      "Passes Gumi and Daegu (Gangjeong-Goryeong Weir)",
      "Ends at the Nakdong River Estuary Bank in Busan, by the sea",
    ],
    highlights_ko: [
      "인천→부산 국토종주의 공식 결승점",
      "구미·대구 강정고령보 경유",
      "부산 바닷가, 낙동강하구둑에서 종료",
    ],
    certCenters: [
      { name_en: "Sangpunggyo, Sangju", name_ko: "상주 상풍교" },
      { name_en: "Gangjeong-Goryeong Weir", name_ko: "강정고령보" },
      { name_en: "Nakdong River Estuary Bank", name_ko: "낙동강하구둑" },
    ],
    fourRivers: true,
  },
  {
    slug: "geumgang",
    name_en: "Geum River Bikeway",
    name_ko: "금강자전거길",
    region_en: "Daejeon · Sejong · Chungnam · Jeonbuk",
    region_ko: "대전·세종·충남·전북",
    distanceKm: 146,
    category: "river",
    difficulty: "easy",
    icon: "🌾",
    gradient: "from-teal-500 to-emerald-400",
    summary_en:
      "One of Korea's official Four Rivers routes — a calm ride from Daecheong Dam past Sejong's riverside government district, finishing at the Geum River Estuary near Gunsan.",
    summary_ko:
      "공식 4대강 노선 중 하나. 대청댐에서 시작해 세종시 정부청사 강변을 지나, 군산 인근 금강하구둑에서 끝나는 잔잔한 라이딩 코스입니다.",
    highlights_en: [
      "Part of the Four Rivers certification medal",
      "Passes Sejong's riverside government complex",
      "Ends at the Geum River Estuary Bank near Gunsan",
    ],
    highlights_ko: [
      "4대강 완주 메달 대상 노선",
      "세종시 정부청사 강변 경유",
      "군산 인근 금강하구둑에서 종료",
    ],
    certCenters: [
      { name_en: "Daecheong Dam", name_ko: "대청댐" },
      { name_en: "Sejong Weir", name_ko: "세종보" },
      { name_en: "Geum River Estuary Bank", name_ko: "금강하구둑" },
    ],
    fourRivers: true,
  },
  {
    slug: "yeongsangang",
    name_en: "Yeongsan River Bikeway",
    name_ko: "영산강자전거길",
    region_en: "Jeonnam",
    region_ko: "전남",
    distanceKm: 133,
    category: "river",
    difficulty: "easy",
    icon: "🎍",
    gradient: "from-green-600 to-lime-500",
    summary_en:
      "The southernmost of the Four Rivers routes, starting near Damyang's famous bamboo forests and finishing toward Mokpo's coastline.",
    summary_ko:
      "4대강 노선 중 가장 남쪽. 담양의 유명한 대나무숲 인근에서 시작해 목포 해안 방향으로 이어집니다.",
    highlights_en: [
      "Part of the Four Rivers certification medal",
      "Starts near Damyang's bamboo forest region",
      "Finishes toward Mokpo, on Korea's southwest coast",
    ],
    highlights_ko: [
      "4대강 완주 메달 대상 노선",
      "담양 대나무숲 인근에서 출발",
      "한국 서남해안 목포 방향으로 종료",
    ],
    certCenters: [
      { name_en: "Damyang Dam", name_ko: "담양댐" },
      { name_en: "Naju Bridge", name_ko: "나주대교" },
      { name_en: "Yeongsan River Estuary Bank", name_ko: "영산강하구둑" },
    ],
    fourRivers: true,
  },
  {
    slug: "seomjingang",
    name_en: "Seomjin River Bikeway",
    name_ko: "섬진강자전거길",
    region_en: "Jeonbuk · Jeonnam · Gyeongnam",
    region_ko: "전북·전남·경남",
    distanceKm: 149,
    category: "river",
    difficulty: "moderate",
    icon: "🌸",
    gradient: "from-pink-500 to-rose-400",
    summary_en:
      "Often called the most scenic river path in the network — not one of the official Four Rivers, but a newer addition riders add on for Hadong's famous spring blossom road along the water.",
    summary_ko:
      "노선 전체 중 가장 경치가 좋다는 평이 많은 코스. 공식 4대강은 아니지만, 하동의 유명한 벚꽃길을 강변으로 지나는 구간이 있어 많은 라이더가 추가로 완주합니다.",
    highlights_en: [
      "Widely considered the most scenic single route in the network",
      "Passes Hadong's spring cherry-blossom road along the river",
      "Not part of the Four Rivers medal, but a Grand Slam requirement",
    ],
    highlights_ko: [
      "노선 중 가장 경치 좋다는 평가",
      "하동 벚꽃길 강변 구간 통과",
      "4대강 메달 대상은 아니지만 그랜드슬램 필수 구간",
    ],
    certCenters: [
      { name_en: "Imsil", name_ko: "임실" },
      { name_en: "Amnok", name_ko: "압록" },
      { name_en: "Namdo Bridge, Hadong", name_ko: "남도대교" },
    ],
    fourRivers: false,
  },
  {
    slug: "ocheon",
    name_en: "Ocheon Bikeway",
    name_ko: "오천자전거길",
    region_en: "Chungbuk · Sejong",
    region_ko: "충북·세종",
    distanceKm: 105,
    category: "river",
    difficulty: "easy",
    icon: "🌿",
    gradient: "from-cyan-500 to-teal-400",
    summary_en:
      "A quieter inland connector route through the Cheongju–Sejong river system — less famous than the Four Rivers, but a peaceful, low-traffic ride for those exploring the central region at their own pace.",
    summary_ko:
      "청주·세종 수계를 잇는 비교적 조용한 내륙 연결 코스. 4대강만큼 유명하진 않지만, 차분하게 중부 지방을 달리고 싶은 라이더에게 좋은 선택지입니다.",
    highlights_en: [
      "Quiet, low-traffic inland route",
      "Connects the central Cheongju–Sejong river system",
      "A relaxed option away from the busier Four Rivers routes",
    ],
    highlights_ko: [
      "한적하고 차량 통행이 적은 내륙 코스",
      "청주·세종 수계를 연결",
      "번잡한 4대강 노선 대비 여유로운 선택지",
    ],
    certCenters: [{ name_en: "Ocheon river system", name_ko: "오천 수계 일대" }],
    fourRivers: false,
  },
  {
    slug: "donghae-gangwon",
    name_en: "East Sea Bikeway (Gangwon)",
    name_ko: "동해안자전거길 강원구간",
    region_en: "Gangwon",
    region_ko: "강원",
    distanceKm: 242,
    category: "coastal",
    difficulty: "moderate",
    icon: "🌊",
    gradient: "from-blue-500 to-sky-400",
    summary_en:
      "Starting near the DMZ at Goseong's Unification Observatory, this route hugs the East Sea coastline south through Sokcho and Gangneung — open ocean views for almost the entire ride.",
    summary_ko:
      "고성 통일전망대 인근, DMZ 근처에서 시작해 속초·강릉을 지나 남쪽으로 이어지는 동해안 라이딩. 거의 전 구간에서 탁 트인 바다를 보며 달릴 수 있습니다.",
    highlights_en: [
      "Starts near the DMZ at Goseong Unification Observatory",
      "Passes Sokcho and Gangneung along the open coast",
      "Near-constant ocean views, some short coastal climbs",
    ],
    highlights_ko: [
      "고성 통일전망대, DMZ 인근에서 시작",
      "속초·강릉 해안 경유",
      "거의 전 구간 오션뷰, 일부 짧은 해안 오르막",
    ],
    certCenters: [
      { name_en: "Goseong Unification Observatory", name_ko: "고성 통일전망대" },
      { name_en: "Sokcho", name_ko: "속초" },
      { name_en: "Gangneung", name_ko: "강릉" },
    ],
    fourRivers: false,
  },
  {
    slug: "donghae-gyeongbuk",
    name_en: "East Sea Bikeway (Gyeongbuk)",
    name_ko: "동해안자전거길 경북구간",
    region_en: "Gyeongbuk",
    region_ko: "경북",
    distanceKm: 76,
    category: "coastal",
    difficulty: "moderate",
    icon: "🦀",
    gradient: "from-red-500 to-orange-400",
    summary_en:
      "The southern continuation of the East Sea coastal path, running through Uljin and Yeongdeok — the latter famous nationwide for its snow crab — down toward Pohang.",
    summary_ko:
      "동해안 자전거길의 남쪽 연장 구간. 울진과 대게로 유명한 영덕을 지나 포항 방향으로 이어집니다.",
    highlights_en: [
      "Continues the East Coast path south from Gangwon",
      "Passes Uljin and Yeongdeok, Korea's snow crab town",
      "Dramatic cliffside sections toward Pohang",
    ],
    highlights_ko: [
      "강원구간에서 남쪽으로 이어지는 연장 코스",
      "울진, 대게로 유명한 영덕 경유",
      "포항 방향 절벽 해안 절경 구간",
    ],
    certCenters: [
      { name_en: "Uljin", name_ko: "울진" },
      { name_en: "Yeongdeok", name_ko: "영덕" },
    ],
    fourRivers: false,
  },
  {
    slug: "jeju",
    name_en: "Jeju Round-Island Bikeway",
    name_ko: "제주환상자전거길",
    region_en: "Jeju",
    region_ko: "제주",
    distanceKm: 234,
    category: "island",
    difficulty: "easy",
    icon: "🏝️",
    gradient: "from-amber-400 to-emerald-400",
    summary_en:
      "The most popular standalone route for travelers who don't want the full cross-country trek — a flat coastal loop around the entire island, passing Seongsan Ilchulbong, splittable over 3–5 easy days.",
    summary_ko:
      "전체 국토종주를 다 하지 않아도 되는, 가장 인기 있는 단독 코스. 성산일출봉을 지나는 평탄한 섬 일주 해안길로, 3~5일에 나눠 여유롭게 즐길 수 있습니다.",
    highlights_en: [
      "The most popular route for short-trip visitors — no mainland travel needed",
      "Passes Seongsan Ilchulbong, a UNESCO World Heritage site",
      "Flat coastal loop, easily split across 3–5 relaxed days",
    ],
    highlights_ko: [
      "짧은 여행자에게 가장 인기 — 육지 이동 없이 완결",
      "유네스코 세계유산 성산일출봉 경유",
      "평탄한 해안 일주, 3~5일 여유롭게 분할 가능",
    ],
    certCenters: [
      { name_en: "Jeju City Hall", name_ko: "제주시청" },
      { name_en: "Seongsan Ilchulbong", name_ko: "성산일출봉" },
      { name_en: "Jungmun", name_ko: "중문" },
    ],
    fourRivers: false,
  },
];

export function getBikeRoute(slug: string): BikeRoute | undefined {
  return BIKE_ROUTES.find((r) => r.slug === slug);
}

export const TOTAL_BIKE_KM = BIKE_ROUTES.reduce((sum, r) => sum + r.distanceKm, 0);
export const FOUR_RIVERS_SLUGS = BIKE_ROUTES.filter((r) => r.fourRivers).map((r) => r.slug);
