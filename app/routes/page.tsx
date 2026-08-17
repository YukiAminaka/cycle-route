import { MyRoutes } from "@/features/routes/components/my-routes";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RoutesPage() {
  return (
    <div className="h-full w-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">ルート</h1>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/routes/new">新しいルートを作成</Link>
          </Button>
        </div>
        <MyRoutes />
      </div>
    </div>
  );
}
