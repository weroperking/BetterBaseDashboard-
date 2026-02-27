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
import { Database, Table2, ChevronRight } from "lucide-react"

export default function TableEditorPage() {
  const params = useParams()
  const tableName = params.tableName as string
  const { getActive } = useConnectionStore()
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <nav className="flex items-center gap-2 text-sm text-foreground-light mb-4">
          <Link href="/dashboard/tables" className="hover:text-foreground hover:underline">Tables</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-foreground">{tableName}</span>
        </nav>
        <div className="h-96 rounded-lg border border-border bg-surface-100 animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <nav className="flex items-center gap-2 text-sm text-foreground-light mb-4">
          <Link href="/dashboard/tables" className="hover:text-foreground hover:underline">Tables</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-foreground">{tableName}</span>
        </nav>
        <Card className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <PageContainer size="full">
      <nav className="flex items-center gap-2 text-sm text-foreground-light mb-4">
        <Link href="/dashboard/tables" className="hover:text-foreground hover:underline">Tables</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-mono text-foreground">{tableName}</span>
      </nav>

      <PageHeader 
        title={tableName}
        subtitle={`${rows.length.toLocaleString()} rows`}
      />

      <Card className="bg-surface-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Table2 className="h-4 w-4 text-foreground-light" />
            Table Data
            <Badge variant="secondary">{rows.length.toLocaleString()} rows</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {columns.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="font-mono text-xs">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col) => (
                        <TableCell key={col} className="font-mono text-xs text-foreground-light">
                          {String(row[col] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <p className="text-sm text-foreground-light">No rows found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
