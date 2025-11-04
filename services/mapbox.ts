import {
  Suggestion,
  MapboxSuggestOptions,
  MapboxRetrieveResult,
  MapboxFeature,
} from "@/types/route";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

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

/**
 * Fetches location suggestions from Mapbox Search Box API
 *
 * @param query - Search query string
 * @param sessionToken - Unique session identifier for billing
 * @param options - Additional search options
 * @returns Array of location suggestions
 * @throws Error if API request fails
 */
export async function mapboxSuggest(
  query: string,
  sessionToken: string,
  options: MapboxSuggestOptions = {}
): Promise<Suggestion[]> {
  const token = validateToken();

  const params = new URLSearchParams({
    q: query,
    session_token: sessionToken,
    access_token: token,
    limit: String(options.limit ?? 8),
    language: options.language ?? "ja",
    country: options.country ?? "JP",
    types: options.types ?? "address,street,neighborhood,locality,place,poi",
  });

  if (options.proximity) {
    params.set("proximity", `${options.proximity[0]},${options.proximity[1]}`);
  }

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Mapbox Suggest API error: ${response.status} ${
        errorData.message ?? response.statusText
      }`
    );
  }

  const data = await response.json();

  if (!data.suggestions) {
    console.warn("No suggestions in Mapbox response:", data);
    return [];
  }

  return data.suggestions.map(
    (suggestion: {
      name: string;
      place_formatted: string;
      mapbox_id: string;
    }) => ({
      name: suggestion.name,
      context: suggestion.place_formatted,
      mapbox_id: suggestion.mapbox_id,
    })
  );
}

/**
 * Retrieves detailed location information from Mapbox
 *
 * @param mapboxId - Unique Mapbox location identifier
 * @param sessionToken - Session identifier (must match the suggest call)
 * @returns Location coordinates and label
 * @throws Error if API request fails
 */
export async function mapboxRetrieve(
  mapboxId: string,
  sessionToken: string
): Promise<MapboxRetrieveResult | null> {
  const token = validateToken();

  const params = new URLSearchParams({
    session_token: sessionToken,
    access_token: token,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
      mapboxId
    )}?${params}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Mapbox Retrieve API error: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();
  const feature: MapboxFeature = data.features?.[0];

  if (!feature) {
    console.warn("No feature found in Mapbox retrieve response:", data);
    return null;
  }

  const coord =
    feature.properties?.routable_points?.[0]?.point ??
    feature.geometry?.coordinates;

  const label =
    feature.properties?.name ?? feature.properties?.place_formatted ?? "";

  return { coord, label };
}
