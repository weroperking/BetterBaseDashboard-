import type { ProjectConnection } from "./store"

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

  async getProject() {
    return this.request<ProjectInfo>("/project")
  }

  async getStats() {
    return this.request<Stats>("/stats")
  }

  async getTables() {
    return this.request<TableInfo[]>("/tables")
  }

  async getTableRows(tableName: string, limit = 50, offset = 0) {
    return this.request<Record<string, unknown>[]>(
      `/tables/${tableName}/rows?limit=${limit}&offset=${offset}`
    )
  }

  async getUsers(limit = 20, offset = 0) {
    return this.request<AuthUser[]>(`/users?limit=${limit}&offset=${offset}`)
  }

  async deleteUser(userId: string) {
    return this.request<{ deleted: boolean }>(`/users/${userId}`, {
      method: "DELETE",
    })
  }

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

  async getKeys() {
    return this.request<ApiKeyInfo[]>("/keys")
  }

  async getRealtimeStats() {
    return this.request<RealtimeStats>("/realtime")
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    const result = await this.getProject()
    if (result.error) return { ok: false, error: result.error }
    return { ok: true }
  }
}

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

export interface RealtimeStats {
  connectedClients: number
  totalSubscriptions: number
  subscribedTables: string[]
}
