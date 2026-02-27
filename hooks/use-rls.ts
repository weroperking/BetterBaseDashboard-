import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useRlsPolicies() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["rls-policies"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getRlsPolicies()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    staleTime: 30000,
  })
}
