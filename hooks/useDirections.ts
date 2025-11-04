import { useEffect, useRef, useState, useCallback } from "react";
import MapLibreGlDirections, {
  LoadingIndicatorControl,
  MapLibreGlDirectionsRoutingEvent,
} from "@maplibre/maplibre-gl-directions";
import { Map as MapLibreMap } from "maplibre-gl";
import {
  LngLat,
  Cue,
  DirectionsResponse,
  DirectionsRoute,
} from "@/types/route";

interface UseDirectionsOptions {
  map: MapLibreMap | null | undefined;
  profile?: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling";
  onRouteChange?: (cues: Cue[]) => void;
}

interface UseDirectionsResult {
  waypoints: LngLat[];
  addWaypoint: (coord: LngLat) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;
  undoLastWaypoint: () => void;
  isReady: boolean;
}

/**
 * Custom hook for managing MapLibre GL Directions
 * Handles waypoint management and route calculation
 */
export function useDirections({
  map,
  profile = "mapbox/cycling",
  onRouteChange,
}: UseDirectionsOptions): UseDirectionsResult {
  const directionsRef = useRef<MapLibreGlDirections | null>(null);
  const [waypoints, setWaypoints] = useState<LngLat[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Initialize directions plugin
  useEffect(() => {
    if (!map) return;

    const initDirections = () => {
      // Cleanup existing instance
      if (directionsRef.current) {
        directionsRef.current.destroy();
        directionsRef.current = null;
      }

      const directions = new MapLibreGlDirections(map, {
        api: "https://api.mapbox.com/directions/v5",
        profile,
        requestOptions: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          geometries: "geojson",
          steps: "true",
          alternatives: "true",
          overview: "full",
        },
      });

      directions.interactive = true;
      map.addControl(new LoadingIndicatorControl(directions));
      directionsRef.current = directions;
      setIsReady(true);

      const handleRouteEnd = (event: MapLibreGlDirectionsRoutingEvent) => {
        const response = event?.data as DirectionsResponse | undefined;
        const route: DirectionsRoute | undefined = response?.routes?.[0];

        if (!route || !onRouteChange) return;

        // Extract cue sheet from route steps
        const steps = (route.legs ?? []).flatMap((leg) => leg.steps ?? []);
        const cues: Cue[] = steps.map((step, index) => ({
          order: index,
          road: step.name ?? "",
          distance_m: step.distance ?? 0,
          duration_s: step.duration ?? 0,
          maneuver: {
            type: step.maneuver?.type,
            modifier: step.maneuver?.modifier,
            location: step.maneuver?.location,
          },
          geometry: step.geometry,
        }));

        onRouteChange(cues);
      };

      // ルートリクエスト完了時のイベントリスナーを登録
      directions.on("fetchroutesend", handleRouteEnd);

      // Cleanup function
      return () => {
        directions.off("fetchroutesend", handleRouteEnd);
        directions.destroy();
        directionsRef.current = null;
        setIsReady(false);
      };
    };

    if (map.loaded()) {
      return initDirections();
    } else {
      map.once("load", initDirections);
    }
  }, [map, profile, onRouteChange]);

  const addWaypoint = useCallback((coord: LngLat) => {
    const directions = directionsRef.current;
    if (!directions) return;

    setWaypoints((prev) => {
      const newWaypoints = [...prev, coord];
      directions.addWaypoint(coord, prev.length);
      return newWaypoints;
    });
  }, []);

  const removeWaypoint = useCallback((index: number) => {
    const directions = directionsRef.current;
    if (!directions) return;

    setWaypoints((prev) => {
      const newWaypoints = prev.filter((_, i) => i !== index);
      directions.removeWaypoint(index);
      return newWaypoints;
    });
  }, []);

  const undoLastWaypoint = useCallback(() => {
    const directions = directionsRef.current;
    if (!directions || waypoints.length === 0) return;

    setWaypoints((prev) => {
      const newWaypoints = prev.slice(0, -1);

      if (newWaypoints.length === 0) {
        directions.clear();
      } else {
        directions.setWaypoints(newWaypoints);
      }

      return newWaypoints;
    });
  }, [waypoints.length]);

  // Clear all waypoints
  const clearWaypoints = useCallback(() => {
    const directions = directionsRef.current;
    if (!directions) return;

    directions.clear();
    setWaypoints([]);
  }, []);

  return {
    waypoints,
    addWaypoint,
    removeWaypoint,
    clearWaypoints,
    undoLastWaypoint,
    isReady,
  };
}
