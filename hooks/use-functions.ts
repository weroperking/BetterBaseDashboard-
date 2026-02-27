import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useEdgeFunctions() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["edge-functions"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getEdgeFunctions()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    refetchInterval: 10000, // re-check build status every 10 seconds
  })
}
