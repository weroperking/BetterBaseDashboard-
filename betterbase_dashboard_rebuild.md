# BetterBaseDashboard — Frontend Rebuild
> **Repository:** Create a new GitHub repo called `BetterBaseDashboard` — separate from the BetterBase backend repo.
> **Prerequisite:** The backend rebuild document (`betterbase_backend_rebuild.md`) must be completed first. The dashboard reads from the meta API — if the meta API doesn't exist, the dashboard has nothing to display.
> **Goal:** A comprehensive, real-data dashboard that looks and works like Supabase Studio. No mock data. No hardcoded numbers.

---

## PART 0: UNDERSTAND WHAT IS BEING BUILT

### What this is

BetterBaseDashboard is a standalone Next.js application that connects to any BetterBase project via URL + service_role key. It reads real data from the BetterBase meta API and displays it in a clean, comprehensive UI.

It is NOT part of the BetterBase backend repo. It lives in its own GitHub repository. Users who only want the CLI + backend never need to touch this repo.

### Three ways to use it

1. **app.betterbase.com** — hosted by us, users log in with their BetterBase account, see all their projects
2. **Self-hosted** — user clones `BetterBaseDashboard` repo, runs locally, connects to their own BetterBase project
3. **Future** — managed cloud version with full project management

### What the dashboard displays (all real data, no mocks)

- Overview stats (users, sessions, requests, errors)
- Request volume chart (last 24 hours)
- Table browser (all user-defined tables, row counts)
- Table editor (view, edit, insert, delete rows)
- Auth user manager (list, search, delete users)
- Request logs (filterable by method, status, path)
- API keys (view prefixes, understand usage)
- Realtime connection monitor
- Project settings

---

## PART 1: REPOSITORY SETUP

### 1.1 Create the repo

```bash
mkdir BetterBaseDashboard
cd BetterBaseDashboard
bun create next-app . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

### 1.2 Install dependencies

```bash
bun add @tanstack/react-query @tanstack/react-query-devtools
bun add recharts
bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
bun add @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip
bun add @radix-ui/react-alert-dialog @radix-ui/react-popover
bun add lucide-react
bun add clsx tailwind-merge
bun add class-variance-authority
bun add nanoid
bun add zustand
```

### 1.3 Project structure

```
BetterBaseDashboard/
├── app/
│   ├── layout.tsx                    ← root layout with providers
│   ├── page.tsx                      ← redirect to /dashboard or /connect
│   ├── connect/
│   │   └── page.tsx                  ← connection manager (add/switch projects)
│   └── dashboard/
│       ├── layout.tsx                ← dashboard shell (sidebar + header)
│       ├── page.tsx                  ← overview/home
│       ├── tables/
│       │   ├── page.tsx              ← table list
│       │   └── [tableName]/
│       │       └── page.tsx          ← table editor
│       ├── auth/
│       │   └── page.tsx              ← user manager
│       ├── logs/
│       │   └── page.tsx              ← request logs
│       ├── api/
│       │   └── page.tsx              ← API keys + API explorer
│       └── settings/
│           └── page.tsx              ← project settings
├── components/
│   ├── ui/                           ← base components (button, card, etc.)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── overview/
│   │   ├── stats-grid.tsx
│   │   └── requests-chart.tsx
│   ├── tables/
│   │   ├── table-list.tsx
│   │   └── table-editor.tsx
│   ├── auth/
│   │   └── users-table.tsx
│   ├── logs/
│   │   └── logs-table.tsx
│   └── api/
│       └── keys-panel.tsx
├── lib/
│   ├── betterbase-client.ts          ← meta API client
│   ├── store.ts                      ← zustand store for connection state
│   └── utils.ts                      ← cn() and helpers
├── hooks/
│   ├── use-project.ts
│   ├── use-stats.ts
│   ├── use-tables.ts
│   ├── use-users.ts
│   └── use-logs.ts
└── types/
    └── betterbase.ts                 ← all API response types
```

---

## PART 2: THE CONNECTION SYSTEM

This is the most important architectural piece. The dashboard supports multiple BetterBase projects. The user adds them via a UI form.

### 2.1 Connection store

**File:** `lib/store.ts`

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ProjectConnection {
  id: string           // local identifier for this connection
  name: string         // human-readable name the user gives it
  url: string          // http://localhost:3000 or https://my-app.com
  serviceRoleKey: string  // the service_role key
  projectId: string    // betterbase project ID
  addedAt: string      // ISO timestamp
  lastConnectedAt?: string
}

interface ConnectionStore {
  connections: ProjectConnection[]
  activeConnectionId: string | null
  addConnection: (conn: Omit<ProjectConnection, "id" | "addedAt">) => void
  removeConnection: (id: string) => void
  setActive: (id: string) => void
  getActive: () => ProjectConnection | null
  updateLastConnected: (id: string) => void
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connections: [],
      activeConnectionId: null,

      addConnection: (conn) => {
        const id = Math.random().toString(36).slice(2, 10)
        set(state => ({
          connections: [...state.connections, {
            ...conn,
            id,
            addedAt: new Date().toISOString(),
          }],
          activeConnectionId: id,
        }))
      },

      removeConnection: (id) => set(state => ({
        connections: state.connections.filter(c => c.id !== id),
        activeConnectionId: state.activeConnectionId === id
          ? state.connections[0]?.id ?? null
          : state.activeConnectionId,
      })),

      setActive: (id) => set({ activeConnectionId: id }),

      getActive: () => {
        const { connections, activeConnectionId } = get()
        return connections.find(c => c.id === activeConnectionId) ?? null
      },

      updateLastConnected: (id) => set(state => ({
        connections: state.connections.map(c =>
          c.id === id
            ? { ...c, lastConnectedAt: new Date().toISOString() }
            : c
        ),
      })),
    }),
    {
      name: "betterbase-connections",
      // Store in localStorage — keys are stored here
      // IMPORTANT: service_role keys are sensitive. In a production hosted
      // version of this dashboard, these should be encrypted at rest.
      // For self-hosted, localStorage is acceptable.
    }
  )
)
```

### 2.2 The meta API client

**File:** `lib/betterbase-client.ts`

```typescript
import type { ProjectConnection } from "./store"

/**
 * BetterBaseMetaClient
 *
 * Typed HTTP client for the BetterBase meta API.
 * All methods return { data, error } consistent with BetterBase conventions.
 */
export class BetterBaseMetaClient {
  private baseUrl: string
  private serviceRoleKey: string

  constructor(connection: ProjectConnection) {
    this.baseUrl = connection.url.replace(/\/$/, "")
    this.serviceRoleKey = connection.serviceRoleKey
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; count?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meta${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.serviceRoleKey}`,
          ...options.headers,
        },
      })

      const json = await response.json()

      if (!response.ok) {
        return { data: null, error: json.error ?? `HTTP ${response.status}` }
      }

      return json
    } catch (err) {
      return { data: null, error: `Network error: ${String(err)}` }
    }
  }

  // ── Project ───────────────────────────────────────────────────────────────

  async getProject() {
    return this.request<ProjectInfo>("/project")
  }

  async getStats() {
    return this.request<Stats>("/stats")
  }

  // ── Tables ────────────────────────────────────────────────────────────────

  async getTables() {
    return this.request<TableInfo[]>("/tables")
  }

  async getTableRows(tableName: string, limit = 50, offset = 0) {
    return this.request<Record<string, unknown>[]>(
      `/tables/${tableName}/rows?limit=${limit}&offset=${offset}`
    )
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUsers(limit = 20, offset = 0) {
    return this.request<AuthUser[]>(`/users?limit=${limit}&offset=${offset}`)
  }

  async deleteUser(userId: string) {
    return this.request<{ deleted: boolean }>(`/users/${userId}`, {
      method: "DELETE",
    })
  }

  // ── Logs ──────────────────────────────────────────────────────────────────

  async getLogs(params: {
    limit?: number
    offset?: number
    method?: string
    statusMin?: number
    statusMax?: number
  } = {}) {
    const query = new URLSearchParams()
    if (params.limit) query.set("limit", String(params.limit))
    if (params.offset) query.set("offset", String(params.offset))
    if (params.method) query.set("method", params.method)
    if (params.statusMin) query.set("statusMin", String(params.statusMin))
    if (params.statusMax) query.set("statusMax", String(params.statusMax))

    return this.request<LogEntry[]>(`/logs?${query.toString()}`)
  }

  async getLogsChart() {
    return this.request<ChartDataPoint[]>("/logs/chart")
  }

  // ── Keys ──────────────────────────────────────────────────────────────────

  async getKeys() {
    return this.request<ApiKeyInfo[]>("/keys")
  }

  // ── Connection test ───────────────────────────────────────────────────────

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    const result = await this.getProject()
    if (result.error) return { ok: false, error: result.error }
    return { ok: true }
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProjectInfo {
  id: string
  name: string
  createdAt: string
}

export interface Stats {
  totalUsers: number
  activeSessions: number
  totalRequests: number
  requestsToday: number
  errorsToday: number
}

export interface TableInfo {
  name: string
  count: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
}

export interface LogEntry {
  id: string
  method: string
  path: string
  statusCode: number
  responseTimeMs: number
  userId: string | null
  keyType: string | null
  ipAddress: string | null
  createdAt: string
}

export interface ChartDataPoint {
  hour: string
  requests: number
}

export interface ApiKeyInfo {
  id: string
  keyType: "anon" | "service_role"
  keyPrefix: string
  createdAt: string
  lastUsedAt: string | null
}
```

---

## PART 3: THE CONNECTION PAGE

**File:** `app/connect/page.tsx`

This is the first page users see. They add a BetterBase project connection here.

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"

export default function ConnectPage() {
  const router = useRouter()
  const { connections, addConnection, setActive } = useConnectionStore()
  const [form, setForm] = useState({ name: "", url: "", serviceRoleKey: "" })
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setTesting(true)
    setError(null)

    // Test the connection before saving
    const client = new BetterBaseMetaClient({
      id: "test",
      name: form.name,
      url: form.url,
      serviceRoleKey: form.serviceRoleKey,
      projectId: "",
      addedAt: "",
    })

    const test = await client.testConnection()

    if (!test.ok) {
      setError(test.error ?? "Connection failed")
      setTesting(false)
      return
    }

    const projectInfo = await client.getProject()

    addConnection({
      name: form.name || projectInfo.data?.name || "My Project",
      url: form.url,
      serviceRoleKey: form.serviceRoleKey,
      projectId: projectInfo.data?.id ?? "",
    })

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-foreground mb-2">BetterBase</div>
          <p className="text-muted-foreground text-sm">
            Connect to a BetterBase project to get started
          </p>
        </div>

        {/* Existing connections */}
        {connections.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Recent connections</p>
            <div className="space-y-2">
              {connections.map(conn => (
                <button
                  key={conn.id}
                  onClick={() => { setActive(conn.id); router.push("/dashboard") }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{conn.name}</div>
                    <div className="text-xs text-muted-foreground">{conn.url}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
              ))}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or add new</span>
              </div>
            </div>
          </div>
        )}

        {/* Add connection form */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Project name
            </label>
            <input
              type="text"
              placeholder="My App"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Project URL <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              placeholder="http://localhost:3000"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Service role key <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              placeholder="bb_service_..."
              value={form.serviceRoleKey}
              onChange={e => setForm(f => ({ ...f, serviceRoleKey: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your project .env as BETTERBASE_SERVICE_ROLE_KEY
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={testing}
            className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {testing ? "Testing connection..." : "Connect to project"}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## PART 4: DASHBOARD LAYOUT

**File:** `app/dashboard/layout.tsx`

```typescript
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { getActive } = useConnectionStore()

  useEffect(() => {
    if (!getActive()) {
      router.replace("/connect")
    }
  }, [])

  const connection = getActive()
  if (!connection) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header connection={connection} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**File:** `components/layout/sidebar.tsx`

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Table2, Users, ScrollText,
  Key, Settings, Zap, LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useConnectionStore } from "@/lib/store"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Overview",   href: "/dashboard",          icon: LayoutDashboard },
  { name: "Tables",     href: "/dashboard/tables",   icon: Table2 },
  { name: "Auth",       href: "/dashboard/auth",     icon: Users },
  { name: "Logs",       href: "/dashboard/logs",     icon: ScrollText },
  { name: "API",        href: "/dashboard/api",      icon: Key },
  { name: "Realtime",   href: "/dashboard/realtime", icon: Zap },
  { name: "Settings",   href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { connections, activeConnectionId, setActive, getActive } = useConnectionStore()
  const active = getActive()

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <span className="text-sm font-bold text-foreground">BetterBase</span>
      </div>

      {/* Project switcher */}
      {connections.length > 1 && (
        <div className="px-3 py-3 border-b border-border">
          <select
            value={activeConnectionId ?? ""}
            onChange={e => { setActive(e.target.value); router.push("/dashboard") }}
            className="w-full text-xs bg-muted rounded px-2 py-1.5 border border-border text-foreground"
          >
            {connections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Active project name */}
      {active && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Connected to</p>
          <p className="text-sm font-medium text-foreground truncate">{active.name}</p>
          <p className="text-xs text-muted-foreground truncate">{active.url}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Add project + disconnect */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          href="/connect"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          + Add project
        </Link>
      </div>
    </div>
  )
}
```

---

## PART 5: THE HOOKS (REAL DATA)

Every dashboard page reads data through TanStack Query hooks. These hooks use the active connection's `BetterBaseMetaClient`.

**File:** `hooks/use-project.ts`

```typescript
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"

/**
 * useMetaClient
 * Returns a BetterBaseMetaClient for the active connection.
 * Returns null if no active connection.
 */
export function useMetaClient(): BetterBaseMetaClient | null {
  const connection = useConnectionStore(s => s.getActive())
  if (!connection) return null
  return new BetterBaseMetaClient(connection)
}
```

**File:** `hooks/use-stats.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useStats() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["stats", client ? "connected" : "none"],
    queryFn: async () => {
      if (!client) throw new Error("No active connection")
      const result = await client.getStats()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    refetchInterval: 30000,  // refresh every 30 seconds
  })
}

export function useLogsChart() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["logs-chart", client ? "connected" : "none"],
    queryFn: async () => {
      if (!client) throw new Error("No active connection")
      const result = await client.getLogsChart()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    refetchInterval: 60000,
  })
}
```

**File:** `hooks/use-tables.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useTables() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getTables()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
  })
}

export function useTableRows(tableName: string, limit = 50, offset = 0) {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["table-rows", tableName, limit, offset],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getTableRows(tableName, limit, offset)
      if (result.error) throw new Error(result.error)
      return { rows: result.data!, count: result.count ?? 0 }
    },
    enabled: !!client && !!tableName,
  })
}
```

**File:** `hooks/use-users.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useUsers(limit = 20, offset = 0) {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["users", limit, offset],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getUsers(limit, offset)
      if (result.error) throw new Error(result.error)
      return { users: result.data!, count: result.count ?? 0 }
    },
    enabled: !!client,
  })
}

export function useDeleteUser() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.deleteUser(userId)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}
```

**File:** `hooks/use-logs.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useLogs(params: {
  limit?: number
  offset?: number
  method?: string
  statusMin?: number
  statusMax?: number
} = {}) {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["logs", params],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getLogs(params)
      if (result.error) throw new Error(result.error)
      return { logs: result.data!, count: result.count ?? 0 }
    },
    enabled: !!client,
    refetchInterval: 5000,  // refresh every 5 seconds for live feel
  })
}
```

---

## PART 6: THE DASHBOARD PAGES

### 6.1 Overview page

**File:** `app/dashboard/page.tsx`

```typescript
"use client"

import { useStats, useLogsChart } from "@/hooks/use-stats"
import { StatsGrid } from "@/components/overview/stats-grid"
import { RequestsChart } from "@/components/overview/requests-chart"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: chartData, isLoading: chartLoading } = useLogsChart()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time view of your BetterBase project
        </p>
      </div>

      <StatsGrid stats={stats ?? null} loading={statsLoading} />

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground mb-4">
          API Requests — Last 24 Hours
        </h2>
        <RequestsChart data={chartData ?? []} loading={chartLoading} />
      </div>
    </div>
  )
}
```

**File:** `components/overview/stats-grid.tsx`

```typescript
import type { Stats } from "@/lib/betterbase-client"
import { Users, Activity, AlertTriangle, Zap } from "lucide-react"

interface Props {
  stats: Stats | null
  loading: boolean
}

const cards = [
  { key: "totalUsers" as const,     label: "Total Users",       icon: Users,         color: "text-blue-500" },
  { key: "requestsToday" as const,  label: "Requests Today",    icon: Activity,      color: "text-green-500" },
  { key: "activeSessions" as const, label: "Active Sessions",   icon: Zap,           color: "text-yellow-500" },
  { key: "errorsToday" as const,    label: "Errors Today",      icon: AlertTriangle, color: "text-red-500" },
]

export function StatsGrid({ stats, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.key} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <card.icon className={`h-4 w-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold text-foreground">
              {stats ? stats[card.key].toLocaleString() : "—"}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
```

**File:** `components/overview/requests-chart.tsx`

```typescript
"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { ChartDataPoint } from "@/lib/betterbase-client"
import { format } from "date-fns"

interface Props {
  data: ChartDataPoint[]
  loading: boolean
}

export function RequestsChart({ data, loading }: Props) {
  if (loading) {
    return <div className="h-48 w-full rounded bg-muted animate-pulse" />
  }

  const formatted = data.map(d => ({
    hour: format(new Date(d.hour), "HH:mm"),
    requests: d.requests,
  }))

  return (
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#requestsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

### 6.2 Logs page

**File:** `app/dashboard/logs/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useLogs } from "@/hooks/use-logs"
import { cn } from "@/lib/utils"

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  POST:   "bg-green-500/10 text-green-600 dark:text-green-400",
  PUT:    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  PATCH:  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400",
}

function statusColor(code: number): string {
  if (code < 300) return "bg-green-500/10 text-green-600 dark:text-green-400"
  if (code < 400) return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  if (code < 500) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
  return "bg-red-500/10 text-red-600 dark:text-red-400"
}

export default function LogsPage() {
  const [method, setMethod] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [offset, setOffset] = useState(0)
  const limit = 50

  const statusParams = statusFilter === "2xx" ? { statusMin: 200, statusMax: 299 }
    : statusFilter === "4xx" ? { statusMin: 400, statusMax: 499 }
    : statusFilter === "5xx" ? { statusMin: 500, statusMax: 599 }
    : {}

  const { data, isLoading } = useLogs({ limit, offset, method, ...statusParams })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Request Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.count ? `${data.count.toLocaleString()} total requests` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "GET", "POST", "PUT", "DELETE"].map(m => (
          <button
            key={m}
            onClick={() => setMethod(m === "all" ? undefined : m)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              (m === "all" ? !method : method === m)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {m.toUpperCase()}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {["all", "2xx", "4xx", "5xx"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors",
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Method</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Path</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Key</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.logs.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-mono font-medium", METHOD_COLORS[log.method] ?? "bg-muted text-foreground")}>
                    {log.method}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-foreground max-w-xs truncate">
                  {log.path}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-mono font-medium", statusColor(log.statusCode))}>
                    {log.statusCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {log.responseTimeMs}ms
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {log.keyType ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + limit, data?.count ?? 0)} of {data?.count?.toLocaleString() ?? "..."} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={!data || offset + limit >= data.count}
              className="px-3 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## PART 7: PROVIDERS AND ROOT LAYOUT

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BetterBase Dashboard",
  description: "Manage your BetterBase projects",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**File:** `app/providers.tsx`

```typescript
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**File:** `app/page.tsx`

```typescript
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/dashboard")
}
```

---

## PART 8: ENVIRONMENT AND DEPLOYMENT

**File:** `.env.local`

```
# For self-hosted: pre-configure one project connection
# Leave empty to use the connection manager UI
NEXT_PUBLIC_DEFAULT_PROJECT_URL=
NEXT_PUBLIC_DEFAULT_PROJECT_NAME=
# NOTE: never put service_role key in env for the hosted version
# For self-hosted single-project mode only:
BETTERBASE_SERVICE_ROLE_KEY=
```

**File:** `README.md`

```markdown
# BetterBaseDashboard

The official dashboard for BetterBase projects.

## Quick start (self-hosted)

bun install
bun dev
# Open http://localhost:3001
# Click "Connect to project"
# Enter your BetterBase project URL and service_role key

## Connecting to a project

You need:
1. Your BetterBase project URL (e.g. http://localhost:3000)
2. Your service_role key (found in your project .env as BETTERBASE_SERVICE_ROLE_KEY)

The dashboard connects securely using your service_role key.
Never share this key or use it in client-side code.

## Multiple projects

Click "+ Add project" in the sidebar to add more projects.
Switch between them using the project switcher at the top of the sidebar.
```

---

## PART 9: CORS — CRITICAL

The BetterBase backend must allow requests from the dashboard origin. Without this, every dashboard request will fail with a CORS error.

**Add to `templates/base/src/index.ts` in the BetterBase backend:**

```typescript
import { cors } from "hono/cors"

// CORS — allow dashboard to connect
app.use("*", cors({
  origin: (origin) => {
    // Allow localhost for development
    if (!origin || origin.startsWith("http://localhost")) return origin
    // Allow the official hosted dashboard
    if (origin === "https://app.betterbase.com") return origin
    // Allow the user's custom dashboard deployment
    const allowedOrigin = process.env.DASHBOARD_ORIGIN
    if (allowedOrigin && origin === allowedOrigin) return origin
    return null
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
}))
```

Add to `.env`:
```
DASHBOARD_ORIGIN=http://localhost:3001
```

---

## PART 10: VERIFICATION

```bash
# 1. Start BetterBase backend
cd your-betterbase-project
bun dev
# Running on http://localhost:3000

# 2. Start dashboard
cd BetterBaseDashboard
bun dev
# Running on http://localhost:3001

# 3. Open http://localhost:3001/connect
# Enter: URL = http://localhost:3000
# Enter: service_role key from .env
# Click "Connect to project"
# Expected: redirects to /dashboard with real data

# 4. Verify each page shows real data:
# /dashboard     → stats show actual counts (not 15k fake users)
# /dashboard/logs → shows real requests you've made
# /dashboard/auth → shows real users from BetterAuth
# /dashboard/tables → shows your actual schema tables
# /dashboard/api → shows key prefixes

# 5. Make a request and watch it appear in logs
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $BETTERBASE_ANON_KEY"
# Refresh /dashboard/logs — new entry should appear within 5 seconds
```
