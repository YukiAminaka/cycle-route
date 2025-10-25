"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useState } from "react"
import type { RoutePoint, Route } from "@/components/map-interface"
import { saveRoute } from "@/lib/route-storage"

type RoutePanelProps = {
  routePoints: RoutePoint[]
  onClose: () => void
  onSave: (route: Route) => void
}

export function RoutePanel({ routePoints, onClose, onSave }: RoutePanelProps) {
  const [routeName, setRouteName] = useState("")
  const [description, setDescription] = useState("")

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
  const elevationGain = Math.round(distance * 20) // Simplified elevation calculation
  const estimatedTime = Math.round(distance * 3) // 3 minutes per km

  const handleSave = () => {
    if (!routeName.trim()) {
      alert("ルート名を入力してください")
      return
    }

    const route: Route = {
      id: `route-${Date.now()}`,
      name: routeName,
      points: routePoints,
      distance,
      elevationGain,
      createdAt: new Date(),
    }

    saveRoute(route)
    onSave(route)
    onClose()
  }

  return (
    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm">
      <Card className="absolute right-4 top-4 bottom-4 w-full max-w-md overflow-auto shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">ルートを保存</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route-name">ルート名</Label>
            <Input
              id="route-name"
              placeholder="例: 多摩川サイクリングロード"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="ルートの詳細を入力..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h3 className="font-semibold text-sm text-foreground">ルート情報</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">距離</p>
                <p className="font-semibold text-foreground">{distance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-muted-foreground">獲得標高</p>
                <p className="font-semibold text-foreground">{elevationGain} m</p>
              </div>
              <div>
                <p className="text-muted-foreground">推定時間</p>
                <p className="font-semibold text-foreground">{estimatedTime} 分</p>
              </div>
              <div>
                <p className="text-muted-foreground">ポイント数</p>
                <p className="font-semibold text-foreground">{routePoints.length}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            ルートを保存
          </Button>
        </div>
      </Card>
    </div>
  )
}
