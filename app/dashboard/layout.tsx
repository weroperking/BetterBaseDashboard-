"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { getActive } = useConnectionStore()

  useEffect(() => {
    if (!getActive()) {
      router.replace("/connect")
    }
  }, [])

  const connection = getActive()
  if (!connection) return null

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Fixed Sidebar - 280px width, bg-secondary */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar - 56px height */}
        <DashboardHeader />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          {children}
        </main>
      </div>
    </div>
  )
}
