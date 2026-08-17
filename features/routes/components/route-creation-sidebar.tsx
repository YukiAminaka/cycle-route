"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateRouteDialog } from "@/features/routes/components/create-route-dialog";
import { CoursePointRequest, WaypointRequest } from "@/types/api";
import { ChevronLeft, ChevronRight, MoreVertical, Upload } from "lucide-react";
import { CueSheet } from "./cue-sheet";

type RouteCreationSidebarProps = {
  cue: CoursePointRequest[];
  waypoints: WaypointRequest[];
  routeName: string;
  onRouteNameChange: (name: string) => void;
  onImport: () => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  routeInfo: {
    distance: number;
    duration: number;
    elevation_gain: number;
    elevation_loss: number;
    path_geom: string;
    first_point: string;
    last_point: string;
  } | null;
};

export function RouteCreationSidebar({
  cue,
  waypoints,
  routeName,
  onRouteNameChange,
  onImport,
  isCollapsed,
  onCollapsedChange,
  routeInfo,
}: RouteCreationSidebarProps) {
  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => onCollapsedChange(false)}
        className="absolute top-4 left-4 bg-white shadow-lg z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="shrink-0 w-80 p-1 flex">
      <div className="flex-1 flex flex-col relative">
        {/* Fixed Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">ルート</h2>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={onImport}
            >
              <Upload className="h-4 w-4 mr-1" />
              インポート
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Route Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Input
                placeholder="名前のないルート"
                value={routeName}
                onChange={(e) => onRouteNameChange(e.target.value)}
                className="text-sm h-9 flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 ml-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>2 km</span>
              <span>5 m</span>
            </div>
          </div>

          {/* Road Surface */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">路面</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-foreground rounded-sm" />
                  <span>舗装された</span>
                </div>
                <div className="flex gap-3">
                  <span>10 km</span>
                  <span className="text-muted-foreground w-12 text-right">
                    100%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border-2 border-muted-foreground"
                    style={{ borderStyle: "dashed" }}
                  />
                  <span>舗装されていない</span>
                </div>
                <div className="flex gap-3">
                  <span>0 km</span>
                  <span className="w-12 text-right">0%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-muted-foreground rounded-sm" />
                  <span>不明</span>
                </div>
                <div className="flex gap-3">
                  <span>0 km</span>
                  <span className="w-12 text-right">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cue Sheet */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">キューシート</h3>
            <CueSheet cues={cue} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
            >
              キューのレビュー
            </Button>
          </div>
        </div>

        {/* Fixed Footer with Save Button */}
        <div className="p-4 border-t">
          <CreateRouteDialog
            routeName={routeName}
            waypoints={waypoints}
            coursePoints={cue}
            routeInfo={routeInfo}
          />
        </div>

        <Button
          type="button"
          size="icon"
          onClick={() => onCollapsedChange(true)}
          className="absolute top-20 -right-7 h-10 w-6 rounded-l-none bg-white z-10"
        >
          <ChevronLeft className="h-4 w-4 text-black" />
        </Button>
      </div>
    </div>
  );
}
