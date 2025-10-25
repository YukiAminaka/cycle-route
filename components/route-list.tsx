"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, MapPin, TrendingUp, Clock, Eye } from "lucide-react"
import type { Route } from "@/components/map-interface"

type RouteListProps = {
  routes: Route[]
  onLoadRoute: (route: Route) => void
  onDeleteRoute: (routeId: string) => void
  onViewDetails: (route: Route) => void
}

export function RouteList({ routes, onLoadRoute, onDeleteRoute, onViewDetails }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">保存されたルートはありません</p>
        <p className="mt-2 text-sm text-muted-foreground">地図上でルートを作成して保存してください</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <Card key={route.id} className="p-4 transition-all hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-balance mb-2">{route.name}</h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{route.distance.toFixed(1)} km</span>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{route.elevationGain.toFixed(0)} m</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{Math.round(route.distance * 3)} 分</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(route.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onLoadRoute(route)} className="flex-1">
                  地図に表示
                </Button>
                <Button size="sm" variant="outline" onClick={() => onViewDetails(route)} className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  詳細
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteRoute(route.id)
              }}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
