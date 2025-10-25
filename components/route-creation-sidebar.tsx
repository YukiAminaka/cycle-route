"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Plus, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { useState } from "react"
import type { RoutePoint } from "@/components/map-interface"

type RouteCreationSidebarProps = {
  routePoints: RoutePoint[]
  routeName: string
  onRouteNameChange: (name: string) => void
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onImport: () => void
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export function RouteCreationSidebar({
  routePoints,
  routeName,
  onRouteNameChange,
  onClear,
  onUndo,
  onRedo,
  onSave,
  onImport,
  isCollapsed,
  onCollapsedChange,
}: RouteCreationSidebarProps) {
  const [locationInput, setLocationInput] = useState("")
  const [routingMode, setRoutingMode] = useState<"bike" | "walk" | "car" | "direct">("bike")
  const [roadSurface, setRoadSurface] = useState("paved")
  const [routeColor, setRouteColor] = useState("#ef4444")

  const calculateDistance = () => {
    if (routePoints.length < 2) return 0
    let distance = 0
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1]
      const curr = routePoints[i]
      const dx = (curr.lng - prev.lng) * 111
      const dy = (curr.lat - prev.lat) * 111
      distance += Math.sqrt(dx * dx + dy * dy)
    }
    return distance
  }

  const distance = calculateDistance()
  const elevationGain = Math.round(distance * 20)
  const pavedDistance = distance * 1.0 // 100% paved for now

  const colors = [
    "#ef4444", // red
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#ec4899", // pink
    "#7c2d12", // brown
    "#000000", // black
  ]

  if (isCollapsed) {
    return (
      <div className="flex-shrink-0 flex items-start">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onCollapsedChange(false)}
          className="bg-background shadow-lg m-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-80 p-4 flex gap-1">
      <Card className="flex-1 flex flex-col shadow-lg">
        {/* Fixed Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">ルート</h2>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onImport}>
              <Upload className="h-4 w-4 mr-1" />
              インポート
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Plus className="h-4 w-4 mr-1" />
              新規追加
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
              <Button variant="ghost" size="icon" className="h-9 w-9 ml-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{distance.toFixed(1)} km</span>
              <span>{elevationGain} m</span>
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
                  <span>{pavedDistance.toFixed(1)} km</span>
                  <span className="text-muted-foreground w-12 text-right">100%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground" style={{ borderStyle: "dashed" }} />
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
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">ルート出発点</div>
                  <div className="text-muted-foreground text-xs">0.0 km</div>
                </div>
              </div>
              {routePoints.length > 1 && (
                <>
                  <div className="pl-6 text-muted-foreground text-xs">
                    {distance.toFixed(1)} km · +{elevationGain} m / -{Math.round(elevationGain * 0.5)} m
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">ルート終点</div>
                      <div className="text-muted-foreground text-xs">{distance.toFixed(1)} km</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              キューのレビュー
            </Button>
          </div>
        </div>

        {/* Fixed Footer with Save Button */}
        <div className="p-4 border-t">
          <Button
            onClick={onSave}
            className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-medium h-11"
            disabled={routePoints.length < 2}
          >
            保存
          </Button>
        </div>
      </Card>

      <Button size="icon" onClick={() => onCollapsedChange(true)} className="h-10 w-6 rounded-l-none bg-white">
        <ChevronLeft className="h-4 w-4 text-black" />
      </Button>
    </div>
  )
}
