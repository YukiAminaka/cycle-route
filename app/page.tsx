import { Button } from "@/components/ui/button"
import { Bike, Map, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Bike className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">CycleRoute</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">ログイン</Button>
            <Button>新規登録</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container px-4 py-24 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              サイクリングルートを
              <br />
              計画・記録・共有
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              CycleRouteは、サイクリストのためのルートプランニングツールです。
              <br />
              地図上でルートを作成し、標高プロファイルを確認し、仲間と共有しましょう。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">無料で始める</Link>
              </Button>
              <Button size="lg" variant="outline">
                詳しく見る
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/50 py-24">
          <div className="container px-4 lg:px-6">
            <div className="mx-auto max-w-5xl">
              <h3 className="text-center text-3xl font-bold text-foreground">主な機能</h3>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Map className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">ルートプランニング</h4>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    地図上でクリックするだけで簡単にルートを作成。標高プロファイルもリアルタイムで確認できます。
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">詳細な分析</h4>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    距離、獲得標高、推定時間など、ルートの詳細な統計情報を確認できます。
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-foreground">ルート共有</h4>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    作成したルートを仲間と共有。お気に入りのルートをコミュニティに公開することもできます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container px-4 py-24 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl font-bold text-foreground">今すぐ始めましょう</h3>
            <p className="mt-4 text-lg text-muted-foreground">
              無料でアカウントを作成して、あなたのサイクリングライフをもっと楽しく。
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/dashboard">無料で始める</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground lg:px-6">
          © 2025 CycleRoute. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
