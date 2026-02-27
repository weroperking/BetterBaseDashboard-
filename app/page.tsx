"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { Loader2 } from "lucide-react"

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
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-foreground-light">Loading...</p>
      </div>
    </div>
  )
}
