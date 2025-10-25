import type { Route } from "@/components/map-interface"

const STORAGE_KEY = "cycling-routes"

export function saveRoute(route: Route): void {
  const routes = getSavedRoutes()
  routes.push(route)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
}

export function getSavedRoutes(): Route[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const routes = JSON.parse(stored)
    // Convert date strings back to Date objects
    return routes.map((route: Route) => ({
      ...route,
      createdAt: new Date(route.createdAt),
    }))
  } catch {
    return []
  }
}

export function deleteRoute(routeId: string): void {
  const routes = getSavedRoutes()
  const filtered = routes.filter((route) => route.id !== routeId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
