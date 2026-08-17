import { Coordinate, MapboxRetrieveResult, Suggestion } from "@/types/mapbox";
import {
  SearchBoxCore,
  SearchBoxOptions,
  SearchBoxRetrieveResponse,
  SearchBoxSuggestion,
  SearchBoxSuggestionResponse,
  SearchSession,
} from "@mapbox/search-js-core";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

interface UseMapboxSearchOptions {
  proximity?: Coordinate;
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
  pickSuggestion: (
    suggestion: Suggestion,
  ) => Promise<MapboxRetrieveResult | null>;
  clearSuggestions: () => void;
}

type SearchState = {
  query: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: Error | null;
};

type SearchAction =
  | { type: "query_changed"; query: string }
  | { type: "query_cleared" }
  | { type: "suggestions_received"; suggestions: Suggestion[] }
  | { type: "search_failed"; error: Error }
  | { type: "pick_succeeded"; label: string }
  | { type: "cleared" };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "query_changed":
      return { ...state, query: action.query, isLoading: true, error: null };
    case "query_cleared":
      return { query: "", suggestions: [], isLoading: false, error: null };
    case "suggestions_received":
      return { ...state, suggestions: action.suggestions, isLoading: false };
    case "search_failed":
      return {
        ...state,
        error: action.error,
        suggestions: [],
        isLoading: false,
      };
    case "pick_succeeded":
      return {
        ...state,
        query: action.label,
        suggestions: [],
        isLoading: false,
      };
    case "cleared":
      return { ...state, suggestions: [], error: null };
  }
}

type MapboxSearchSession = SearchSession<
  SearchBoxOptions,
  SearchBoxSuggestion,
  SearchBoxSuggestionResponse,
  SearchBoxRetrieveResponse
>;

export function useMapboxSearch(
  options: UseMapboxSearchOptions = {},
): UseMapboxSearchResult {
  const {
    proximity,
    country = "JP",
    language = "ja",
    debounceMs = 300,
  } = options;

  const [state, dispatch] = useReducer(searchReducer, {
    query: "",
    suggestions: [],
    isLoading: false,
    error: null,
  });

  const rawSuggestionsRef = useRef<SearchBoxSuggestion[]>([]);

  // 最新のオプションをrefで保持 — suggest呼び出し時に都度渡す
  const searchOptionsRef = useRef({ country, language, proximity });
  useEffect(() => {
    searchOptionsRef.current = { country, language, proximity };
  }, [country, language, proximity]);

  // useState lazy init — インスタンスはコンポーネント生存期間中に一度だけ生成される
  const [searchCore] = useState(
    () =>
      new SearchBoxCore({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_KEY ?? "",
      }),
  );
  const [session] = useState<MapboxSearchSession>(
    () => new SearchSession(searchCore, debounceMs),
  );

  // イベントリスナーのセットアップ — session は安定しているので実質一度だけ実行
  useEffect(() => {
    const handleSuggest = (res: SearchBoxSuggestionResponse) => {
      rawSuggestionsRef.current = res.suggestions;
      dispatch({
        type: "suggestions_received",
        suggestions: res.suggestions.map((s) => ({
          name: s.name,
          context: s.place_formatted ?? "",
          mapbox_id: s.mapbox_id,
        })),
      });
    };

    const handleError = (err: Error) => {
      dispatch({ type: "search_failed", error: err });
    };

    session.addEventListener("suggest", handleSuggest);
    session.addEventListener("suggesterror", handleError);

    return () => {
      session.removeEventListener("suggest", handleSuggest);
      session.removeEventListener("suggesterror", handleError);
    };
  }, [session]);

  const handleSetQuery = useCallback(
    (newQuery: string) => {
      if (!newQuery.trim()) {
        rawSuggestionsRef.current = [];
        dispatch({ type: "query_cleared" });
        return;
      }
      dispatch({ type: "query_changed", query: newQuery });
      const {
        country: c,
        language: l,
        proximity: p,
      } = searchOptionsRef.current;
      session.suggest(newQuery, {
        country: c,
        language: l,
        ...(p && { proximity: p }),
      });
    },
    [session],
  );

  const pickSuggestion = useCallback(
    async (suggestion: Suggestion): Promise<MapboxRetrieveResult | null> => {
      const raw = rawSuggestionsRef.current.find(
        (s) => s.mapbox_id === suggestion.mapbox_id,
      );
      if (!raw) return null;

      try {
        const response = await searchCore.retrieve(raw, {
          sessionToken: session.sessionToken,
          language: searchOptionsRef.current.language,
        });

        const feature = response.features[0];
        if (!feature) return null;

        session.incrementSession();

        const rp = feature.properties.coordinates.routable_points?.[0];
        const coord: Coordinate = rp
          ? [rp.longitude, rp.latitude]
          : [
              feature.properties.coordinates.longitude,
              feature.properties.coordinates.latitude,
            ];

        const label =
          feature.properties.name ?? feature.properties.place_formatted ?? "";

        rawSuggestionsRef.current = [];
        dispatch({ type: "pick_succeeded", label });

        return { coord, label };
      } catch (err) {
        dispatch({
          type: "search_failed",
          error:
            err instanceof Error
              ? err
              : new Error("Failed to retrieve location"),
        });
        return null;
      }
    },
    [searchCore, session],
  );

  const clearSuggestions = useCallback(() => {
    rawSuggestionsRef.current = [];
    dispatch({ type: "cleared" });
  }, []);

  return {
    query: state.query,
    setQuery: handleSetQuery,
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    error: state.error,
    pickSuggestion,
    clearSuggestions,
  };
}
