"use client";

import { MapProvider } from "react-map-gl/maplibre";
import { RoutePlanner } from "./routePlanner";
import type { RouteResponseModel } from "@/types/api";

type Props = {
  initialLocation?: { longitude: number; latitude: number } | null;
  editRoute?: RouteResponseModel;
};

export const RoutePlannerWrapper = ({ initialLocation, editRoute }: Props) => (
  <MapProvider>
    <RoutePlanner initialLocation={initialLocation} editRoute={editRoute} />
  </MapProvider>
);
