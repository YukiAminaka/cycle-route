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

  const handleMapClick = (lat: number, lng: number) => {
    if (isDrawing) {
      const newPoint: RoutePoint = {
        id: `point-${Date.now()}`,
        lat,
        lng,
      };
      setRoutePoints([...routePoints, newPoint]);
    }
  };

  const handleClearRoute = () => {
    setRoutePoints([]);
    setIsDrawing(false);
    setRouteName("");
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!isDrawing);
  };

  const handleSaveRoute = () => {
    console.log("Saving route:", routePoints);
    setShowRoutePanel(true);
  };

  const handleRouteSaved = (route: Route) => {
    setSavedRoutes(getSavedRoutes());
    setCurrentRoute(route);
  };

  const handleUndo = () => {
    if (routePoints.length > 0) {
      setRoutePoints(routePoints.slice(0, -1));
    }
  };

  const handleRedo = () => {
    console.log("Redo not yet implemented");
  };

  const handleImport = () => {
    console.log("Import not yet implemented");
  };

  const handleLocationSearch = (location: string) => {
    console.log("Searching for location:", location);
    // TODO: Implement geocoding search
  };

  return (
    <div className="relative h-full w-full flex">
      {/* Left Sidebar */}
      <RouteCreationSidebar
        routePoints={routePoints}
        routeName={routeName}
        onRouteNameChange={setRouteName}
        onClear={handleClearRoute}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveRoute}
        onImport={handleImport}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapProvider>
          <Map
            ref={mapRef}
            id="map"
            initialViewState={{
              longitude: 139.753,
              latitude: 35.6844,
              zoom: 14,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          />
          <Waypoints />
        </MapProvider>
      </div>

      {/* Right Toolbar */}
      <RouteCreationToolbar
        onClear={handleClearRoute}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onLocationSearch={handleLocationSearch}
        isCollapsed={isToolbarCollapsed}
        onCollapsedChange={setIsToolbarCollapsed}
      />

      {showRoutePanel && (
        <RoutePanel
          routePoints={routePoints}
          onClose={() => setShowRoutePanel(false)}
          onSave={handleRouteSaved}
        />
      )}
    </div>
  );
});
