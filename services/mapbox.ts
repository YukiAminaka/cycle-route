import { GeocodingResult, MapboxFeature } from "@/types/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

/**
 * Mapbox Static Images APIのURLを生成する
 *
 * @param polyline - Google Polyline形式のエンコードされたルート
 * @param options - 画像生成オプション
 * @returns Static Images APIのURL
 */
export function getMapboxStaticImageUrl(
  polyline: string,
  options: {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    padding?: number;
    style?: string;
  } = {},
): string {
  const token = validateToken();

  const {
    width = 400,
    height = 225,
    strokeColor = "3b82f6", // blue-500
    strokeOpacity = 1,
    strokeWidth = 3,
    padding = 50,
    style = "mapbox/outdoors-v12",
  } = options;

  // Polylineをパスオーバーレイとしてエンコード
  // 形式: path-{strokeWidth}+{strokeColor}({polyline})
  const encodedPolyline = encodeURIComponent(polyline);
  const pathOverlay = `path-${strokeWidth}+${strokeColor}-${strokeOpacity}(${encodedPolyline})`;

  // autoでルート全体が収まるように自動調整
  return `https://api.mapbox.com/styles/v1/${style}/static/${pathOverlay}/auto/${width}x${height}?padding=${padding}&access_token=${token}`;
}

/**
 * Mapbox Static Images APIのURLを生成する（ピンマーカー付き）
 *
 * @param longitude - 経度
 * @param latitude - 緯度
 * @param options - 画像生成オプション
 * @returns Static Images APIのURL
 */
export function getMapboxStaticPinImageUrl(
  longitude: number,
  latitude: number,
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    pinColor?: string;
    style?: string;
  } = {},
): string {
  const token = validateToken();

  const {
    width = 400,
    height = 225,
    zoom = 13,
    pinColor = "F52738",
    style = "mapbox/streets-v12",
  } = options;

  const marker = `pin-l+${pinColor}(${longitude},${latitude})`;
  const center = `${longitude},${latitude},${zoom}`;

  return `https://api.mapbox.com/styles/v1/${style}/static/${marker}/${center}/${width}x${height}?access_token=${token}`;
}

export type ReverseGeocodeResult = {
  country_code: string;
  administrative_area: string;
  locality: string;
  postal_code: string;
};

/**
 * Reverse geocodes coordinates to address components using Mapbox Geocoding API
 *
 * @param longitude - Longitude
 * @param latitude - Latitude
 * @returns Address components or null if not found
 */
export async function mapboxReverseGeocode(
  longitude: number,
  latitude: number,
): Promise<ReverseGeocodeResult | null> {
  const token = validateToken();

  const params = new URLSearchParams({
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    access_token: token,
    language: "ja",
    // types: "country,region,postcode,place",
  });

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/reverse?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Mapbox Geocoding API error: ${response.status}`);
  }

  const data: GeocodingResult = await response.json();
  console.log(data);

  const features: MapboxFeature[] = data.features;

  if (!features || features.length === 0) return null;

  const ctx = features[0]!.properties?.context ?? {};

  return {
    country_code: ctx.country?.country_code?.toUpperCase() ?? "",
    administrative_area: ctx.region?.name ?? "",
    locality: ctx.place?.name ?? "",
    postal_code: ctx.postcode?.name ?? "",
  };
}

/**
 * Validates that the Mapbox API token is available
 * @throws Error if token is missing
 */
function validateToken(): string {
  if (!MAPBOX_TOKEN) {
    throw new Error("NEXT_PUBLIC_MAPBOX_KEY is not configured");
  }
  return MAPBOX_TOKEN;
}
