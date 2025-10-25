"use client"

import { MapInterface } from "@/components/map-interface"
import { Header } from "@/components/header"

export default function NewRoutePage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <MapInterface />
      </main>
    </div>
  )
}
