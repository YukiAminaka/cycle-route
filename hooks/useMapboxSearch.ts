import { useState, useEffect, useCallback } from "react";
import { Suggestion, LngLat, MapboxRetrieveResult } from "@/types/route";
import { mapboxSuggest, mapboxRetrieve } from "@/services/mapbox";
import { useDebounced } from "./useDebounced";
import { useSessionToken } from "./useSessionToken";

interface UseMapboxSearchOptions {
  proximity?: LngLat;
  country?: string;
  language?: string;
  debounceMs?: number;
}

interface UseMapboxSearchResult {
  query: string;
  setQuery: (query: string) => void;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: Error | null;
  pickSuggestion: (suggestion: Suggestion) => Promise<MapboxRetrieveResult | null>;
  clearSuggestions: () => void;
}

/**
 * Custom hook for Mapbox Search Box API integration
 * Handles search suggestions and retrieval with debouncing and session management
 */
export function useMapboxSearch(
  options: UseMapboxSearchOptions = {}
): UseMapboxSearchResult {
  const {
    proximity,
    country = "JP",
    language = "ja",
    debounceMs = 300,
  } = options;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounced(query, debounceMs);
  const session = useSessionToken();

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const results = await mapboxSuggest(debouncedQuery, session.id, {
          proximity,
          country,
          language,
        });

        if (!isCancelled) {
          setSuggestions(results);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch suggestions"));
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, session.id, proximity, country, language]);

  const pickSuggestion = useCallback(
    async (suggestion: Suggestion): Promise<MapboxRetrieveResult | null> => {
      try {
        const result = await mapboxRetrieve(suggestion.mapbox_id, session.id);

        if (result) {
          // Update query with selected location name
          setQuery(result.label || suggestion.name);
          setSuggestions([]);
          // Renew session token for next search
          session.renew();
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to retrieve location"));
        return null;
      }
    },
    [session]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    pickSuggestion,
    clearSuggestions,
  };
}
