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
