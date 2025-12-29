"use client";

import { Header } from "@/components/header";
import { RoutePlanner } from "@/components/routePlanner";
import { MapProvider } from "react-map-gl/maplibre";

export default function NewRoutePage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="relative h-full w-full flex">
          <div className="flex-1 relative">
            <MapProvider>
              <RoutePlanner />
            </MapProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
