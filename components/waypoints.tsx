import MapLibreGlDirections, {
  LoadingIndicatorControl,
} from "@maplibre/maplibre-gl-directions";
import React, { useEffect } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";

const Waypoints = () => {
  const { map } = useMap();
  const nativeMap = map?.getMap();
  console.log("map:", map);
  useEffect(() => {
    //Make sure to create a MapLibreGlDirections instance only after the map is loaded
    if (nativeMap) {
      nativeMap.on("load", () => {
        // Create an instance of the default class
        const directions = new MapLibreGlDirections(nativeMap);

        // Enable interactivity (if needed)
        directions.interactive = true;

        // Optionally add the standard loading-indicator control
        nativeMap.addControl(new LoadingIndicatorControl(directions));

        // Set the waypoints programmatically
        directions.setWaypoints([
          [139.753, 36.684],
          [139.753, 37.689],
        ]);

        // Remove the first waypoint
        directions.removeWaypoint(0);
        // Add waypoints
        directions.addWaypoint([-73.8671258, 40.82234996], 0);

        // Remove everything plugin-related from the map
        directions.clear();
      });
    }
  }, [nativeMap]);
  return <Marker longitude={139.753} latitude={34.684} color="red" />;
};

export { Waypoints };
