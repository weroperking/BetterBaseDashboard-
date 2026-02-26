"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, LogEntry } from "@/lib/betterbase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500"
    if (status >= 400 && status < 500) return "text-yellow-500"
    if (status >= 500) return "text-red-500"
    return ""
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-500"
      case "POST": return "text-green-500"
      case "PUT": return "text-yellow-500"
      case "DELETE": return "text-red-500"
      default: return ""
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Request Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Requests ({logs.length})
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
                  <TableCell>
                    <span className={`font-medium ${getMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.path}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(log.statusCode)}>
                      {log.statusCode}
                    </span>
                  </TableCell>
                  <TableCell>{log.responseTimeMs}ms</TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}