"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, LogEntry } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, RefreshCw, Search, Filter, Download, ChevronDown, ChevronUp } from "lucide-react"

export default function LogsPage() {
  const { getActive } = useConnectionStore()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

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

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (methodFilter && log.method !== methodFilter) return false
    if (statusFilter) {
      const statusGroup = parseInt(String(statusFilter))
      if (statusGroup === 2 && (log.statusCode < 200 || log.statusCode >= 300)) return false
      if (statusGroup === 4 && (log.statusCode < 400 || log.statusCode >= 500)) return false
      if (statusGroup === 5 && log.statusCode < 500) return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return log.path.toLowerCase().includes(query) || 
             log.method.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return <Badge variant="success">{status}</Badge>
    if (status >= 400 && status < 500) return <Badge variant="warning">{status}</Badge>
    if (status >= 500) return <Badge variant="danger">{status}</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET": return <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/10">GET</Badge>
      case "POST": return <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10">POST</Badge>
      case "PUT": return <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10">PUT</Badge>
      case "DELETE": return <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-500/10">DELETE</Badge>
      default: return <Badge variant="outline">{method}</Badge>
    }
  }

  if (loading && logs.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader title="Request Logs" subtitle="View recent API request logs" />
        <div className="h-64 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="Request Logs" subtitle="View recent API request logs" />
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Request Logs" 
        subtitle="View recent API request logs"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refreshLogs}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#2d2d2d] border border-[#404040] rounded-[6px] text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#24b47e]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#666666]" />
            <select
              value={methodFilter || ""}
              onChange={(e) => setMethodFilter(e.target.value || null)}
              className="h-9 px-3 bg-[#2d2d2d] border border-[#404040] rounded-[6px] text-sm text-white focus:outline-none focus:border-[#24b47e]"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="h-9 px-3 bg-[#2d2d2d] border border-[#404040] rounded-[6px] text-sm text-white focus:outline-none focus:border-[#24b47e]"
            >
              <option value="">All Status</option>
              <option value="2">2xx Success</option>
              <option value="4">4xx Client Error</option>
              <option value="5">5xx Server Error</option>
            </select>
          </div>
          
          <span className="text-xs text-[#666666]">
            {filteredLogs.length} logs
          </span>
        </CardContent>
      </Card>

      <Card>
        {logs.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-[#666666]" />
            </div>
            <p className="text-base font-semibold text-white">No logs yet</p>
            <p className="text-sm text-[#a0a0a0] mt-1">
              API request logs will appear here
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <FileText className="h-4 w-4 text-[#a0a0a0]" />
                Recent Requests
                <Badge variant="secondary">{filteredLogs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 100).map((log) => (
                    <>
                      <TableRow 
                        key={log.id}
                        className="cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        <TableCell>{getMethodBadge(log.method)}</TableCell>
                        <TableCell className="font-mono text-sm text-[#a0a0a0]">{log.path}</TableCell>
                        <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                        <TableCell className="text-[#a0a0a0]">{log.responseTimeMs}ms</TableCell>
                        <TableCell className="text-[#666666] text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {expandedRow === log.id ? (
                            <ChevronUp className="h-4 w-4 text-[#666666]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[#666666]" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow === log.id && (
                        <TableRow key={`${log.id}-expanded`}>
                          <TableCell colSpan={6} className="bg-[#1e1e1e]">
                            <div className="grid grid-cols-2 gap-4 p-4">
                              <div>
                                <p className="text-xs text-[#666666] mb-1">User ID</p>
                                <code className="text-xs font-mono text-white">{log.userId || '—'}</code>
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] mb-1">Key Type</p>
                                <code className="text-xs font-mono text-white">{log.keyType || '—'}</code>
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] mb-1">IP Address</p>
                                <code className="text-xs font-mono text-white">{log.ipAddress || '—'}</code>
                              </div>
                              <div>
                                <p className="text-xs text-[#666666] mb-1">Timestamp</p>
                                <code className="text-xs font-mono text-white">{log.createdAt}</code>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
              {filteredLogs.length > 100 && (
                <div className="p-4 border-t border-[#333333] text-center">
                  <p className="text-sm text-[#a0a0a0]">
                    Showing first 100 logs. Use filters to narrow results.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </PageContainer>
  )
}
