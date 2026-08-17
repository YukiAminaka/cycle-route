"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Route } from "@/types/mapbox";
import { Calendar, Clock, MapPin, TrendingUp } from "lucide-react";

interface ActivityProps {
  routes: Route[];
}

export function Activity({ routes }: ActivityProps) {
  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            アクティビティ
          </h2>
          <p className="text-muted-foreground">
            最近のサイクリングルートの履歴
          </p>
        </div>

        {routes.length === 0 ? (
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
            {routes.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">title</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        2024-06-01
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
                        <p className="text-lg font-semibold">
                          {route.distance.toFixed(1)} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          獲得標高
                        </p>
                        <p className="text-lg font-semibold">0 m</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          推定時間
                        </p>
                        <p className="text-lg font-semibold">0 h</p>
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
  );
}
