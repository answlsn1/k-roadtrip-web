// K-Riders(모터사이클) 도메인 타입 — 메인 K-RoadTrip 타입(lib/types.ts)과 분리.

export interface MotorcycleProfile {
  id: string; // auth.users.id
  nickname: string;
  bike_model: string | null;
  bio: string | null;
  created_at: string;
}

export interface MotorcycleRouteStop {
  id: string;
  route_id: string;
  sequence: number;
  name: string;
  latitude: number;
  longitude: number;
  note: string | null;
}

export interface MotorcycleRoute {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  region: string | null;
  distance_km: number | null;
  is_public: boolean;
  /** 주행 기록 모드가 남긴 GPS 폴리라인 [[lat,lng],...] — 수동 작성 루트는 null.
   *  목록 쿼리는 페이로드 절약을 위해 이 필드를 select 하지 않는다(null). */
  track_points: [number, number][] | null;
  duration_min: number | null;
  /** 루트 유형(routeTypes.ts) — winding/touring/offroad/city. */
  route_type: string | null;
  /** 와인딩 지수 0~100(windingScore.ts) — 트랙 없는 루트는 null. */
  winding_score: number | null;
  /** 이륜차 안전 자기선언 — true=자동차전용도로/고속도로 미경유 확인. null=미확인. */
  moto_safe: boolean | null;
  created_at: string;
}

/** 피드/상세에서 쓰는, 작성자 닉네임까지 조인된 형태. */
export interface MotorcycleRouteWithAuthor extends MotorcycleRoute {
  author_nickname: string;
}

export interface MotorcycleRouteWithStops extends MotorcycleRouteWithAuthor {
  stops: MotorcycleRouteStop[];
}

export interface MotorcycleChatMessage {
  id: string;
  user_id: string;
  nickname: string;
  body: string;
  created_at: string;
}

/** 새 루트 생성 입력 — createRoute() 인자. */
export interface NewMotorcycleRoute {
  title: string;
  description?: string | null;
  region?: string | null;
  isPublic: boolean;
  stops: { name: string; latitude: number; longitude: number; note?: string | null }[];
  /** 주행 기록 모드 전용 — 있으면 거리를 트랙 기준으로 계산해 저장. */
  trackPoints?: [number, number][] | null;
  durationMin?: number | null;
  /** 루트 유형(routeTypes.ts 값) — 미선택 시 null. */
  routeType?: string | null;
  /** 이륜차 안전 자기선언 체크 여부 — 체크 안 하면 null(false 가 아님: 미확인). */
  motoSafe?: boolean | null;
}

/** 루트에 붙는 소셜 집계(좋아요·댓글) — getSocialForRoutes() 반환 단위. */
export interface RouteSocial {
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
}

export interface MotorcycleComment {
  id: string;
  route_id: string;
  user_id: string;
  nickname: string;
  body: string;
  created_at: string;
}
