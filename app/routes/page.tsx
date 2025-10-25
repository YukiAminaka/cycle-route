"use client"

import { Header } from "@/components/header"
import { MyRoutes } from "@/components/my-routes"
import { RouteDetails } from "@/components/route-details"
import { useState, useEffect } from "react"
import { getSavedRoutes, deleteRoute } from "@/lib/route-storage"
import { useRouter } from "next/navigation"
import type { Route } from "@/components/map-interface"

export default function RoutesPage() {
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([])
  const [selectedRouteForDetails, setSelectedRouteForDetails] = useState<Route | null>(null)
  const router = useRouter()

  useEffect(() => {
    setSavedRoutes(getSavedRoutes())
  }, [])

  const handleLoadRoute = (route: Route) => {
    // Navigate to home page to load the route on the map
    router.push("/")
  }

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId)
    setSavedRoutes(getSavedRoutes())
  }

  const handleViewDetails = (route: Route) => {
    setSelectedRouteForDetails(route)
  }

  const handleCreateNew = () => {
    router.push("/")
  }

  return (
    <div className="flex h-screen flex-col">
      <Header currentView="routes" />
      <main className="flex-1 overflow-hidden">
        <MyRoutes
          routes={savedRoutes}
          onLoadRoute={handleLoadRoute}
          onDeleteRoute={handleDeleteRoute}
          onViewDetails={handleViewDetails}
          onCreateNew={handleCreateNew}
        />
        {selectedRouteForDetails && (
          <RouteDetails route={selectedRouteForDetails} onClose={() => setSelectedRouteForDetails(null)} />
        )}
      </main>
    </div>
  )
}
