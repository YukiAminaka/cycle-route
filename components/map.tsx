"use client";

// Using Maplibre
import * as React from "react";
import Map, { MapProvider, Marker } from "react-map-gl/maplibre";
import MapLibreGlDirections, {
  LoadingIndicatorControl,
} from "@maplibre/maplibre-gl-directions";
import "maplibre-gl/dist/maplibre-gl.css";
import { forwardRef } from "react";
import { Waypoints } from "./waypoints";
export type MapRef = {
  resize: () => void;
};

export const RoutePlanner = forwardRef<MapRef>((_ref, ref) => {
  return (
    <MapProvider>
      <Map
        id="map"
        initialViewState={{
          longitude: 139.753,
          latitude: 35.6844,
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
      >
        <Marker longitude={139.753} latitude={35.684} color="red" />
        <Waypoints />
      </Map>
    </MapProvider>
  );
});
