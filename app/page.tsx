"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"

export default function HomePage() {
  const router = useRouter()
  const { getActive } = useConnectionStore()

  useEffect(() => {
    const connection = getActive()
    if (connection) {
      router.replace("/dashboard")
    } else {
      router.replace("/connect")
    }
  }, [getActive, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}