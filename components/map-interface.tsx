"use client";

import { useState, useEffect, useRef } from "react";
import { RoutePlanner, type MapRef } from "@/components/map";
import { RoutePanel } from "@/components/route-panel";
import { RouteDetails } from "@/components/route-details";
import { RouteCreationSidebar } from "@/components/route-creation-sidebar";
import { RouteCreationToolbar } from "@/components/route-creation-toolbar";
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

export function MapInterface() {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [selectedRouteForDetails, setSelectedRouteForDetails] =
    useState<Route | null>(null);
  const [routeName, setRouteName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    setSavedRoutes(getSavedRoutes());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.resize();
    }, 300); // Wait for transition to complete

    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, isToolbarCollapsed]);

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
    // Placeholder for redo functionality
    console.log("Redo not yet implemented");
  };

  const handleImport = () => {
    // Placeholder for import functionality
    console.log("Import not yet implemented");
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

      {/* Map Container - fills remaining space */}
      <div className="flex-1 relative">
        <RoutePlanner ref={mapRef} />
      </div>

      {/* Right Toolbar */}
      <RouteCreationToolbar
        onClear={handleClearRoute}
        onUndo={handleUndo}
        onRedo={handleRedo}
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

      {selectedRouteForDetails && (
        <RouteDetails
          route={selectedRouteForDetails}
          onClose={() => setSelectedRouteForDetails(null)}
        />
      )}
    </div>
  );
}
