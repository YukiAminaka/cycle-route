"use client"

import { Header } from "@/components/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Calendar, Bike, Mountain, TrendingUp, Settings } from "lucide-react"
import { use } from "react"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock user data - in a real app, this would be fetched based on the id
  const user = {
    id,
    name: "田中 太郎",
    username: "tanaka_taro",
    bio: "週末サイクリストです。山岳ルートが大好きで、毎週末新しいルートを探索しています。",
    location: "東京都",
    joinedDate: "2023年4月",
    avatar: "/images/design-mode/shadcn.png",
    stats: {
      totalDistance: 2847.5,
      totalElevation: 45230,
      totalRoutes: 127,
      followers: 342,
      following: 189,
    },
    recentActivities: [
      {
        id: "1",
        name: "箱根ヒルクライム",
        date: "2024年1月15日",
        distance: 45.2,
        elevation: 1234,
        time: "2h 34m",
      },
      {
        id: "2",
        name: "多摩川サイクリングロード",
        date: "2024年1月12日",
        distance: 62.8,
        elevation: 234,
        time: "3h 12m",
      },
      {
        id: "3",
        name: "奥多摩周遊",
        date: "2024年1月8日",
        distance: 89.4,
        elevation: 2156,
        time: "5h 45m",
      },
    ],
    achievements: [
      { id: "1", name: "100kmライダー", icon: "🚴", description: "100km以上のライドを完走" },
      { id: "2", name: "山岳王", icon: "⛰️", description: "累計獲得標高10,000m達成" },
      { id: "3", name: "早起き", icon: "🌅", description: "朝5時前に10回ライド開始" },
      { id: "4", name: "探検家", icon: "🗺️", description: "50以上の異なるルートを走破" },
    ],
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          {/* Profile Header */}
          <Card className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>

                <p className="text-foreground leading-relaxed">{user.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {user.joinedDate}に参加
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <button className="hover:underline">
                    <span className="font-bold text-foreground">{user.stats.followers}</span>{" "}
                    <span className="text-muted-foreground">フォロワー</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-bold text-foreground">{user.stats.following}</span>{" "}
                    <span className="text-muted-foreground">フォロー中</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button>フォロー</Button>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Bike className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{user.stats.totalDistance.toLocaleString()} km</p>
                  <p className="text-sm text-muted-foreground">総走行距離</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mountain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{user.stats.totalElevation.toLocaleString()} m</p>
                  <p className="text-sm text-muted-foreground">総獲得標高</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{user.stats.totalRoutes}</p>
                  <p className="text-sm text-muted-foreground">作成ルート数</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activities">アクティビティ</TabsTrigger>
              <TabsTrigger value="routes">ルート</TabsTrigger>
              <TabsTrigger value="achievements">実績</TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4">
              {user.recentActivities.map((activity) => (
                <Card key={activity.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Bike className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{activity.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mountain className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{activity.elevation} m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-foreground">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">完了</Badge>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="routes" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p>保存されたルートがここに表示されます</p>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
