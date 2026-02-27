import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useStorageBuckets() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["storage-buckets"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getStorageBuckets()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    retry: false,
  })
}

export function useStorageFiles(bucket: string, prefix = "") {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["storage-files", bucket, prefix],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getStorageFiles(bucket, prefix)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client && !!bucket,
  })
}

export function useDeleteStorageFile(bucket: string) {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.deleteStorageFile(bucket, key)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: (_, key) => {
      qc.invalidateQueries({ queryKey: ["storage-files", bucket] })
    },
  })
}
