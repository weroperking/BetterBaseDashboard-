"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, TableInfo } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"

export default function TablesPage() {
  const { getActive } = useConnectionStore()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchTables() {
      setLoading(true)
      const result = await client.getTables()
      
      if (result.error) {
        setError(result.error)
      } else {
        setTables(result.data || [])
      }
      
      setLoading(false)
    }

    fetchTables()
  }, [getActive])

  if (loading) {
    return (
      <PageContainer size="full">
        <PageHeader title="Tables" subtitle="Browse and manage your database tables" />
        <div className="h-64 rounded-lg border border-border bg-surface-100 animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader title="Tables" subtitle="Browse and manage your database tables" />
        <Card className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Tables" 
        subtitle="Browse and manage your database tables"
      />

      <Card className="bg-surface-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Database className="h-4 w-4 text-foreground-light" />
            Database Tables
            <Badge variant="secondary">{tables.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Row Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell>
                    <Link
                      href={`/dashboard/tables/${table.name}`}
                      className="text-brand hover:underline font-medium"
                    >
                      {table.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{table.count.toLocaleString()} rows</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {tables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Database className="h-8 w-8 text-foreground-muted" />
                      <p className="text-sm text-foreground-light">No tables found</p>
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
