import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, ApiKeyInfo } from "@/lib/betterbase-client"

export function useKeys() {
  const { getActive } = useConnectionStore()
  const [data, setData] = useState<ApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchKeys() {
      setLoading(true)
      const result = await client.getKeys()
      
      if (result.error) {
        setError(new Error(result.error))
      } else {
        setData(result.data || [])
      }
      
      setLoading(false)
    }

    fetchKeys()
  }, [getActive])

  return { data, loading, error }
}
