"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { MapRef as MapLibreMapRef, useMap } from "react-map-gl/maplibre";

import { useEditMetaStore, useRouteStateStore } from "@/features/routes/hooks";
import type { RouteState } from "@/features/routes/stores/routeStateStore";
import { convertRouteToState } from "@/features/routes/utils/convertRouteToState";
import { useDirections } from "@/hooks/useDirections";
import { useMapboxSearch } from "@/hooks/useMapboxSearch";
import {
  CoursePointRequest,
  RouteResponseModel,
  WaypointRequest,
} from "@/types/api";
import { Coordinate } from "@/types/mapbox";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteCreationSidebar } from "./route-creation-sidebar";
import { RouteCreationToolbar } from "./route-creation-toolbar";

const TOKYO_STATION: Coordinate = [139.767, 35.681];
const INITIAL_VIEW = {
  longitude: 139.753,
  latitude: 35.6844,
  zoom: 14,
};

// ルート編集時はpropsでrouteを受け取る
type RoutePlannerProps = {
  editRoute?: RouteResponseModel;
  initialLocation?: { longitude: number; latitude: number } | null;
};

export const RoutePlanner = ({
  editRoute,
  initialLocation,
}: RoutePlannerProps) => {
  const { map } = useMap();
  const nativeMap = map?.getMap();
  const mapRef = useRef<MapLibreMapRef>(null);
  const hasRestoredRef = useRef(false);
  const hasInitializedEditRef = useRef(false);

  // Component state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [cues, setCues] = useState<CoursePointRequest[]>([]);
  const [routeName, setRouteName] = useState(editRoute?.name ?? "");

  // Route state management (undo/redo + localStorage persistence)
  const routeState = useRouteStateStore((s) => s.present);
  const past = useRouteStateStore((s) => s.past);
  const future = useRouteStateStore((s) => s.future);
  const pushState = useRouteStateStore((s) => s.pushState);
  const undoState = useRouteStateStore((s) => s.undo);
  const redoState = useRouteStateStore((s) => s.redo);
  const clearState = useRouteStateStore((s) => s.clear);
  const initializeState = useRouteStateStore((s) => s.initialize);

  // Edit meta management
  const editMeta = useEditMetaStore((s) => s.editMeta);
  const setEditMeta = useEditMetaStore((s) => s.setEditMeta);
  const clearEditMeta = useEditMetaStore((s) => s.clearEditMeta);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const proximity = useMemo<Coordinate>(
    () =>
      initialLocation
        ? [initialLocation.longitude, initialLocation.latitude]
        : TOKYO_STATION,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Mapbox search integration
  const {
    query, // 検索クエリ
    setQuery, // 検索クエリを更新する関数
    suggestions, // 検索候補のリスト
    isLoading: isSearchLoading, // 検索中かどうかのフラグ
    error: searchError, // 検索エラー情報
    pickSuggestion, // 検索候補を選択する関数
    clearSuggestions, // 検索候補をクリアする関数
  } = useMapboxSearch({
    proximity,
    country: "JP",
    language: "ja",
    debounceMs: 160, // デバウンス時間
  });

  // 状態変更時のコールバック
  const handleStateChange = useCallback(
    (newState: RouteState) => {
      pushState(newState);
    },
    [pushState],
  );

  // Directions management
  const {
    waypoints,
    routeInfo,
    addWaypoint,
    clearWaypoints,
    restoreState,
    isReady,
  } = useDirections({
    map: nativeMap,
    onRouteChange: useCallback((newCues: CoursePointRequest[]) => {
      setCues(newCues);
    }, []),
    onStateChange: handleStateChange,
  });

  // editMetaが存在する新規作成モードの場合にダイアログを表示（派生状態）
  const showEditContinueDialog = isReady && !editRoute && !!editMeta;

  // 編集モードの初期化: editRouteが渡された場合
  useEffect(() => {
    if (!isReady || !editRoute || hasInitializedEditRef.current) return;

    hasInitializedEditRef.current = true;
    hasRestoredRef.current = true;

    // 既存の下書きをクリアして、編集するルートを読み込む
    const editState = convertRouteToState(editRoute);
    initializeState(editState);
    restoreState(editState);

    // 編集メタ情報を設定
    setEditMeta({
      routeId: editRoute.id ?? "",
      routeName: editRoute.name ?? "",
    });
  }, [isReady, editRoute, initializeState, restoreState, setEditMeta]);

  // 新規作成モードで、以前編集中だった場合はダイアログを表示
  useEffect(() => {
    if (!isReady || editRoute || hasRestoredRef.current) return;

    // editMetaが存在する場合はダイアログを派生状態で表示するため何もしない
    // 通常の新規作成で下書きがある場合は復元
    if (!editMeta && routeState.waypoints.length > 0) {
      // 通常の新規作成で下書きがある場合は復元
      hasRestoredRef.current = true;
      restoreState(routeState);
    }
  }, [isReady, editRoute, editMeta, routeState, restoreState]);

  // ダイアログで「編集を継続」を選択
  const handleContinueEditing = useCallback(() => {
    hasRestoredRef.current = true;
    // editMetaが存在する状態で下書きを復元（編集中のルートを新規作成画面で表示）
    if (routeState.waypoints.length > 0) {
      restoreState(routeState);
    }
    // editMetaからルート名を復元してからクリア（ダイアログを閉じる）
    if (editMeta?.routeName) {
      setRouteName(editMeta.routeName);
    }
    clearEditMeta();
  }, [routeState, restoreState, editMeta, clearEditMeta]);

  // ダイアログで「新規作成」を選択
  const handleStartNew = useCallback(() => {
    hasRestoredRef.current = true;
    // 下書きと編集メタをクリア
    clearState();
    clearEditMeta();
    setRouteName("");
  }, [clearState, clearEditMeta]);

  // Handle undo with map state restoration
  const handleUndo = useCallback(() => {
    const newState = undoState();
    if (newState) {
      restoreState(newState);
    }
  }, [undoState, restoreState]);

  // Handle redo with map state restoration
  const handleRedo = useCallback(() => {
    const newState = redoState();
    if (newState) {
      restoreState(newState);
    }
  }, [redoState, restoreState]);

  // Convert waypoints to WaypointRequest format for API
  const waypointRequests: WaypointRequest[] = useMemo(
    () =>
      waypoints.map((coord) => ({
        location: JSON.stringify({ type: "Point", coordinates: coord }),
      })),
    [waypoints],
  );

  // Event handlers
  const handlePickSuggestion = useCallback(
    async (suggestion: {
      name: string;
      context: string;
      mapbox_id: string;
    }) => {
      const result = await pickSuggestion(suggestion);
      if (result?.coord) {
        addWaypoint(result.coord);
      }
    },
    [pickSuggestion, addWaypoint],
  );

  const handleClear = useCallback(() => {
    clearWaypoints();
    clearSuggestions();
    clearState();
    setQuery("");
    setCues([]);
  }, [clearWaypoints, clearSuggestions, clearState, setQuery]);

  // ファイルのインポート機能
  const handleImport = useCallback(() => {
    console.log("Import not yet implemented");
    // TODO: Implement route import functionality
  }, []);

  // maptilerのスタイルURL
  const mapStyle = useMemo(
    () =>
      `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
    [],
  );

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full flex">
        <RouteCreationSidebar
          cue={cues}
          waypoints={waypointRequests}
          routeName={routeName}
          onRouteNameChange={setRouteName}
          onImport={handleImport}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
          routeInfo={routeInfo}
        />

        <Map
          ref={mapRef}
          id="map"
          initialViewState={
            initialLocation ? { ...initialLocation, zoom: 14 } : INITIAL_VIEW
          }
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
        />

        <RouteCreationToolbar
          onClear={handleClear}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          session={{ id: "", renew: () => {} }} // Managed internally by useMapboxSearch
          suggestions={suggestions}
          q={query}
          setQ={setQuery}
          pick={handlePickSuggestion}
          isCollapsed={isToolbarCollapsed}
          onCollapsedChange={setIsToolbarCollapsed}
        />

        {/* Display search errors */}
        {searchError && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md z-50">
            <strong className="font-bold">検索エラー: </strong>
            <span className="block sm:inline">{searchError.message}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isSearchLoading && (
          <div className="absolute top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50">
            検索中...
          </div>
        )}

        {/* 編集継続確認ダイアログ */}
        <Dialog
          open={showEditContinueDialog}
          onOpenChange={(open) => {
            if (!open) clearEditMeta();
          }}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>編集中のルートがあります</DialogTitle>
              <DialogDescription>
                「{editMeta?.routeName}」の編集を継続しますか？
                新規作成を選択すると、編集中のデータは破棄されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleStartNew}>
                新規作成
              </Button>
              <Button onClick={handleContinueEditing}>編集を継続</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};
