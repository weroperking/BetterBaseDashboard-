import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useWebhooks() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getWebhooks()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
  })
}

export function useCreateWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      table: string
      events: string[]
      url: string
      secret?: string
    }) => {
      if (!client) throw new Error("No connection")
      const result = await client.createWebhook(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useDeleteWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.deleteWebhook(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useToggleWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      if (!client) throw new Error("No connection")
      const result = await client.updateWebhook(id, { enabled })
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useTestWebhook() {
  const client = useMetaClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.testWebhook(id)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}
