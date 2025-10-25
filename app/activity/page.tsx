"use client"

import { Header } from "@/components/header"
import { Activity } from "@/components/activity"
import { useState, useEffect } from "react"
import { getSavedRoutes } from "@/lib/route-storage"
import type { Route } from "@/components/map-interface"

export default function ActivityPage() {
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([])

  useEffect(() => {
    setSavedRoutes(getSavedRoutes())
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <Header currentView="activity" />
      <main className="flex-1 overflow-hidden">
        <Activity routes={savedRoutes} />
      </main>
    </div>
  )
}
