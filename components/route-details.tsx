"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MapPin, TrendingUp, Clock, Mountain } from "lucide-react"
import type { Route } from "@/components/map-interface"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

type RouteDetailsProps = {
  route: Route
  onClose: () => void
}

export function RouteDetails({ route, onClose }: RouteDetailsProps) {
  // Generate elevation profile data
  const elevationData = route.points.map((point, index) => {
    // Simulate elevation based on distance (in real app, would use actual elevation data)
    const distance = (index / route.points.length) * route.distance
    const baseElevation = 50
    const variation = Math.sin(index * 0.3) * 30 + Math.cos(index * 0.15) * 20
    const elevation = baseElevation + variation + (index * route.elevationGain) / route.points.length

    return {
      distance: distance.toFixed(1),
      elevation: Math.max(0, elevation),
    }
  })

  const estimatedTime = Math.round(route.distance * 3)
  const avgSpeed = (route.distance / (estimatedTime / 60)).toFixed(1)
  const difficulty = route.elevationGain > 500 ? "上級" : route.elevationGain > 200 ? "中級" : "初級"

  return (
    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm">
      <Card className="absolute right-4 top-4 bottom-4 w-full max-w-2xl overflow-auto shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground text-balance">{route.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">距離</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{route.distance.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">km</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">獲得標高</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{route.elevationGain}</p>
              <p className="text-xs text-muted-foreground">m</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">推定時間</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{estimatedTime}</p>
              <p className="text-xs text-muted-foreground">分</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">難易度</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{difficulty}</p>
              <p className="text-xs text-muted-foreground">レベル</p>
            </Card>
          </div>

          {/* Elevation Profile */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">標高プロファイル</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={elevationData}>
                <defs>
                  <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="distance"
                  label={{ value: "距離 (km)", position: "insideBottom", offset: -5 }}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  label={{ value: "標高 (m)", angle: -90, position: "insideLeft" }}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="elevation"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#elevationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Additional Info */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">詳細情報</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ポイント数</span>
                <span className="font-semibold text-foreground">{route.points.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">平均速度</span>
                <span className="font-semibold text-foreground">{avgSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">作成日</span>
                <span className="font-semibold text-foreground">
                  {new Date(route.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Route Points Summary */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">ルートポイント</h3>
            <div className="max-h-40 overflow-auto space-y-2">
              {route.points.slice(0, 5).map((point, index) => (
                <div key={point.id} className="flex items-center gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-muted-foreground">
                      {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              ))}
              {route.points.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">他 {route.points.length - 5} ポイント</p>
              )}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
