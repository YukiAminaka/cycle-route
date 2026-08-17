// 基本的な座標タイプ [経度, 緯度]
export type Coordinate = [number, number];

// ジオメトリ情報
export interface Geometry {
  coordinates: Coordinate[];
  type: "LineString" | "Point";
}

// 交差点の詳細情報
export interface Intersection {
  entry: boolean[];
  bearings: number[];
  duration?: number;
  mapbox_streets_v8?: {
    class: string;
  };
  is_urban?: boolean;
  admin_index: number;
  out?: number; // 出口インデックス（存在しない場合がある）
  weight?: number;
  geometry_index: number;
  location: Coordinate;
  in?: number; // 入口インデックス（始点にはない）
  turn_weight?: number;
  turn_duration?: number;
  traffic_signal?: boolean; // 信号機の有無
}

// 進行方向の指示 (Maneuver)
export interface Maneuver {
  type: string; // "depart", "turn", "arrive" など
  instruction: string;
  bearing_after: number;
  bearing_before: number;
  location: Coordinate;
  modifier?: string; // "left", "right" など（departにはない場合がある）
}

// ルートの各ステップ（曲がり角など）
export interface RouteStep {
  intersections: Intersection[];
  maneuver: Maneuver;
  name: string;
  duration: number;
  distance: number;
  driving_side: string; // "left" | "right"
  weight: number;
  mode: string; // "cycling", "driving" など
  geometry: Geometry;
}

// 行政区画情報
export interface Admin {
  iso_3166_1_alpha3: string;
  iso_3166_1: string;
}

// ルートの区間 (Leg) - 出発地から目的地（または経由地）まで
export interface RouteLeg {
  via_waypoints: unknown[]; // 具体的なデータがないため unknown[] としています
  admins: Admin[];
  weight: number;
  duration: number;
  steps: RouteStep[];
  distance: number;
  summary: string;
}

// ルート本体
export interface Route {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: RouteLeg[];
  geometry: Geometry;
}

// 経由地・目的地のスナップ情報
export interface Waypoint {
  distance: number;
  name: string;
  location: Coordinate;
}

// ルート検索レスポンス全体（ルートオブジェクト）
export interface DirectionsResponse {
  routes: Route[];
  waypoints: Waypoint[];
  code: string;
  uuid: string;
}

export interface Suggestion {
  name: string;
  context: string;
  mapbox_id: string;
}
export interface Context {
  country?: {
    country_code?: string;
    name?: string;
  };
  region?: {
    name?: string;
  };
  postcode?: {
    name?: string;
  };
  place?: {
    name?: string;
  };
}

export interface MapboxFeature {
  properties?: {
    name?: string;
    feature_type?: string;
    place_formatted?: string;
    routable_points?: Array<{
      point?: Coordinate;
    }>;
    context?: Context;
  };
  geometry?: {
    coordinates?: Coordinate;
  };
}

export interface MapboxRetrieveResult {
  coord?: Coordinate;
  label: string;
}

export interface GeocodingResult {
  type: string;
  features: MapboxFeature[];
  attribution: string;
}
