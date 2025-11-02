"use client";

import { RoutePlanner } from "@/components/map";

// Re-export types from map.tsx for backward compatibility
export type { RoutePoint, Route } from "@/components/map";

/**
 * MapInterface is now a simple wrapper around RoutePlanner.
 * All state management and UI logic has been moved to map.tsx for better cohesion.
 */
export function MapInterface() {
  return <RoutePlanner />;
}
