import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, LogEntry } from "@/lib/betterbase-client"

export function useLogs(params?: {
  limit?: number
  offset?: number
  method?: string
  statusMin?: number
  statusMax?: number
}) {
  const { getActive } = useConnectionStore()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchLogs() {
      setLoading(true)
      const result = await client.getLogs(params)
      
      if (result.error) {
        setError(result.error)
      } else {
        setLogs(result.data || [])
      }
      
      setLoading(false)
    }

    fetchLogs()
  }, [getActive, params?.limit, params?.offset, params?.method, params?.statusMin, params?.statusMax])

  return { logs, loading, error }
}