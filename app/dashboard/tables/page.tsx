"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, TableInfo } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Plus, RefreshCw, ChevronRight, Layers } from "lucide-react"

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

  const refreshTables = () => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)
    
    setLoading(true)
    client.getTables().then(result => {
      if (result.error) {
        setError(result.error)
      } else {
        setTables(result.data || [])
      }
      setLoading(false)
    })
  }

  if (loading && tables.length === 0) {
    return (
      <PageContainer size="full">
        <PageHeader 
          title="Tables" 
          subtitle="Browse and manage your database tables"
        />
        <div className="h-64 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer size="full">
        <PageHeader 
          title="Tables" 
          subtitle="Browse and manage your database tables"
        />
        <Card className="p-8 text-center">
          <Database className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="Tables" 
        subtitle="Browse and manage your database tables"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refreshTables}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              New Table
            </Button>
          </div>
        }
      />

      {tables.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <Layers className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No tables yet</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Create your first table to get started with your database
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              Create Table
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Database className="h-4 w-4 text-[#a0a0a0]" />
              Database Tables
              <Badge variant="secondary">{tables.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Row Count</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.name} className="group">
                    <TableCell>
                      <Link
                        href={`/dashboard/tables/${table.name}`}
                        className="flex items-center gap-2 text-[#24b47e] hover:underline font-medium"
                      >
                        <Database className="h-4 w-4" />
                        <span className="font-mono">{table.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-[#a0a0a0]">{table.count.toLocaleString()} rows</span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/tables/${table.name}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-4 w-4 text-[#a0a0a0]" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
