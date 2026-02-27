import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, ProjectInfo } from "@/lib/betterbase-client"

export function useMetaClient() {
  const { getActive } = useConnectionStore()
  const connection = getActive()
  if (!connection) return null
  return new BetterBaseMetaClient(connection)
}

export function useProject() {
  const { getActive } = useConnectionStore()
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

    const client = new BetterBaseMetaClient(connection)

    async function fetchProject() {
      setLoading(true)
      const result = await client.getProject()
      
      if (result.error) {
        setError(result.error)
      } else {
        setProject(result.data)
      }
      
      setLoading(false)
    }

    fetchProject()
  }, [getActive])

  return { project, loading, error }
}