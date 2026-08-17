"use client";

import {
  searchMyRoutes,
  SearchMyRoutesState,
} from "@/features/routes/actions/search-my-routes";
import { RouteCard } from "@/features/routes/components/route-card";
import { searchRouteSchema } from "@/features/routes/types/schema";
import {
  formatDate,
  formatDistance,
  formatDuration,
} from "@/features/routes/utils/format";
import { getMapboxStaticImageUrl } from "@/services/mapbox";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Bike, Clock, LayoutGrid, List, Mountain, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ViewMode = "card" | "list";

interface MyRoutesProps {
  defaultViewMode?: ViewMode;
  hideViewToggle?: boolean;
}

export function MyRoutes({ defaultViewMode = "card", hideViewToggle = false }: MyRoutesProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [state, action, isPending] = useActionState<
    SearchMyRoutesState | null,
    FormData
  >(searchMyRoutes, null);

  // マウント時に自動的にルート一覧を取得
  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  const [form, fields] = useForm({
    lastResult: state?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: searchRouteSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleViewDetails = (routeId: string | undefined) => {
    if (routeId) {
      router.push(`/routes/${routeId}`);
    }
  };

  return (
    <>
      {/* ビューモード切替 */}
      {!hideViewToggle && (
        <div className="mb-8 flex justify-end">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("card")}
              aria-label="カード表示"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              aria-label="リスト表示"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 検索フォーム */}
      <form
        ref={formRef}
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        noValidate
      >
        <div className="mb-6 flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={fields.keyword?.id}
              name={fields.keyword?.name}
              placeholder="キーワードで検索"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "検索中..." : "検索"}
          </Button>
        </div>

        {form.errors && (
          <div className="mb-4 text-sm text-destructive">
            {form.errors.join(", ")}
          </div>
        )}
        {fields.keyword?.errors && (
          <div className="mb-4 text-sm text-destructive">
            {fields.keyword.errors}
          </div>
        )}
      </form>

      {/* 検索結果 */}
      {state?.data?.routes && state.data.routes.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          ルートが見つかりません
        </div>
      )}

      {state?.data?.routes && state.data.routes.length > 0 && (
        <>
          {viewMode === "card" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {state.data.routes.map((route) => (
                <Card
                  key={route.id}
                  className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg py-0 rounded-sm"
                  onClick={() => handleViewDetails(route.id)}
                >
                  <div className="relative aspect-video bg-muted">
                    {route.polyline ? (
                      <Image
                        src={getMapboxStaticImageUrl(route.polyline, {
                          strokeColor: "F52738",
                          strokeWidth: 3,
                          style: "mapbox/streets-v12",
                          width: 409,
                          height: 230,
                        })}
                        alt={route.name ?? "ルートプレビュー"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        ルートプレビュー
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(route.created_at)}
                      </span>
                    </div>
                    <h3 className="mb-3 text-base font-semibold">
                      {route.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bike className="h-4 w-4" />
                        <span>{formatDistance(route.distance)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(route.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mountain className="h-4 w-4" />
                        <span>{route.elevation_gain ?? 0} m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {state.data.routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
