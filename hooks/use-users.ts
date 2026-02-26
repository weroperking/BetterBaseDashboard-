import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, AuthUser } from "@/lib/betterbase-client"

export function useUsers() {
  const { getActive } = useConnectionStore()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchUsers() {
      setLoading(true)
      const result = await client.getUsers()
      
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(result.data || [])
      }
      
      setLoading(false)
    }

    fetchUsers()
  }, [getActive])

  return { users, loading, error }
}