"use client"

import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"
import { RouteDetails } from "@/components/route-details"
import { useState, useEffect } from "react"
import { getSavedRoutes, deleteRoute } from "@/lib/route-storage"
import { useRouter } from "next/navigation"
import type { Route } from "@/components/map-interface"

export default function DashboardPage() {
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([])
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<Route | null>(null)
  const router = useRouter()

  useEffect(() => {
    setSavedRoutes(getSavedRoutes())
  }, [])

  const handleLoadRoute = (route: Route) => {
    // Navigate to home page with route data (could use query params or state)
    router.push("/")
  }

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId)
    setSavedRoutes(getSavedRoutes())
  }

  const handleViewDetails = (route: Route) => {
    setSelectedRouteForDetails(route)
  }

  return (
    <div className="flex h-screen flex-col">
      <Header currentView="dashboard" />
      <main className="flex-1 overflow-hidden">
        <Dashboard
          routes={savedRoutes}
          onLoadRoute={handleLoadRoute}
          onDeleteRoute={handleDeleteRoute}
          onViewDetails={handleViewDetails}
        />
        {selectedRouteForDetails && (
          <RouteDetails route={selectedRouteForDetails} onClose={() => setSelectedRouteForDetails(null)} />
        )}
      </main>
    </div>
  )
}
