import { layers } from "@/features/routes/assets/restyling-layers";
import { useRoutingProfileStore } from "@/features/routes/hooks";
import type { RouteState } from "@/features/routes/stores/routeStateStore";
import CustomMapLibreGlDirections from "@/lib/custom-directions";
import type { CoursePointRequest } from "@/types/api";
import type { Coordinate, Route } from "@/types/mapbox";
import type {
  Feature,
  LineString,
  Point,
} from "@maplibre/maplibre-gl-directions";
import {
  LoadingIndicatorControl,
  MapLibreGlDirectionsEventType,
} from "@maplibre/maplibre-gl-directions";
import { Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseDirectionsOptions {
  map: MapLibreMap | null | undefined;
  onRouteChange?: (cues: CoursePointRequest[]) => void;
  onStateChange?: (state: RouteState) => void;
}

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  elevation_gain: number; // meters
  elevation_loss: number; // meters
  path_geom: string; // GeoJSON geometry as string
  first_point: string; // GeoJSON point as string
  last_point: string; // GeoJSON point as string
}

interface UseDirectionsResult {
  waypoints: Coordinate[];
  routeInfo: RouteInfo | null;
  addWaypoint: (coord: Coordinate) => void;
  clearWaypoints: () => void;
  restoreState: (state: RouteState) => void;
  isReady: boolean;
}

/**
 * Custom hook for managing MapLibre GL Directions
 * Handles waypoint management and route calculation
 */
export function useDirections({
  map,
  onRouteChange,
  onStateChange,
}: UseDirectionsOptions): UseDirectionsResult {
  const directionsRef = useRef<CustomMapLibreGlDirections | null>(null);
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const profile = useRoutingProfileStore((s) => s.routing_profiles);
  const isRestoringRef = useRef(false); // 復元中フラグ

  // コールバックをrefで管理して依存配列から外す
  const onRouteChangeRef = useRef(onRouteChange);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onRouteChangeRef.current = onRouteChange;
    onStateChangeRef.current = onStateChange;
  }, [onRouteChange, onStateChange]);

  // Initialize directions plugin
  useEffect(() => {
    if (!map) return;

    const initDirections = () => {
      // Cleanup existing instance
      if (directionsRef.current) {
        directionsRef.current.destroy();
        directionsRef.current = null;
      }

      const directions = new CustomMapLibreGlDirections(map, {
        api: "https://api.mapbox.com/directions/v5",
        profile,
        layers,
        // カスタムレイヤーに合わせてインタラクション対象を設定
        // （デフォルトの *-casing レイヤーは存在しないため除外）
        sensitiveWaypointLayers: ["maplibre-gl-directions-waypoint"],
        sensitiveSnappointLayers: ["maplibre-gl-directions-snappoint"],
        sensitiveRoutelineLayers: ["maplibre-gl-directions-routeline"],
        sensitiveAltRoutelineLayers: ["maplibre-gl-directions-alt-routeline"],
        requestOptions: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          geometries: "geojson",
          steps: "true",
          alternatives: "false", // 代替ルートを返すか
          overview: "full",
        },
      });

      directions.interactive = true;
      map.addControl(new LoadingIndicatorControl(directions));
      directionsRef.current = directions;
      setIsReady(true);

      // 経路探索は毎回すべてのwaypointが含まれるのでつど追加されず全部をセットするようになっている。
      const handleRouteEnd = (
        event: MapLibreGlDirectionsEventType["fetchroutesend"]
      ) => {
        const dir = directionsRef.current;
        const apiResponse = event.data.directions;

        // waypointsを更新（スナップされた位置）
        setWaypoints(apiResponse?.waypoints?.map((wp) => wp.location) ?? []);
        const route = apiResponse?.routes?.[0] as Route | undefined;

        if (!route) return;

        // Extract cue sheet from route steps
        const steps = (route.legs ?? []).flatMap((leg) => leg.steps ?? []);

        // depart/arriveタイプの中間ポイントをスキップし、累積距離と時間を繰り越す
        // 到達ベース: 各ポイントには「このポイントに到達するまでの距離・時間」を格納
        interface Accumulator {
          coursePoints: CoursePointRequest[];
          cumDistM: number; // 累積距離
          cumDuration: number; // 累積時間
          pendingDistM: number; // 次のポイントのseg_dist_mとして使う値
          pendingDuration: number; // 次のポイントのdurationとして使う値
        }

        const { coursePoints } = steps.reduce<Accumulator>(
          (acc, step, index) => {
            const stepDistM = step.distance ?? 0;
            const stepDuration = step.duration ?? 0;
            const maneuverType = step.maneuver?.type;

            // スキップ条件:
            // - "depart"かつ最初のステップでない
            // - "arrive"かつ最後のステップでない
            const isFirstStep = index === 0;
            const isLastStep = index === steps.length - 1;
            const shouldSkip =
              (maneuverType === "depart" && !isFirstStep) ||
              (maneuverType === "arrive" && !isLastStep);

            if (shouldSkip) {
              // このステップをスキップし、距離と時間を次のポイントに繰り越す
              return {
                ...acc,
                cumDistM: acc.cumDistM + stepDistM,
                cumDuration: acc.cumDuration + stepDuration,
                pendingDistM: acc.pendingDistM + stepDistM,
                pendingDuration: acc.pendingDuration + stepDuration,
              };
            }

            // コースポイントを追加（到達ベース）
            const maneuverLocation = step.maneuver?.location;
            const coursePoint: CoursePointRequest = {
              location: maneuverLocation
                ? JSON.stringify({
                    type: "Point",
                    coordinates: maneuverLocation,
                  })
                : "",
              road_name: step.name ?? "",
              // 到達ベース: このポイントに到達するまでの距離・時間
              seg_dist_m: acc.pendingDistM, // 前のポイントからここまでの距離
              cum_dist_m: acc.cumDistM, // コース開始からここまでの累積距離
              duration: acc.pendingDuration, // 前のポイントからここまでの時間
              maneuver_type: step.maneuver?.type,
              modifier: step.maneuver?.modifier,
              bearing_after: step.maneuver?.bearing_after,
              bearing_before: step.maneuver?.bearing_before,
              instruction: step.maneuver?.instruction,
            };

            return {
              coursePoints: [...acc.coursePoints, coursePoint],
              cumDistM: acc.cumDistM + stepDistM,
              cumDuration: acc.cumDuration + stepDuration,
              // 次のポイントに渡す値（このステップの距離・時間）
              pendingDistM: stepDistM,
              pendingDuration: stepDuration,
            };
          },
          {
            coursePoints: [],
            cumDistM: 0,
            cumDuration: 0,
            pendingDistM: 0, // 最初のポイントは0（出発地点）
            pendingDuration: 0,
          }
        );

        // todo: 標高データの取得と計算
        const elevation_gain = 0;
        const elevation_loss = 0;

        // Get first and last points from waypoints
        const coordinates = route.geometry?.coordinates ?? [];
        const firstPoint = coordinates[0];
        const lastPoint = coordinates[coordinates.length - 1];

        // Create route info
        const newRouteInfo: RouteInfo = {
          distance: route.distance ?? 0, // in meters
          duration: route.duration ?? 0, // in seconds
          elevation_gain, // meters
          elevation_loss, // meters
          path_geom: JSON.stringify(route.geometry), // GeoJSON LineString
          first_point: JSON.stringify({
            type: "Point",
            coordinates: firstPoint,
          }),
          last_point: JSON.stringify({
            type: "Point",
            coordinates: lastPoint,
          }),
        };

        setRouteInfo(newRouteInfo);
        console.log("cues", coursePoints);
        if (onRouteChangeRef.current) {
          onRouteChangeRef.current(coursePoints);
        }

        // 状態変更を通知（永続化・履歴用）
        // APIレスポンスから直接snappoints/routelinesを構築
        // （ライブラリ内部の状態更新を待たずに取得できる）
        // 復元中は履歴に追加しない（undo/redo時の二重登録防止）
        if (onStateChangeRef.current && dir && !isRestoringRef.current) {
          // snappointsをAPIレスポンスから構築
          // Mapbox APIが返すwaypointsはスナップされた位置
          const snappoints: Feature<Point>[] = (
            apiResponse?.waypoints ?? []
          ).map((wp, index) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: wp.location,
            },
            properties: {
              type: "SNAPPOINT",
              index,
            },
          }));

          const waypoints: Feature<Point>[] = (
            apiResponse?.waypoints ?? []
          ).map((wp, index) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: wp.location,
            },
            properties: {
              type: "WAYPOINT",
              index,
            },
          }));

          // routelinesをAPIレスポンスから構築
          // 各legごとにルートラインを作成
          // routelines に route: "SELECTED" と routeIndex: 0 を確実に設定（古いデータとの互換性のため）
          // routeIndex は draw(false) 時に route プロパティを決定するために使用される
          // legIndex, departSnappointProperties, arriveSnappointProperties はライブラリの onMove で必要
          const routelines: Feature<LineString>[][] = (route.legs ?? []).map(
            (leg, legIndex) => {
              // ライブラリが onMove 時に JSON.parse() するため、JSON文字列として保存
              const departSnappointProperties = JSON.stringify({
                type: "SNAPPOINT",
                highlight: false,
                category: "WAYPOINT",
                waypointProperties: {
                  type: "WAYPOINT",
                  index: legIndex,
                },
              });
              const arriveSnappointProperties = JSON.stringify({
                type: "SNAPPOINT",
                highlight: false,
                category: "WAYPOINT",
                waypointProperties: {
                  type: "WAYPOINT",
                  index: legIndex + 1,
                },
              });

              return [
                {
                  type: "Feature" as const,
                  geometry: route.geometry as LineString,
                  properties: {
                    type: "ROUTELINE",
                    route: "SELECTED",
                    legIndex: JSON.stringify(legIndex), // ライブラリが JSON.parse() するため文字列化
                    routeIndex: 0,
                    departSnappointProperties,
                    arriveSnappointProperties,
                  },
                },
              ];
            }
          );

          // onStateChangeRef.current({
          //   waypoints: structuredClone(dir.waypointsFeatures), // ユーザーがクリックした元の位置
          //   snappoints,
          //   routelines,
          // });
          onStateChangeRef.current({
            waypoints, // APIレスポンスから生成したwaypoints（スナップされた位置）
            snappoints,
            routelines,
          });
        }
      };

      // waypoint追加時のハンドラ（1点目でも状態を保存するため）
      const handleWaypointChange = () => {
        const dir = directionsRef.current;
        if (!dir || isRestoringRef.current) return;

        const currentWaypoints = dir.waypointsFeatures;
        // waypointが1つだけの場合（ルート計算が行われない）
        // fetchroutesendは発火しないので、ここで状態を保存
        if (currentWaypoints.length === 1 && onStateChangeRef.current) {
          // ディープコピーして渡す（ライブラリ内部の配列は後で変更されるため）
          console.log(
            "waypoint added but no route calculated, saving state",
            currentWaypoints
          );
          onStateChangeRef.current({
            waypoints: structuredClone(currentWaypoints),
            snappoints: [],
            routelines: [],
          });
        }
      };

      // ルートリクエスト完了時のイベントリスナーを登録
      directions.on("fetchroutesend", handleRouteEnd);
      // waypoint追加・削除時のイベントリスナーを登録
      directions.on("addwaypoint", handleWaypointChange);
      directions.on("removewaypoint", handleWaypointChange);

      // Cleanup function
      return () => {
        directions.off("fetchroutesend", handleRouteEnd);
        directions.off("addwaypoint", handleWaypointChange);
        directions.off("removewaypoint", handleWaypointChange);
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
  }, [map, profile]);

  const addWaypoint = useCallback((coord: Coordinate) => {
    const directions = directionsRef.current;
    if (!directions) return;
    directions.addWaypoint(coord);
  }, []);

  // Clear all waypoints
  const clearWaypoints = useCallback(() => {
    const directions = directionsRef.current;
    if (!directions) return;

    directions.clear();
    setWaypoints([]);
    setRouteInfo(null);
  }, []);

  // 状態を復元（リロード時や編集モード用）
  const restoreState = useCallback((state: RouteState) => {
    const directions = directionsRef.current;
    if (!directions) return;

    // 復元中フラグを立てて、onStateChangeが呼ばれないようにする
    isRestoringRef.current = true;
    directions.clear();
    directions.setWaypointsFeatures(state.waypoints);
    directions.setSnappointsFeatures(state.snappoints);
    directions.setRoutelinesFeatures(state.routelines);

    // waypointsのCoordinateを抽出
    const coords: Coordinate[] = state.waypoints
      .map((wp) => wp.geometry?.coordinates as Coordinate)
      .filter(Boolean);
    setWaypoints(coords);

    // 次のイベントループでフラグをリセット（非同期イベント対応）
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 0);
  }, []);

  return {
    waypoints,
    routeInfo,
    addWaypoint,
    clearWaypoints,
    restoreState,
    isReady,
  };
}
