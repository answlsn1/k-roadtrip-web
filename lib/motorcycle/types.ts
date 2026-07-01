// K-Riders(모터사이클) 도메인 타입 — 메인 K-RoadTrip 타입(lib/types.ts)과 분리.

export interface MotorcycleProfile {
  id: string; // auth.users.id
  nickname: string;
  bike_model: string | null;
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
}
