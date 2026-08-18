"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useActionState, useEffect, useMemo, useRef } from "react";
import Map, { MapProvider } from "react-map-gl/maplibre";
import { exploreRoutes, ExploreRoutesState } from "../actions/explore-routes";
import { exploreRoutesSchema } from "../types/schema";
import { RouteCard } from "./route-card";

export default function RouteExplore() {
  const INITIAL_VIEW = {
    longitude: 139.753,
    latitude: 35.6844,
    zoom: 14,
  };

  const mapStyle = useMemo(
    () =>
      `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
    [],
  );

  const [state, formAction] = useActionState<
    ExploreRoutesState | null,
    FormData
  >(exploreRoutes, null);

  const formRef = useRef<HTMLFormElement>(null);

  // マウント時に自動的にルート一覧を取得
  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  const [form, fields] = useForm({
    lastResult: state?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: exploreRoutesSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const routes = state?.data?.routes ?? [];
  const totalCount = state?.data?.total_count ?? 0;

  console.log(state);

  return (
    <MapProvider>
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <div className="w-105 flex flex-col bg-white border-r overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <form
              id={form.id}
              action={formAction}
              ref={formRef}
              onSubmit={form.onSubmit}
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    key={fields.q.key}
                    name={fields.q.name}
                    defaultValue={fields.q.initialValue}
                    type="text"
                    placeholder="キーワードまたは地域を入力して"
                    className="w-full px-4 py-2 border rounded-lg pr-10"
                  />
                  {fields.q.errors && (
                    <p className="text-xs text-red-500 mt-1">
                      {fields.q.errors[0]}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-xs">検索</span>
                </button>
              </div>
              {form.errors && (
                <p className="text-xs text-red-500 mt-2">{form.errors[0]}</p>
              )}
            </form>
          </div>

          {/* Results Count */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">結果</span>
              <span className="text-gray-600 ml-2">
                ({totalCount.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Route List */}
          <div className="flex-1 overflow-y-auto pb-4">
            {routes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                ルートが見つかりませんでした
              </p>
            ) : (
              routes.map((route) => <RouteCard key={route.id} route={route} />)
            )}
          </div>

          {/* Pagination */}
          <div className="border-t p-4 flex items-center justify-between">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm">1～10 を 表示</span>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 地図 */}
        <div className="flex-1 relative">
          <Map
            id="route-explore-map"
            initialViewState={INITIAL_VIEW}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyle}
          />
        </div>
      </div>
    </MapProvider>
  );
}
