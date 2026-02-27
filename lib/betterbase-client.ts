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

  // ── Phase 10 — Provider ───────────────────────────────────────────────────────
  async getProvider() {
    return this.request<ProviderInfo>("/provider")
  }

  // ── Phase 11 — RLS ────────────────────────────────────────────────────────────
  async getRlsPolicies() {
    return this.request<RlsPolicy[]>("/rls/policies")
  }

  // ── Phase 12 — GraphQL ────────────────────────────────────────────────────────
  async getGraphqlSchema() {
    return this.request<GraphqlSchemaInfo>("/graphql/schema")
  }

  // ── Phase 13 — Webhooks ───────────────────────────────────────────────────────
  async getWebhooks() {
    return this.request<WebhookConfig[]>("/webhooks")
  }
  async createWebhook(data: { table: string; events: string[]; url: string; secret?: string; enabled?: boolean }) {
    return this.request<WebhookConfig>("/webhooks", { method: "POST", body: JSON.stringify(data) })
  }
  async updateWebhook(id: string, data: Partial<WebhookConfig>) {
    return this.request<{ updated: boolean }>(`/webhooks/${id}`, { method: "PUT", body: JSON.stringify(data) })
  }
  async deleteWebhook(id: string) {
    return this.request<{ deleted: boolean }>(`/webhooks/${id}`, { method: "DELETE" })
  }
  async testWebhook(id: string) {
    return this.request<WebhookTestResult>(`/webhooks/${id}/test`, { method: "POST" })
  }

  // ── Phase 14 — Storage ────────────────────────────────────────────────────────
  async getStorageBuckets() {
    return this.request<StorageBucket[]>("/storage/buckets")
  }
  async getStorageFiles(bucket: string, prefix = "") {
    return this.request<StorageFile[]>(`/storage/${encodeURIComponent(bucket)}/files?prefix=${encodeURIComponent(prefix)}`)
  }
  async deleteStorageFile(bucket: string, key: string) {
    return this.request<{ deleted: boolean; key: string }>(`/storage/${encodeURIComponent(bucket)}/files/${encodeURIComponent(key)}`, { method: "DELETE" })
  }

  // ── Phase 15 — Edge Functions ─────────────────────────────────────────────────
  async getEdgeFunctions() {
    return this.request<EdgeFunction[]>("/functions")
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
