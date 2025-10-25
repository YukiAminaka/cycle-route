"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Route } from "@/components/map-interface"
import { Calendar, MapPin, TrendingUp, Activity } from "lucide-react"

interface DashboardProps {
  routes: Route[]
  onLoadRoute: (route: Route) => void
  onDeleteRoute: (routeId: string) => void
  onViewDetails: (route: Route) => void
}

export function Dashboard({ routes, onLoadRoute, onDeleteRoute, onViewDetails }: DashboardProps) {
  const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0)
  const totalElevation = routes.reduce((sum, route) => sum + route.elevationGain, 0)
  const totalRoutes = routes.length

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">ダッシュボード</h2>
          <p className="text-muted-foreground mt-1">あなたのサイクリング統計とルート</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総ルート数</p>
                <p className="text-2xl font-bold text-foreground">{totalRoutes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総距離</p>
                <p className="text-2xl font-bold text-foreground">{totalDistance.toFixed(1)} km</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総獲得標高</p>
                <p className="text-2xl font-bold text-foreground">{totalElevation.toFixed(0)} m</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Routes List */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">保存されたルート</h3>
          {routes.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだルートが保存されていません</p>
              <p className="text-sm text-muted-foreground mt-2">マップビューでルートを作成してください</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <Card key={route.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{route.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(route.createdAt).toLocaleDateString("ja-JP")}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">距離</p>
                        <p className="font-semibold text-foreground">{route.distance.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">獲得標高</p>
                        <p className="font-semibold text-foreground">{route.elevationGain.toFixed(0)} m</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => onViewDetails(route)}
                      >
                        詳細
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteRoute(route.id)}>
                        削除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
