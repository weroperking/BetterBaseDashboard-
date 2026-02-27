"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, ApiKeyInfo } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Key, RefreshCw, Copy, Plus } from "lucide-react"
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here in the future
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  if (loading && keys.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader title="API Keys" subtitle="Manage API keys and authentication" />
        <div className="h-64 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="API Keys" subtitle="Manage API keys and authentication" />
        <Card className="p-8 text-center">
          <Key className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
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
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refreshKeys}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              New Key
            </Button>
          </div>
        }
      />

      {/* API Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-[rgba(36,180,126,0.2)] flex items-center justify-center flex-shrink-0">
              <Key className="h-5 w-5 text-[#24b47e]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">API Keys</p>
              <p className="text-xs text-[#a0a0a0] mt-1">
                Use these keys to authenticate API requests. The <code className="font-mono bg-[#2d2d2d] px-1 rounded">anon</code> key is safe for client-side code. 
                The <code className="font-mono bg-[#2d2d2d] px-1 rounded">service_role</code> key bypasses RLS and should be kept secret.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        {keys.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-[#666666]" />
            </div>
            <p className="text-base font-semibold text-white">No API keys</p>
            <p className="text-sm text-[#a0a0a0] mt-1">
              Create an API key to access your project programmatically
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Key className="h-4 w-4 text-[#a0a0a0]" />
                Active Keys
                <Badge variant="secondary">{keys.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <Badge variant={key.keyType === "service_role" ? "danger" : "outline"}>
                          {key.keyType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-[#a0a0a0]">
                            {key.keyPrefix}...
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(key.keyPrefix)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#a0a0a0]">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#a0a0a0]">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </>
        )}
      </Card>

      {/* REST Endpoints */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            REST Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { method: "GET", path: "/api/{table}", desc: "List records" },
              { method: "GET", path: "/api/{table}/{id}", desc: "Get single record" },
              { method: "POST", path: "/api/{table}", desc: "Create record" },
              { method: "PUT", path: "/api/{table}/{id}", desc: "Update record" },
              { method: "DELETE", path: "/api/{table}/{id}", desc: "Delete record" },
            ].map((endpoint, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-[#2d2d2d]">
                <Badge variant={endpoint.method === "GET" ? "info" : endpoint.method === "POST" ? "success" : endpoint.method === "DELETE" ? "danger" : "warning"}>
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono text-white">{endpoint.path}</code>
                <span className="text-xs text-[#666666]">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
