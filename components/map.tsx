"use client";

// Using Maplibre
import * as React from "react";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import Map, {
  MapProvider,
  MapRef as MapLibreMapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Waypoints } from "./waypoints";
import { RouteCreationSidebar } from "./route-creation-sidebar";
import { RouteCreationToolbar } from "./route-creation-toolbar";
import { RoutePanel } from "./route-panel";
import { getSavedRoutes } from "@/lib/route-storage";

export type RoutePoint = {
  id: string;
  lat: number;
  lng: number;
  elevation?: number;
};

export type Route = {
  id: string;
  name: string;
  points: RoutePoint[];
  distance: number;
  elevationGain: number;
  createdAt: Date;
};

export type MapRef = {
  resize: () => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
};

export const RoutePlanner = forwardRef<MapRef>((props, ref) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [routeName, setRouteName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const mapRef = useRef<MapLibreMapRef>(null);

  useEffect(() => {
    setSavedRoutes(getSavedRoutes());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, isToolbarCollapsed]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    resize: () => {
      mapRef.current?.resize();
    },
    flyTo: (lat: number, lng: number, zoom: number = 14) => {
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1000 });
    },
  }));

  return (
    <div className="relative h-full w-full flex">
      <div className="flex-1 relative">
        <MapProvider>
          <Waypoints />
        </MapProvider>
      </div>
    </div>
  );
});
