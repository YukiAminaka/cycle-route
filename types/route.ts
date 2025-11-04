/**
 * Route and navigation related type definitions
 */

export type LngLat = [number, number];

export interface Maneuver {
  type?: string;
  modifier?: string;
  location?: LngLat;
}

export interface Cue {
  order: number;
  road: string;
  distance_m: number;
  duration_s: number;
  maneuver: Maneuver;
  geometry?: GeoJSON.LineString;
}

export interface Suggestion {
  name: string;
  context: string;
  mapbox_id: string;
}

export interface MapboxFeature {
  properties?: {
    name?: string;
    place_formatted?: string;
    routable_points?: Array<{
      point?: LngLat;
    }>;
  };
  geometry?: {
    coordinates?: LngLat;
  };
}

export interface MapboxRetrieveResult {
  coord?: LngLat;
  label: string;
}

export interface MapboxSuggestOptions {
  proximity?: LngLat;
  country?: string;
  language?: string;
  limit?: number;
  types?: string;
}

export interface DirectionsRoute {
  legs?: Array<{
    steps?: DirectionsStep[];
  }>;
  geometry?: GeoJSON.LineString;
  distance?: number;
  duration?: number;
}

export interface DirectionsStep {
  name?: string;
  distance?: number;
  duration?: number;
  maneuver?: {
    type?: string;
    modifier?: string;
    location?: LngLat;
  };
  geometry?: GeoJSON.LineString;
}

export interface DirectionsResponse {
  routes?: DirectionsRoute[];
  code?: string;
  message?: string;
}

export type modifierType =
  | "uturn"
  | "sharp right"
  | "right"
  | "slight right"
  | "straight"
  | "slight left"
  | "left"
  | "sharp left";
