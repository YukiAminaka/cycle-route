"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Bike, Clock, Mountain, Star, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Route } from "@/components/map-interface"
import { useRouter } from "next/navigation"

interface MyRoutesProps {
  routes: Route[]
  onLoadRoute: (route: Route) => void
  onDeleteRoute: (routeId: string) => void
  onViewDetails: (route: Route) => void
  onCreateNew?: () => void
}

export function MyRoutes({ routes, onLoadRoute, onDeleteRoute, onViewDetails, onCreateNew }: MyRoutesProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDuration = (distance: number) => {
    const hours = Math.floor(distance / 20)
    const minutes = Math.round((distance / 20 - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      router.push("/routes/new")
    }
  }

  return (
    <div className="h-full w-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Myルート</h1>
          <div className="text-sm text-muted-foreground">
            さまざまなデバイスに
            <span className="text-primary">ルートを共有＆エクスポート</span>
            する方法をご確認ください。
          </div>
        </div>

        <Button onClick={handleCreateNew} className="mb-6 bg-primary hover:bg-primary/90">
          新しいルートを作成
        </Button>

        <div className="mb-6 flex gap-4">
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="すべてのスポーツ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのスポーツ</SelectItem>
              <SelectItem value="cycling">サイクリング</SelectItem>
              <SelectItem value="running">ランニング</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="キーワードで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {paginatedRoutes.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">ルートが見つかりません</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedRoutes.map((route) => (
                <Card
                  key={route.id}
                  className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                  onClick={() => onViewDetails(route)}
                >
                  <div className="relative aspect-video bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 400 300" className="h-full w-full">
                        <rect width="400" height="300" fill="#f0f0f0" />
                        <polyline
                          points={route.points
                            .map((p, i) => {
                              const x = 50 + (i / route.points.length) * 300
                              const y = 150 + Math.sin(i * 0.5) * 50
                              return `${x},${y}`
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#ff6b35"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">{formatDate(route.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-sm hover:bg-accent"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onLoadRoute(route)
                              }}
                            >
                              ルートを読み込む
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewDetails(route)
                              }}
                            >
                              詳細を表示
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteRoute(route.id)
                              }}
                              className="text-destructive"
                            >
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="mb-3 text-lg font-semibold">{route.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bike className="h-4 w-4" />
                        <span>{route.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(route.distance)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mountain className="h-4 w-4" />
                        <span>{route.elevationGain} m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  前へ
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-primary" : ""}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
