"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, LogEntry } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LogsPage() {
  const { getActive } = useConnectionStore()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchLogs() {
      setLoading(true)
      const result = await client.getLogs()
      
      if (result.error) {
        setError(result.error)
      } else {
        setLogs(result.data || [])
      }
      
      setLoading(false)
    }

    fetchLogs()
  }, [getActive])

  const refreshLogs = () => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)
    
    setLoading(true)
    client.getLogs().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setLogs(result.data || [])
      }
      setLoading(false)
    })
  }

  if (loading) {
    return (
      <PageContainer size="full">
        <PageHeader title="Request Logs" subtitle="View recent API request logs" />
        <div className="h-64 rounded-lg border border-border bg-surface-100 animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="Request Logs" subtitle="View recent API request logs" />
        <Card className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return <Badge variant="brand">{status}</Badge>
    if (status >= 400 && status < 500) return <Badge variant="warning">{status}</Badge>
    if (status >= 500) return <Badge variant="destructive">{status}</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET": return <Badge variant="outline" className="text-blue-500 border-blue-500/20">GET</Badge>
      case "POST": return <Badge variant="outline" className="text-green-500 border-green-500/20">POST</Badge>
      case "PUT": return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">PUT</Badge>
      case "DELETE": return <Badge variant="outline" className="text-destructive border-destructive/20">DELETE</Badge>
      default: return <Badge variant="outline">{method}</Badge>
    }
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Request Logs" 
        subtitle="View recent API request logs"
        actions={
          <Button
            variant="default"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={refreshLogs}
          >
            Refresh
          </Button>
        }
      />

      <Card className="bg-surface-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <FileText className="h-4 w-4 text-foreground-light" />
            Recent Requests
            <Badge variant="secondary">{logs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getMethodBadge(log.method)}</TableCell>
                  <TableCell className="font-mono text-sm text-foreground-light">{log.path}</TableCell>
                  <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                  <TableCell className="text-foreground-light">{log.responseTimeMs}ms</TableCell>
                  <TableCell className="text-foreground-light text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-foreground-muted" />
                      <p className="text-sm text-foreground-light">No logs found</p>
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
