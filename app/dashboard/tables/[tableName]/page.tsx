"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Table2, ChevronRight, Plus, RefreshCw, Search, ArrowUpDown } from "lucide-react"

export default function TableEditorPage() {
  const params = useParams()
  const tableName = params.tableName as string
  const { getActive } = useConnectionStore()
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchRows() {
      setLoading(true)
      const result = await client.getTableRows(tableName)
      
      if (result.error) {
        setError(result.error)
      } else {
        setRows(result.data || [])
      }
      
      setLoading(false)
    }

    if (tableName) {
      fetchRows()
    }
  }, [getActive, tableName])

  if (loading) {
    return (
      <PageContainer size="full">
        <nav className="flex items-center gap-2 text-sm text-[#a0a0a0] mb-4">
          <Link href="/dashboard/tables" className="hover:text-white hover:underline">Tables</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-white">{tableName}</span>
        </nav>
        <PageHeader 
          title={tableName}
          subtitle="View and manage table data"
        />
        <div className="h-96 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <nav className="flex items-center gap-2 text-sm text-[#a0a0a0] mb-4">
          <Link href="/dashboard/tables" className="hover:text-white hover:underline">Tables</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-white">{tableName}</span>
        </nav>
        <PageHeader 
          title={tableName}
          subtitle="View and manage table data"
        />
        <Card className="p-8 text-center">
          <Database className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  
  // Filter rows based on search query
  const filteredRows = searchQuery 
    ? rows.filter(row => 
        columns.some(col => 
          String(row[col] ?? "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : rows

  return (
    <PageContainer size="full">
      <nav className="flex items-center gap-2 text-sm text-[#a0a0a0] mb-4">
        <Link href="/dashboard/tables" className="hover:text-white hover:underline">Tables</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-mono text-white">{tableName}</span>
      </nav>

      <PageHeader 
        title={tableName}
        subtitle={`${rows.length.toLocaleString()} rows`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Add Row
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#2d2d2d] border border-[#404040] rounded-[6px] text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#24b47e]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
            <span>Showing {filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} rows</span>
          </div>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card>
        {columns.length > 0 ? (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Table2 className="h-4 w-4 text-[#a0a0a0]" />
                Table Data
                <Badge variant="secondary">{rows.length.toLocaleString()} rows</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col} className="font-mono text-xs">
                          <button className="flex items-center gap-1 hover:text-white">
                            {col}
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.slice(0, 100).map((row, i) => (
                      <TableRow key={i}>
                        {columns.map((col) => (
                          <TableCell key={col} className="font-mono text-xs text-[#a0a0a0] max-w-[300px] truncate">
                            {row[col] === null ? (
                              <span className="text-[#666666] italic">null</span>
                            ) : (
                              String(row[col] ?? "")
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredRows.length > 100 && (
                <div className="p-4 border-t border-[#333333] text-center">
                  <p className="text-sm text-[#a0a0a0]">
                    Showing first 100 rows. Use search to filter.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-[#666666]" />
            </div>
            <p className="text-base font-semibold text-white">No data in table</p>
            <p className="text-sm text-[#a0a0a0] mt-1">
              This table exists but contains no rows
            </p>
          </CardContent>
        )}
      </Card>
    </PageContainer>
  )
}
