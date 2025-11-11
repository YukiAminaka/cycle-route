"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  use,
  useEffect,
} from "react";
import { useMap } from "react-map-gl/maplibre";
import Map, { MapRef as MapLibreMapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { RouteCreationSidebar } from "./route-creation-sidebar";
import { RouteCreationToolbar } from "./route-creation-toolbar";
import { ErrorBoundary } from "./error-boundary";
import { useMapboxSearch } from "@/hooks/useMapboxSearch";
import { useDirections } from "@/hooks/useDirections";
import { LngLat, Cue } from "@/types/route";

const TOKYO_STATION: LngLat = [139.767, 35.681];
const INITIAL_VIEW = {
  longitude: 139.753,
  latitude: 35.6844,
  zoom: 14,
};

const Waypoints = () => {
  const { map } = useMap();
  const nativeMap = map?.getMap();
  const mapRef = useRef<MapLibreMapRef>(null);

  // Component state
  const [routeName, setRouteName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [cues, setCues] = useState<Cue[]>([]);

  // Mapbox search integration
  const {
    query,
    setQuery,
    suggestions,
    isLoading: isSearchLoading,
    error: searchError,
    pickSuggestion,
    clearSuggestions,
  } = useMapboxSearch({
    proximity: TOKYO_STATION,
    country: "JP",
    language: "ja",
    debounceMs: 160,
  });

  // Directions management
  const { waypoints, addWaypoint, clearWaypoints, undoLastWaypoint } =
    useDirections({
      map: nativeMap,
      profile: "mapbox/cycling",
      onRouteChange: useCallback((newCues: Cue[]) => {
        setCues(newCues);
        console.log("Route updated:", newCues);
      }, []),
    });

  // Event handlers
  const handlePickSuggestion = useCallback(
    async (suggestion: {
      name: string;
      context: string;
      mapbox_id: string;
    }) => {
      const result = await pickSuggestion(suggestion);
      if (result?.coord) {
        addWaypoint(result.coord);
      }
    },
    [pickSuggestion, addWaypoint]
  );

  const handleClear = useCallback(() => {
    clearWaypoints();
    clearSuggestions();
    setQuery("");
    setCues([]);
  }, [clearWaypoints, clearSuggestions, setQuery]);

  const handleSave = useCallback(() => {
    console.log("Saving route:", {
      name: routeName,
      waypoints,
      cues,
    });
    // TODO: Implement API call to save route
  }, [routeName, waypoints, cues]);

  const handleImport = useCallback(() => {
    console.log("Import not yet implemented");
    // TODO: Implement route import functionality
  }, []);

  // Render map style URL
  const mapStyle = useMemo(
    () =>
      `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
    []
  );

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full flex">
        <RouteCreationSidebar
          cue={cues}
          routeName={routeName}
          onSave={handleSave}
          onImport={handleImport}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
        />

        <Map
          ref={mapRef}
          id="map"
          initialViewState={INITIAL_VIEW}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
        />

        <RouteCreationToolbar
          onClear={handleClear}
          onUndo={undoLastWaypoint}
          onRedo={() => {
            // TODO: Implement redo functionality
          }}
          session={{ id: "", renew: () => {} }} // Managed internally by useMapboxSearch
          suggestions={suggestions}
          q={query}
          setQ={setQuery}
          pick={handlePickSuggestion}
          waypoints={waypoints}
          isCollapsed={isToolbarCollapsed}
          onCollapsedChange={setIsToolbarCollapsed}
        />

        {/* Display search errors */}
        {searchError && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md z-50">
            <strong className="font-bold">検索エラー: </strong>
            <span className="block sm:inline">{searchError.message}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isSearchLoading && (
          <div className="absolute top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50">
            検索中...
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export { Waypoints };
