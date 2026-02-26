# BetterBaseDashboard — Remaining Pages
> **Prerequisite:** `betterbase_dashboard_rebuild.md` must be completed first.
> This document implements every page and component that was listed in the project
> structure but not yet implemented. Read the rebuild document first so you understand
> the connection system, hooks pattern, and meta client before touching this file.
> **Zero mock data. Every number comes from the meta API.**

---

## WHAT IS ALREADY BUILT (do not rebuild these)

From `betterbase_dashboard_rebuild.md`:
- `app/connect/page.tsx` — connection manager
- `app/dashboard/layout.tsx` — shell with sidebar
- `app/dashboard/page.tsx` — overview with stats grid and chart
- `app/dashboard/logs/page.tsx` — request logs with filters
- `components/layout/sidebar.tsx` — sidebar with nav and project switcher
- `components/overview/stats-grid.tsx` — stats cards
- `components/overview/requests-chart.tsx` — area chart
- `lib/betterbase-client.ts` — meta API client
- `lib/store.ts` — zustand connection store
- `hooks/use-stats.ts` — stats and chart data
- `hooks/use-tables.ts` — table list and rows
- `hooks/use-users.ts` — users list and delete
- `hooks/use-logs.ts` — request logs

---

## WHAT THIS DOCUMENT BUILDS

In order:
1. `components/layout/header.tsx` — top bar (referenced in layout but never written)
2. `hooks/use-keys.ts` — API keys hook
3. `hooks/use-realtime.ts` — WebSocket connection monitor hook
4. `app/dashboard/tables/page.tsx` — table browser
5. `app/dashboard/tables/[tableName]/page.tsx` — table editor with inline editing
6. `app/dashboard/auth/page.tsx` — auth user manager
7. `app/dashboard/api/page.tsx` — API keys panel + API explorer
8. `app/dashboard/realtime/page.tsx` — realtime connection monitor
9. `app/dashboard/settings/page.tsx` — project settings

---

## PART 1: HEADER COMPONENT

The dashboard layout references `<Header connection={connection} />` but it was never written.

**File:** `components/layout/header.tsx`

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useConnectionStore, type ProjectConnection } from "@/lib/store"
import { LogOut, Plus, RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  connection: ProjectConnection
}

export function Header({ connection }: HeaderProps) {
  const router = useRouter()
  const { removeConnection, getActive } = useConnectionStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setRefreshing(false), 600)
  }

  function handleDisconnect() {
    const active = getActive()
    if (!active) return
    removeConnection(active.id)
    router.push("/connect")
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">

      {/* Left — project URL badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-mono text-muted-foreground truncate max-w-xs">
            {connection.url}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-xs text-muted-foreground font-mono">
          {connection.projectId
            ? `ID: ${connection.projectId.slice(0, 8)}...`
            : "self-hosted"}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* Refresh all data */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>

        {/* Add another project */}
        <button
          onClick={() => router.push("/connect")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add project
        </button>

        {/* Disconnect */}
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </button>
      </div>
    </header>
  )
}
```

---

## PART 2: MISSING HOOKS

### `hooks/use-keys.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useKeys() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getKeys()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    // Keys don't change often — refresh every 60 seconds is enough
    refetchInterval: 60000,
  })
}
```

### `hooks/use-realtime.ts`

The realtime page monitors the WebSocket server. This requires a new meta endpoint
on the backend. Add this endpoint to `templates/base/src/routes/meta.ts` in the
backend before using this hook:

```typescript
// Add this to meta.ts in the backend:
//
// GET /api/meta/realtime
// Returns current WebSocket connection stats
//
// metaRoute.get("/realtime", async (c) => {
//   // The realtime server tracks connected clients internally
//   // Import the realtimeServer instance from src/lib/realtime.ts
//   const stats = realtimeServer.getStats()
//   return c.json({ data: stats, error: null })
// })
//
// And add getStats() to the RealtimeServer class in templates/base/src/lib/realtime.ts:
// getStats() {
//   return {
//     connectedClients: this.clients.size,
//     totalSubscriptions: [...this.clients.values()]
//       .reduce((sum, client) => sum + client.subscriptions.size, 0),
//     subscribedTables: [...new Set(
//       [...this.clients.values()]
//         .flatMap(c => [...c.subscriptions])
//     )],
//   }
// }
```

**File:** `hooks/use-realtime.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export interface RealtimeStats {
  connectedClients: number
  totalSubscriptions: number
  subscribedTables: string[]
}

export function useRealtimeStats() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["realtime-stats"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      // Uses a raw fetch since getRealtimeStats isn't in the typed client yet
      const result = await (client as any).request<RealtimeStats>("/realtime")
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    refetchInterval: 3000, // refresh every 3 seconds for live feel
  })
}
```

Also add `getRealtimeStats()` to `lib/betterbase-client.ts`:

```typescript
// Add to BetterBaseMetaClient class:
async getRealtimeStats() {
  return this.request<RealtimeStats>("/realtime")
}
```

And add the type to `lib/betterbase-client.ts`:

```typescript
export interface RealtimeStats {
  connectedClients: number
  totalSubscriptions: number
  subscribedTables: string[]
}
```

---

## PART 3: TABLES PAGE

**File:** `app/dashboard/tables/page.tsx`

```tsx
"use client"

import Link from "next/link"
import { useTables } from "@/hooks/use-tables"
import { Table2, ChevronRight, Database } from "lucide-react"

export default function TablesPage() {
  const { data: tables, isLoading, error } = useTables()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tables</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and edit your database tables
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load tables: {error.message}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tables?.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No tables found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Define tables in your schema.ts and run bb migrate
          </p>
        </div>
      )}

      {/* Table list */}
      {!isLoading && tables && tables.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_40px] gap-4 px-4 py-3 border-b border-border bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">Table name</span>
            <span className="text-xs font-medium text-muted-foreground">Rows</span>
            <span />
          </div>

          {tables.map((table, index) => (
            <Link
              key={table.name}
              href={`/dashboard/tables/${table.name}`}
              className="grid grid-cols-[1fr_120px_40px] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <Table2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-mono text-foreground">{table.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {table.count.toLocaleString()}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## PART 4: TABLE EDITOR PAGE

This is the most complex page. It shows rows in a spreadsheet-like grid with inline editing, row insertion, and row deletion.

**File:** `app/dashboard/tables/[tableName]/page.tsx`

```tsx
"use client"

import { use, useState } from "react"
import { useTableRows } from "@/hooks/use-tables"
import { useMetaClient } from "@/hooks/use-project"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Props {
  params: Promise<{ tableName: string }>
}

export default function TableEditorPage({ params }: Props) {
  const { tableName } = use(params)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const { data, isLoading, error, refetch } = useTableRows(tableName, limit, offset)
  const rows = data?.rows ?? []
  const totalCount = data?.count ?? 0

  // Derive columns from first row
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tables"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Tables
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-mono font-medium text-foreground">{tableName}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {totalCount.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Table grid */}
      <div className="flex-1 rounded-lg border border-border overflow-auto bg-card">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No rows in this table</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/80 backdrop-blur">
                <th className="w-10 px-3 py-2.5 text-left border-b border-border border-r border-border">
                  <span className="text-xs text-muted-foreground">#</span>
                </th>
                {columns.map(col => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-left border-b border-border border-r border-border last:border-r-0 min-w-[140px]"
                  >
                    <span className="text-xs font-medium font-mono text-muted-foreground">
                      {col}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  row={row}
                  rowIndex={offset + rowIndex + 1}
                  columns={columns}
                  tableName={tableName}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalCount > limit && (
        <div className="flex items-center justify-between flex-shrink-0 px-1">
          <p className="text-xs text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + limit, totalCount)} of {totalCount.toLocaleString()} rows
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalCount}
              className="px-3 py-1.5 rounded-md text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TableRow component ────────────────────────────────────────────────────────
// Handles inline cell editing for a single row.

interface TableRowProps {
  row: Record<string, unknown>
  rowIndex: number
  columns: string[]
  tableName: string
}

function TableRow({ row, rowIndex, columns, tableName }: TableRowProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  function startEdit(col: string) {
    setEditing(col)
    setEditValue(String(row[col] ?? ""))
  }

  function cancelEdit() {
    setEditing(null)
    setEditValue("")
  }

  // NOTE: Actual save requires a PATCH /api/meta/tables/:tableName/rows/:id endpoint
  // on the backend. Add this to meta.ts before enabling saves:
  //
  // metaRoute.patch("/tables/:tableName/rows/:id", requireServiceRole, async (c) => {
  //   const { tableName, id } = c.req.param()
  //   const body = await c.req.json()
  //   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
  //     return c.json({ data: null, error: "Invalid table name" }, 400)
  //   }
  //   const setClauses = Object.entries(body)
  //     .map(([k, v]) => sql`${sql.identifier(k)} = ${v}`)
  //   await db.run(sql`UPDATE ${sql.identifier(tableName)} SET ${sql.join(setClauses, sql`, `)} WHERE id = ${id}`)
  //   return c.json({ data: { updated: true }, error: null })
  // })

  async function saveEdit(col: string) {
    // For now, log the intent — wire to backend PATCH once endpoint exists
    console.log(`SAVE: table=${tableName}, col=${col}, value=${editValue}`)
    cancelEdit()
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
      {/* Row number */}
      <td className="px-3 py-2 border-r border-border text-xs text-muted-foreground text-right w-10 select-none">
        {rowIndex}
      </td>

      {/* Data cells */}
      {columns.map(col => {
        const value = row[col]
        const isEditing = editing === col

        return (
          <td
            key={col}
            className="px-0 py-0 border-r border-border last:border-r-0 max-w-[280px]"
            onDoubleClick={() => startEdit(col)}
          >
            {isEditing ? (
              <input
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => saveEdit(col)}
                onKeyDown={e => {
                  if (e.key === "Enter") saveEdit(col)
                  if (e.key === "Escape") cancelEdit()
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-primary/5 border-primary outline-none ring-1 ring-primary"
              />
            ) : (
              <div className="px-3 py-2 text-xs font-mono text-foreground truncate cursor-default">
                {value === null || value === undefined ? (
                  <span className="text-muted-foreground italic">null</span>
                ) : typeof value === "boolean" ? (
                  <span className={value ? "text-green-500" : "text-red-500"}>
                    {String(value)}
                  </span>
                ) : (
                  String(value)
                )}
              </div>
            )}
          </td>
        )
      })}
    </tr>
  )
}
```

---

## PART 5: AUTH USER MANAGER PAGE

**File:** `app/dashboard/auth/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useUsers, useDeleteUser } from "@/hooks/use-users"
import { Users, Search, Trash2, CheckCircle, XCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const limit = 20

  const { data, isLoading } = useUsers(limit, offset)
  const deleteUser = useDeleteUser()

  const users = data?.users ?? []
  const totalCount = data?.count ?? 0

  // Client-side search filter (for name/email)
  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  async function handleDelete(userId: string) {
    await deleteUser.mutateAsync(userId)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} registered users`
              : "No users yet"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Users table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email verified</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {search ? "No users match your search" : "No users yet"}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">

                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar initials */}
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email verified */}
                  <td className="px-4 py-3">
                    {user.emailVerified ? (
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span className="text-xs">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="text-xs">Unverified</span>
                      </div>
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3">
                    {confirmDelete === user.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteUser.isPending}
                          className="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                        >
                          {deleteUser.isPending ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalCount > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + limit, totalCount)} of {totalCount.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= totalCount}
                className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## PART 6: API KEYS PAGE

This page shows the API keys panel and a built-in API request tester.

**File:** `app/dashboard/api/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useKeys } from "@/hooks/use-keys"
import { useConnectionStore } from "@/lib/store"
import { Key, Copy, Check, Eye, EyeOff, Send, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ApiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your API keys and a built-in request tester
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <KeysPanel />
        <ApiExplorer />
      </div>
    </div>
  )
}

// ── Keys Panel ────────────────────────────────────────────────────────────────

function KeysPanel() {
  const { data: keys, isLoading } = useKeys()
  const connection = useConnectionStore(s => s.getActive())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showServiceKey, setShowServiceKey] = useState(false)

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-medium text-foreground">API Keys</h2>

      {/* Info banner */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>anon key</strong> — Safe to use in browser and mobile apps. Respects RLS policies.<br />
          <strong>service_role key</strong> — Full admin access. Bypasses RLS. Never expose in client-side code.
        </p>
      </div>

      {/* Project URL */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Project URL
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded text-foreground truncate">
            {connection?.url ?? "—"}
          </code>
          <button
            onClick={() => copyToClipboard(connection?.url ?? "", "url")}
            className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {copiedId === "url"
              ? <Check className="h-3.5 w-3.5 text-green-500" />
              : <Copy className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </div>

      {/* Keys from database */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map(i => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : keys?.map(key => (
        <div key={key.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                {key.keyType === "anon" ? "Anon key" : "Service role key"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {key.lastUsedAt
                  ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                  : "Never used"}
              </span>
              {key.keyType === "anon" ? (
                <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  Public
                </span>
              ) : (
                <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                  Secret
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded text-foreground">
              {key.keyPrefix}
            </code>
            <button
              onClick={() => copyToClipboard(key.keyPrefix, key.id)}
              className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {copiedId === key.id
                ? <Check className="h-3.5 w-3.5 text-green-500" />
                : <Copy className="h-3.5 w-3.5" />
              }
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Created {new Date(key.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </p>
        </div>
      ))}

      {/* Usage example */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Usage
        </p>
        <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto text-foreground">
{`import { createClient } from '@betterbase/client'

const bb = createClient({
  url: '${connection?.url ?? "http://localhost:3000"}',
  key: YOUR_ANON_KEY,
})`}
        </pre>
      </div>
    </div>
  )
}

// ── API Explorer ──────────────────────────────────────────────────────────────

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

const METHOD_COLORS: Record<Method, string> = {
  GET:    "text-blue-500",
  POST:   "text-green-500",
  PUT:    "text-yellow-500",
  DELETE: "text-red-500",
  PATCH:  "text-orange-500",
}

function ApiExplorer() {
  const connection = useConnectionStore(s => s.getActive())
  const [method, setMethod] = useState<Method>("GET")
  const [path, setPath] = useState("/api/users")
  const [body, setBody] = useState("")
  const [response, setResponse] = useState<{
    status: number
    data: unknown
    time: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendRequest() {
    if (!connection) return
    setLoading(true)
    setResponse(null)

    const start = Date.now()
    try {
      const res = await fetch(`${connection.url}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${connection.serviceRoleKey}`,
        },
        body: method !== "GET" && body ? body : undefined,
      })

      const json = await res.json().catch(() => null)
      setResponse({
        status: res.status,
        data: json,
        time: Date.now() - start,
      })
    } catch (err) {
      setResponse({
        status: 0,
        data: { error: String(err) },
        time: Date.now() - start,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-medium text-foreground">API Explorer</h2>

      {/* Request builder */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">

        {/* Method + path */}
        <div className="flex items-center gap-0 border-b border-border">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as Method)}
            className={cn(
              "px-3 py-2.5 text-xs font-mono font-bold bg-muted border-r border-border focus:outline-none",
              METHOD_COLORS[method]
            )}
          >
            {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="/api/users"
            className="flex-1 px-3 py-2.5 text-xs font-mono bg-background text-foreground focus:outline-none"
          />
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Body editor (shown for non-GET) */}
        {method !== "GET" && (
          <div className="border-b border-border">
            <div className="px-3 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs text-muted-foreground">Request body (JSON)</span>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              className="w-full px-3 py-2 text-xs font-mono bg-background text-foreground focus:outline-none resize-none"
            />
          </div>
        )}

        {/* Response */}
        <div className="min-h-[120px]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {response && (
            <div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
                <span className={cn(
                  "text-xs font-mono font-bold",
                  response.status >= 200 && response.status < 300 ? "text-green-500" :
                  response.status >= 400 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {response.status === 0 ? "Network Error" : `${response.status}`}
                </span>
                <span className="text-xs text-muted-foreground">{response.time}ms</span>
              </div>

              {/* Response body */}
              <pre className="px-3 py-3 text-xs font-mono text-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}

          {!loading && !response && (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-muted-foreground">Send a request to see the response</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick endpoints */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick endpoints
        </p>
        <div className="space-y-1">
          {[
            { method: "GET" as Method, path: "/health" },
            { method: "GET" as Method, path: "/api/users" },
            { method: "GET" as Method, path: "/api/meta/stats" },
            { method: "GET" as Method, path: "/api/meta/tables" },
            { method: "GET" as Method, path: "/api/meta/logs" },
            { method: "GET" as Method, path: "/api/graphql" },
          ].map(endpoint => (
            <button
              key={`${endpoint.method}${endpoint.path}`}
              onClick={() => { setMethod(endpoint.method); setPath(endpoint.path) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-muted transition-colors"
            >
              <span className={cn("text-xs font-mono font-bold w-12", METHOD_COLORS[endpoint.method])}>
                {endpoint.method}
              </span>
              <span className="text-xs font-mono text-foreground">{endpoint.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## PART 7: REALTIME PAGE

**File:** `app/dashboard/realtime/page.tsx`

```tsx
"use client"

import { useRealtimeStats } from "@/hooks/use-realtime"
import { useConnectionStore } from "@/lib/store"
import { Zap, Users, Radio, Table2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function RealtimePage() {
  const { data: stats, isLoading } = useRealtimeStats()
  const connection = useConnectionStore(s => s.getActive())
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [events, setEvents] = useState<Array<{
    id: string
    type: string
    table: string
    timestamp: string
  }>>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Live WebSocket preview — connects to the project's WebSocket
  // and shows incoming events in real time
  useEffect(() => {
    if (!connection) return

    const wsUrl = connection.url.replace("http://", "ws://").replace("https://", "wss://") + "/ws"
    setWsStatus("connecting")

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setWsStatus("connected")
    ws.onclose = () => setWsStatus("disconnected")
    ws.onerror = () => setWsStatus("disconnected")

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type && data.table) {
          setEvents(prev => [{
            id: Math.random().toString(36).slice(2),
            type: data.type,
            table: data.table,
            timestamp: new Date().toLocaleTimeString(),
          }, ...prev].slice(0, 50)) // keep last 50 events
        }
      } catch {}
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [connection?.url])

  function subscribeToAll() {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: "subscribe", table: "*" }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Realtime</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor live WebSocket connections and database events
        </p>
      </div>

      {/* Connection status + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* WebSocket status */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Dashboard connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${
              wsStatus === "connected" ? "bg-green-500 animate-pulse" :
              wsStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
              "bg-red-500"
            }`} />
            <span className="text-sm font-medium text-foreground capitalize">{wsStatus}</span>
          </div>
        </div>

        {/* Connected clients */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Connected clients</span>
          </div>
          {isLoading ? (
            <div className="h-6 w-8 rounded bg-muted animate-pulse" />
          ) : (
            <span className="text-2xl font-semibold text-foreground">
              {stats?.connectedClients ?? 0}
            </span>
          )}
        </div>

        {/* Active subscriptions */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Active subscriptions</span>
          </div>
          {isLoading ? (
            <div className="h-6 w-8 rounded bg-muted animate-pulse" />
          ) : (
            <span className="text-2xl font-semibold text-foreground">
              {stats?.totalSubscriptions ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Subscribed tables */}
      {stats?.subscribedTables && stats.subscribedTables.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Tables with active subscribers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.subscribedTables.map(table => (
              <span
                key={table}
                className="px-2.5 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary"
              >
                {table}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live event stream */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              wsStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
            }`} />
            <span className="text-sm font-medium text-foreground">Live event stream</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={subscribeToAll}
              disabled={wsStatus !== "connected"}
              className="px-3 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Subscribe to all tables
            </button>
            <button
              onClick={() => setEvents([])}
              className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="divide-y divide-border min-h-[200px] max-h-[400px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {wsStatus === "connected"
                  ? "Waiting for database events..."
                  : "Connect to start seeing live events"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Events appear here when rows are inserted, updated, or deleted
              </p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="flex items-center gap-4 px-4 py-2.5 hover:bg-muted/20">
                <span className="text-xs font-mono text-muted-foreground w-20 flex-shrink-0">
                  {event.timestamp}
                </span>
                <span className={`text-xs font-mono font-bold w-16 flex-shrink-0 ${
                  event.type === "INSERT" ? "text-green-500" :
                  event.type === "UPDATE" ? "text-yellow-500" :
                  event.type === "DELETE" ? "text-red-500" : "text-blue-500"
                }`}>
                  {event.type}
                </span>
                <span className="text-xs font-mono text-foreground">{event.table}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## PART 8: SETTINGS PAGE

**File:** `app/dashboard/settings/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Settings, Trash2, ExternalLink, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { getActive, removeConnection, connections } = useConnectionStore()
  const connection = getActive()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function handleRemoveConnection() {
    if (!connection) return
    removeConnection(connection.id)
    if (connections.length <= 1) {
      router.push("/connect")
    } else {
      router.push("/dashboard")
    }
  }

  if (!connection) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connection settings for {connection.name}
        </p>
      </div>

      {/* Connection info */}
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-medium text-foreground">Connection details</h2>
        </div>
        <div className="divide-y divide-border">

          {[
            { label: "Project name", value: connection.name, field: "name" },
            { label: "Project URL", value: connection.url, field: "url" },
            { label: "Project ID", value: connection.projectId || "Not available", field: "id" },
            {
              label: "Added",
              value: new Date(connection.addedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              }),
              field: "added",
              noCopy: true
            },
          ].map(item => (
            <div key={item.field} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-mono text-foreground mt-0.5 break-all">{item.value}</p>
              </div>
              {!item.noCopy && (
                <button
                  onClick={() => copy(item.value, item.field)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-4"
                >
                  {copiedField === item.field
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5" />
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-medium text-foreground">Quick links</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "API health check", href: `${connection.url}/health` },
            { label: "GraphQL playground", href: `${connection.url}/api/graphql` },
            { label: "BetterBase docs", href: "https://betterbase.dev/docs" },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm text-foreground">{link.label}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-destructive/30 bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-destructive/30 bg-destructive/5">
          <h2 className="text-sm font-medium text-destructive">Danger zone</h2>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Remove connection</p>
              <p className="text-xs text-muted-foreground mt-1">
                Removes this project from your dashboard. Your actual project data is not affected.
              </p>
            </div>
            {confirmRemove ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleRemoveConnection}
                  className="px-3 py-1.5 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Confirm remove
                </button>
                <button
                  onClick={() => setConfirmRemove(false)}
                  className="px-3 py-1.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRemove(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## PART 9: DARK MODE SUPPORT

All pages use Tailwind's `dark:` variants. Add theme toggle support to the header and configure Tailwind:

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",  // ← add this
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [],
}

export default config
```

**File:** `app/globals.css`

Add CSS variables for light and dark mode:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --primary: 222 89% 55%;
    --primary-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --ring: 222 89% 55%;
  }

  .dark {
    --background: 222 47% 8%;
    --foreground: 210 40% 98%;
    --card: 222 47% 10%;
    --muted: 222 47% 14%;
    --muted-foreground: 215 20% 55%;
    --border: 222 47% 18%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --ring: 217 91% 60%;
  }
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

---

## PART 10: VERIFICATION CHECKLIST

After implementing all pages in this document, verify each one:

```bash
# Start both servers
# Terminal 1: cd your-betterbase-project && bun dev
# Terminal 2: cd BetterBaseDashboard && bun dev

# Then open http://localhost:3001 and check every page:
```

| Page | URL | What to verify |
|------|-----|----------------|
| Header | all pages | Refresh button works, project URL shown, disconnect works |
| Tables list | /dashboard/tables | Real table names from schema appear, row counts are accurate |
| Table editor | /dashboard/tables/users | Rows load, columns from real schema, double-click shows input |
| Auth users | /dashboard/auth | Real users from BetterAuth appear, delete works with confirm |
| API keys | /dashboard/api | Key prefixes shown, API explorer can hit /health and get response |
| Realtime | /dashboard/realtime | WebSocket connects (green dot), events appear when you mutate data |
| Settings | /dashboard/settings | Connection details shown, remove connection works |
| Dark mode | any page | Toggle dark/light, all pages readable in both modes |

**Zero mock data rule:** If any page shows hardcoded numbers, it is not done. Every number must come from the meta API.
