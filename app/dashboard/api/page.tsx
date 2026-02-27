"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, ApiKeyInfo } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Key, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ApiPage() {
  const { getActive } = useConnectionStore()
  const [keys, setKeys] = useState<ApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchKeys() {
      setLoading(true)
      const result = await client.getKeys()
      
      if (result.error) {
        setError(result.error)
      } else {
        setKeys(result.data || [])
      }
      
      setLoading(false)
    }

    fetchKeys()
  }, [getActive])

  const refreshKeys = () => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)
    
    setLoading(true)
    client.getKeys().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setKeys(result.data || [])
      }
      setLoading(false)
    })
  }

  if (loading) {
    return (
      <PageContainer size="full">
        <PageHeader title="API Keys" subtitle="Manage API keys and authentication" />
        <div className="h-64 rounded-lg border border-border bg-surface-100 animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="API Keys" subtitle="Manage API keys and authentication" />
        <Card className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="API Keys" 
        subtitle="Manage API keys and authentication"
        actions={
          <Button
            variant="default"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={refreshKeys}
          >
            Refresh
          </Button>
        }
      />

      <Card className="bg-surface-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Key className="h-4 w-4 text-foreground-light" />
            API Keys
            <Badge variant="secondary">{keys.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Badge variant={key.keyType === "service_role" ? "destructive" : "outline"}>
                      {key.keyType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground-light">{key.keyPrefix}...</TableCell>
                  <TableCell className="text-foreground-light">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-foreground-light">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  </TableCell>
                </TableRow>
              ))}
              {keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Key className="h-8 w-8 text-foreground-muted" />
                      <p className="text-sm text-foreground-light">No API keys found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
