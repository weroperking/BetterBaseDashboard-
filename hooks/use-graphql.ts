import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useGraphqlSchema() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["graphql-schema"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getGraphqlSchema()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    staleTime: 60000,
    retry: false, // don't retry 404 — it just means GraphQL isn't set up yet
  })
}
