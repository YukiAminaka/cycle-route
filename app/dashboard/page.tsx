import { MyRoutes } from "@/features/routes/components/my-routes";

export default function DashboardPage() {
  return (
    <div className="h-full w-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">ダッシュボード</h2>
          <p className="text-muted-foreground mt-1">
            あなたのサイクリング統計とルート
          </p>
        </div>
        <MyRoutes defaultViewMode="list" />
      </div>
    </div>
  );
}
