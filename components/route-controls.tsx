"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, Trash2, Save, MapPin } from "lucide-react"
import type { RoutePoint } from "@/components/map-interface"

type RouteControlsProps = {
  isDrawing: boolean
  hasPoints: boolean
  onToggleDrawing: () => void
  onClearRoute: () => void
  onSaveRoute: () => void
  routePoints: RoutePoint[]
}

export function RouteControls({
  isDrawing,
  hasPoints,
  onToggleDrawing,
  onClearRoute,
  onSaveRoute,
  routePoints,
}: RouteControlsProps) {
  // Calculate approximate distance (simplified)
  const calculateDistance = () => {
    if (routePoints.length < 2) return 0

    let distance = 0
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1]
      const curr = routePoints[i]

      // Simplified distance calculation (Haversine formula would be more accurate)
      const dx = (curr.lng - prev.lng) * 111 // km per degree longitude
      const dy = (curr.lat - prev.lat) * 111 // km per degree latitude
      distance += Math.sqrt(dx * dx + dy * dy)
    }

    return distance
  }

  const distance = calculateDistance()

  return (
    <Card className="absolute left-4 top-4 z-10 p-4 shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={onToggleDrawing} variant={isDrawing ? "default" : "outline"} className="flex-1">
            <Pencil className="mr-2 h-4 w-4" />
            {isDrawing ? "ルート作成中" : "ルート作成開始"}
          </Button>
        </div>

        {hasPoints && (
          <>
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ポイント数:</span>
                <span className="font-semibold text-foreground">{routePoints.length}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">距離:</span>
                <span className="font-semibold text-foreground">{distance.toFixed(2)} km</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onClearRoute} variant="outline" size="sm" className="flex-1 bg-transparent">
                <Trash2 className="mr-2 h-4 w-4" />
                クリア
              </Button>
              <Button onClick={onSaveRoute} size="sm" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
