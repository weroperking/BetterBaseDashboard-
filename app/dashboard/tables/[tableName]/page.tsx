"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{tableName}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Rows ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {columns.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col) => (
                        <TableCell key={col} className="font-mono text-sm">
                          {String(row[col] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No rows found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}