import { MyRoutes } from "@/features/routes/components/my-routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoggedInUserInfo } from "@/features/users/fetcher/login-user-info";
import { getServerSession } from "@ory/nextjs/app";
import {
  Bike,
  Camera,
  Clock,
  Flame,
  MapPin,
  Mountain,
  Settings,
} from "lucide-react";
import { notFound } from "next/navigation";
import { ActivityChart } from "./activity-chart";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const session = await getServerSession();
  if (!session) {
    return notFound();
  }

  const { data, error } = await getLoggedInUserInfo();

  if (error || !data?.user) {
    notFound();
  }

  const user = data!.user!;
  const activityRange = {
    label: "2024/09/30〜2024/10/06のアクティビティ",
    distance: 70.1,
    time: "3時間7分",
    elevation: 152,
  };

  const career = {
    distance: 4155.5,
    elevation: 20103,
    activities: 82,
    activeTime: "170:27",
    calories: 11888,
    photos: 2,
  };

  const days = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div className="overflow-auto h-full bg-background">
      <div className="mx-auto max-w-5xl space-y-0">
        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden rounded-b-xl">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-neutral-800 via-neutral-700 to-neutral-900" />
          {/* Topographic pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-end p-8 pb-6">
            <div className="flex items-end gap-6">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl font-bold bg-amber-400 text-white">
                  {user.name}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {user.name}
                </h1>
                <div className="flex items-center gap-1 mt-1 text-white/90">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {user.locality}, {user.administrative_area},{" "}
                    {user.country_code}
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-1"></p>
              </div>
            </div>

            <div className="ml-auto pb-1 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button className="bg-white text-neutral-900 hover:bg-white/90">
                フォロー
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Summary Section */}
        <Card className="rounded-none border-x-0 border-t-0 shadow-none">
          <div className="px-8 py-6">
            <div className="flex items-start gap-8">
              {/* Left: period + count */}
              <div className="min-w-40">
                <p className="text-sm text-muted-foreground mb-1">過去4週間</p>
                <p className="text-6xl font-bold text-foreground leading-none">
                  {0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  合計アクティビティ
                </p>
              </div>

              <Separator orientation="vertical" className="h-20 self-center" />

              {/* Right: days of week */}
              <div className="flex-1">
                <div className="flex gap-3 mb-4">
                  {days.map((day) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {day}
                      </span>
                      <div className="w-6 h-6 rounded-full border border-border" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-muted-foreground">
                  <Bike className="h-5 w-5" />
                  <span className="text-sm">アクティビティなし</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Chart Section */}
        <Card className="rounded-none border-x-0 shadow-none">
          <div className="px-8 py-6">
            {/* Date range header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {activityRange.label}
                </p>
                <div className="flex gap-6 mt-1">
                  <div className="text-center">
                    <span className="text-lg font-bold text-foreground">
                      {activityRange.distance} km
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-foreground">
                      {activityRange.time}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-foreground">
                      {activityRange.elevation} m
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="cursor-pointer">
                  タイム
                </Badge>
                <Badge className="cursor-pointer">距離</Badge>
                <Badge variant="secondary" className="cursor-pointer">
                  月別
                </Badge>
              </div>
            </div>

            <ActivityChart />
          </div>
        </Card>

        {/* Career Stats Section */}
        <Card className="rounded-none border-x-0 shadow-none">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-foreground">
                キャリア
              </h2>
              <Tabs defaultValue="career">
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3">
                    週
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3">
                    月
                  </TabsTrigger>
                  <TabsTrigger value="year" className="text-xs px-3">
                    年
                  </TabsTrigger>
                  <TabsTrigger value="career" className="text-xs px-3">
                    キャリア
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-3 gap-0 divide-x divide-y border rounded-lg overflow-hidden">
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.distance.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    移動距離（キロメートル）
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.elevation.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Mountain className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    メートルの獲得標高
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.activities}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    アクティビティ
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.activeTime}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    アクティブ時間
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.calories.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">消費カロリー</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">
                  {career.photos}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    撮影された写真
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Routes & Activities */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              最近のルートとアクティビティ
            </h2>
          </div>

          <MyRoutes defaultViewMode="list" hideViewToggle />
        </div>
      </div>
    </div>
  );
}
