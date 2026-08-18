"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bike,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderClientProps {
  currentView?: "dashboard" | "activity" | "routes";
  isAuthenticated: boolean;
  logoutUrl?: string;
  userId?: string;
}

export function HeaderClient({
  currentView,
  isAuthenticated,
  logoutUrl,
  userId,
}: HeaderClientProps) {
  const router = useRouter();

  const viewLabels = {
    dashboard: "ダッシュボード",
    activity: "アクティビティ",
    routes: "マイルート",
  };

  const handleSignOut = async () => {
    if (logoutUrl) {
      // Ory Kratosのログアウトフローを実行
      window.location.href = logoutUrl;
    } else {
      // フォールバック: トップページに戻る
      router.push("/");
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <Bike className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">CycleRoute</h1>
        </Link>
        {isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/routes/new"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                ルートプランナー
              </Link>
              <Link
                href="/explore"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                探索
              </Link>
              <Link
                href="/activity"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                アクティビティ
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      {currentView ? viewLabels[currentView] : "メニュー"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/activity")}>
                      アクティビティ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/routes")}>
                      マイルート
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className="cursor-pointer">
                      <AvatarImage />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(userId ? `/users/${userId}` : "/users")
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    プロフィール
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push("/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    メッセージ
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/settings/profile")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    設定
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    ヘルプ
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    サインアウト
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Globe className="mr-2 h-4 w-4" />
                    日本語
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="hidden md:inline-flex"
                onClick={() => router.push("/routes/new")}
              >
                新規ルート作成
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              ログイン
            </Button>
            <Button onClick={() => router.push("/register")}>新規登録</Button>
          </div>
        )}
      </div>
    </header>
  );
}
