"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header connection={connection} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}