"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Undo,
  Redo,
  X,
  MapPin,
  Bike,
  Footprints,
  Car,
  Mountain,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

type Suggestion = {
  name: string;
  context: string;
  mapbox_id: string;
};

type Session = {
  id: string;
  renew: () => void;
};

type LngLat = [number, number];

type RouteCreationToolbarProps = {
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  session: Session;
  suggestions: Suggestion[];
  q: string;
  setQ: (value: string) => void;
  pick: (s: Suggestion) => Promise<void>;
  waypoints: LngLat[];
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function RouteCreationToolbar({
  onClear,
  onUndo,
  onRedo,
  session,
  suggestions,
  q,
  setQ,
  pick,
  waypoints,
  isCollapsed,
  onCollapsedChange,
}: RouteCreationToolbarProps) {
  const [locationInput, setLocationInput] = useState("");
  const [routingMode, setRoutingMode] = useState("bike");
  const [roadSurface, setRoadSurface] = useState("paved");
  const [routeColor, setRouteColor] = useState("#ef4444");

  const colors = [
    "#ef4444", // red
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#ec4899", // pink
    "#7c2d12", // brown
    "#000000", // black
  ];

  if (isCollapsed) {
    return (
      <div className="shrink-0 flex items-start">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 bg-background shadow-lg m-4"
          onClick={() => onCollapsedChange(false)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="shrink-0 p-4 flex gap-1 relative">
      <div className="w-80 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="space-y-2  pr-1">
          {/* Top Controls */}
          <div className="px-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={onUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={onRedo}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Location Input */}
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="z-10 w-[420px] bg-white/90 rounded-xl shadow">
                <form
                  onSubmit={(e) => {
                    e.preventDefault(); // Enterでもサジェストを待つ
                  }}
                >
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      session.renew();
                    }}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="地名を入力"
                    autoComplete="off"
                  />
                </form>

                {suggestions.length > 0 && (
                  <ul className="border rounded mt-2 bg-white max-h-72 overflow-auto">
                    {suggestions.map((s) => (
                      <li
                        key={s.mapbox_id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => pick(s)}
                      >
                        <div className="text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.context}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Edit Section */}
          <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold">編集</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs bg-transparent"
              >
                ルートに追加
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs bg-transparent"
              >
                カスタムPOI
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs bg-transparent"
              >
                カスタムキュー
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs bg-transparent"
              >
                コントロールポイント
              </Button>
            </div>
          </div>

          {/* Routing Mode */}
          <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold">ルーティングモード</h3>
            <div className="flex gap-2">
              <Button
                variant={routingMode === "bike" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setRoutingMode("bike")}
              >
                <Bike className="h-4 w-4" />
              </Button>
              <Button
                variant={routingMode === "walk" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setRoutingMode("walk")}
              >
                <Footprints className="h-4 w-4" />
              </Button>
              <Button
                variant={routingMode === "car" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setRoutingMode("car")}
              >
                <Car className="h-4 w-4" />
              </Button>
              <Button
                variant={routingMode === "direct" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setRoutingMode("direct")}
              >
                <Mountain className="h-4 w-4" />
              </Button>
            </div>
            <Select value={roadSurface} onValueChange={setRoadSurface}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paved">舗装された</SelectItem>
                <SelectItem value="unpaved">舗装されていない</SelectItem>
                <SelectItem value="mixed">混合</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Route Color */}
          <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold">ルートの色</h3>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: routeColor === color ? "#fff" : color,
                    boxShadow: routeColor === color ? "0 0 0 2px #000" : "none",
                  }}
                  onClick={() => setRouteColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Route Tools */}
          <div className="p-3 space-y-3">
            <h3 className="text-sm font-semibold">ルートツール</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                逆のルート
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                出戻り
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                ルートを複製
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                選択
              </Button>
            </div>
          </div>
        </div>
        <Button
          size="icon"
          onClick={() => onCollapsedChange(true)}
          className="absolute top-20 -left-6 z-10 h-10 w-6 rounded-r-none bg-white"
        >
          <ChevronRight className="h-4 w-4 text-black" />
        </Button>
      </div>
    </div>
  );
}
