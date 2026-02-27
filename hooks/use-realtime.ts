import { useEffect, useState, useRef } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, RealtimeStats } from "@/lib/betterbase-client"

export function useRealtime() {
  const { getActive } = useConnectionStore()
  const [data, setData] = useState<RealtimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchRealtimeStats() {
      setLoading(true)
      const result = await client.getRealtimeStats()
      
      if (result.error) {
        setError(new Error(result.error))
        // Stop polling on error to avoid excessive failed requests
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        setData(result.data || null)
        setError(null)
      }
      
      setLoading(false)
    }

    // Initial fetch
    fetchRealtimeStats()

    // Set up refetch interval
    intervalRef.current = setInterval(fetchRealtimeStats, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [getActive])

  return { data, loading, error }
}
