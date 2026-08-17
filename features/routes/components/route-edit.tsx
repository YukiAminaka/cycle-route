"use client";

import { RoutePlanner } from "./routePlanner";
import { RouteResponseModel } from "@/types/api";
import { MapProvider } from "react-map-gl/maplibre";

interface RouteDetailProps {
  route: RouteResponseModel;
}

export default function RouteEditer({ route }: RouteDetailProps) {
  return (
    <div className="relative h-full w-full flex">
      <div className="flex-1 relative">
        <MapProvider>
          <RoutePlanner editRoute={route} />
        </MapProvider>
      </div>
    </div>
  );
}
