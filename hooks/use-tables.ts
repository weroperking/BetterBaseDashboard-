import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, TableInfo } from "@/lib/betterbase-client"

export function useTables() {
  const { getActive } = useConnectionStore()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchTables() {
      setLoading(true)
      const result = await client.getTables()
      
      if (result.error) {
        setError(result.error)
      } else {
        setTables(result.data || [])
      }
      
      setLoading(false)
    }

    fetchTables()
  }, [getActive])

  return { tables, loading, error }
}