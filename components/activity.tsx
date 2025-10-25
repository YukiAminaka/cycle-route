"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Route } from "@/components/map-interface"
import { Calendar, MapPin, TrendingUp, Clock } from "lucide-react"

interface ActivityProps {
  routes: Route[]
}

export function Activity({ routes }: ActivityProps) {
  // Sort routes by date (most recent first)
  const sortedRoutes = [...routes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const calculateEstimatedTime = (distance: number) => {
    // Assuming average speed of 20 km/h
    const hours = distance / 20
    const minutes = Math.round(hours * 60)
    if (minutes < 60) {
      return `${minutes}分`
    }
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}時間${m > 0 ? `${m}分` : ""}`
  }

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">アクティビティ</h2>
          <p className="text-muted-foreground">最近のサイクリングルートの履歴</p>
        </div>

        {sortedRoutes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                まだアクティビティがありません
                <br />
                新しいルートを作成してサイクリングを始めましょう
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedRoutes.map((route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{route.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(route.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">距離</p>
                        <p className="text-lg font-semibold">{route.distance.toFixed(1)} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">獲得標高</p>
                        <p className="text-lg font-semibold">{route.elevationGain.toFixed(0)} m</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">推定時間</p>
                        <p className="text-lg font-semibold">{calculateEstimatedTime(route.distance)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
