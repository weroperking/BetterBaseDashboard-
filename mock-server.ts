#!/usr/bin/env bun
/**
 * Mock BetterBase API Server
 * Run with: bun mock-server.ts
 * This simulates a BetterBase backend for testing the dashboard UI
 */

const PORT = 3001;

// Mock data
const mockProject = {
  id: "demo-project-001",
  name: "Demo Project",
  createdAt: new Date().toISOString(),
};

const mockStats = {
  totalUsers: 42,
  activeSessions: 8,
  totalRequests: 15234,
  requestsToday: 342,
  errorsToday: 3,
};

const mockTables = [
  { name: "users", count: 42 },
  { name: "posts", count: 156 },
  { name: "comments", count: 423 },
  { name: "categories", count: 12 },
  { name: "tags", count: 28 },
];

const mockTableRows: Record<string, unknown[]> = {
  users: [
    { id: 1, email: "alice@example.com", name: "Alice Johnson", role: "admin", created_at: "2024-01-15T10:30:00Z" },
    { id: 2, email: "bob@example.com", name: "Bob Smith", role: "user", created_at: "2024-01-20T14:22:00Z" },
    { id: 3, email: "carol@example.com", name: "Carol White", role: "user", created_at: "2024-02-01T09:15:00Z" },
  ],
  posts: [
    { id: 1, title: "Getting Started with BetterBase", author: "Alice Johnson", status: "published", created_at: "2024-01-16T10:00:00Z" },
    { id: 2, title: "Advanced Queries", author: "Bob Smith", status: "draft", created_at: "2024-01-25T16:30:00Z" },
  ],
  comments: [
    { id: 1, content: "Great post!", author: "Carol White", post_id: 1, created_at: "2024-01-17T08:00:00Z" },
  ],
};

const mockUsers = [
  { id: "user-001", name: "Alice Johnson", email: "alice@example.com", emailVerified: true, createdAt: "2024-01-15T10:30:00Z" },
  { id: "user-002", name: "Bob Smith", email: "bob@example.com", emailVerified: true, createdAt: "2024-01-20T14:22:00Z" },
  { id: "user-003", name: "Carol White", email: "carol@example.com", emailVerified: false, createdAt: "2024-02-01T09:15:00Z" },
];

const mockLogs = [
  { id: "log-001", method: "GET", path: "/api/users", statusCode: 200, responseTimeMs: 45, userId: "user-001", keyType: "service_role", ipAddress: "192.168.1.100", createdAt: new Date().toISOString() },
  { id: "log-002", method: "POST", path: "/api/posts", statusCode: 201, responseTimeMs: 120, userId: "user-001", keyType: "service_role", ipAddress: "192.168.1.100", createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: "log-003", method: "GET", path: "/api/posts/1", statusCode: 200, responseTimeMs: 32, userId: null, keyType: "anon", ipAddress: "192.168.1.101", createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: "log-004", method: "DELETE", path: "/api/comments/5", statusCode: 403, responseTimeMs: 25, userId: "user-002", keyType: "anon", ipAddress: "192.168.1.102", createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: "log-005", method: "GET", path: "/api/stats", statusCode: 500, responseTimeMs: 500, userId: null, keyType: "service_role", ipAddress: "192.168.1.100", createdAt: new Date(Date.now() - 300000).toISOString() },
];

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.floor(Math.random() * 100) + 20,
}));

const mockKeys = [
  { id: "key-001", keyType: "anon", keyPrefix: "bb_anon_", createdAt: "2024-01-01T00:00:00Z", lastUsedAt: new Date().toISOString() },
  { id: "key-002", keyType: "service_role", keyPrefix: "bb_service_", createdAt: "2024-01-01T00:00:00Z", lastUsedAt: new Date().toISOString() },
];

const mockRealtimeStats = {
  connectedClients: 5,
  totalSubscriptions: 12,
  subscribedTables: ["users", "posts", "comments"],
};

const mockProvider = {
  name: "SQLite",
  enabled: true,
  config: { database: "betterbase.db" },
  supportsRls: true,
  provider: "sqlite",
  dialect: "sqlite",
  label: "SQLite Database",
};

const mockRlsPolicies = [
  { id: "rls-001", tableName: "users", name: "Users can only read own data", definition: "auth.uid() = user_id", enabled: true },
  { id: "rls-002", tableName: "posts", name: "Public read access", definition: "true", enabled: true },
  { id: "rls-003", tableName: "posts", name: "Only authors can modify", definition: "auth.uid() = author_id", enabled: true },
];

const mockGraphqlSchema = {
  types: ["User", "Post", "Comment", "Category", "Tag"],
  queries: ["users", "user", "posts", "post", "comments"],
  mutations: ["createUser", "updateUser", "createPost", "updatePost", "deletePost"],
  endpoint: "/graphql",
  schema: "type User { id: ID! email: String! name: String! }",
};

const mockWebhooks = [
  { id: "wh-001", table: "users", events: ["INSERT", "UPDATE"], url: "https://example.com/webhooks/users", secret: "secret-123", enabled: true, createdAt: "2024-01-15T10:30:00Z" },
  { id: "wh-002", table: "posts", events: ["INSERT"], url: "https://example.com/webhooks/posts", enabled: false, createdAt: "2024-02-01T09:15:00Z" },
];

const mockStorageBuckets = [
  { id: "bucket-001", name: "avatars", public: true, createdAt: "2024-01-10T00:00:00Z", provider: "local", region: "us-east-1" },
  { id: "bucket-002", name: "documents", public: false, createdAt: "2024-01-15T00:00:00Z", provider: "local", region: "us-east-1" },
];

const mockStorageFiles: Record<string, unknown[]> = {
  avatars: [
    { key: "user-001.png", size: 12450, contentType: "image/png", createdAt: "2024-01-20T10:00:00Z", lastModified: "2024-01-20T10:00:00Z" },
    { key: "user-002.jpg", size: 8932, contentType: "image/jpeg", createdAt: "2024-01-21T14:30:00Z", lastModified: "2024-01-21T14:30:00Z" },
  ],
  documents: [
    { key: "report-2024.pdf", size: 245678, contentType: "application/pdf", createdAt: "2024-02-01T09:00:00Z", lastModified: "2024-02-05T16:45:00Z" },
  ],
};

const mockEdgeFunctions = [
  { id: "fn-001", name: "Send Email", slug: "send-email", status: "active", createdAt: "2024-01-15T10:30:00Z", updatedAt: "2024-02-01T09:15:00Z", runtime: "node18", hasIndex: true, built: true, deployUrl: "/functions/send-email" },
  { id: "fn-002", name: "Process Image", slug: "process-image", status: "inactive", createdAt: "2024-01-20T14:22:00Z", updatedAt: "2024-01-20T14:22:00Z", runtime: "node18", hasIndex: true, built: false },
];

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Route handlers
const routes: Record<string, (req: Request) => Response | Promise<Response>> = {
  "GET /api/meta/project": () => json({ data: mockProject }),
  
  "GET /api/meta/stats": () => json({ data: mockStats }),
  
  "GET /api/meta/tables": () => json({ data: mockTables }),
  
  "GET /api/meta/tables/:name/rows": (req) => {
    const url = new URL(req.url);
    const tableName = url.pathname.split("/")[4];
    const rows = mockTableRows[tableName] || [];
    return json({ data: rows });
  },
  
  "GET /api/meta/users": () => json({ data: mockUsers }),
  
  "DELETE /api/meta/users/:id": () => json({ data: { deleted: true } }),
  
  "GET /api/meta/logs": (req) => {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    return json({ data: mockLogs.slice(0, limit) });
  },
  
  "GET /api/meta/logs/chart": () => json({ data: mockChartData }),
  
  "GET /api/meta/keys": () => json({ data: mockKeys }),
  
  "GET /api/meta/realtime": () => json({ data: mockRealtimeStats }),
  
  "GET /api/meta/provider": () => json({ data: mockProvider }),
  
  "GET /api/meta/rls/policies": () => json({ data: mockRlsPolicies }),
  
  "GET /api/meta/graphql/schema": () => json({ data: mockGraphqlSchema }),
  
  "GET /api/meta/webhooks": () => json({ data: mockWebhooks }),
  
  "POST /api/meta/webhooks": async (req) => {
    const body = await req.json();
    const newWebhook = {
      id: `wh-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    mockWebhooks.push(newWebhook);
    return json({ data: newWebhook });
  },
  
  "PUT /api/meta/webhooks/:id": async (req) => {
    const body = await req.json();
    return json({ data: { updated: true } });
  },
  
  "DELETE /api/meta/webhooks/:id": () => json({ data: { deleted: true } }),
  
  "POST /api/meta/webhooks/:id/test": () => json({ 
    data: { success: true, ok: true, status: 200, response: "OK" } 
  }),
  
  "GET /api/meta/storage/buckets": () => json({ data: mockStorageBuckets }),
  
  "GET /api/meta/storage/:bucket/files": (req) => {
    const url = new URL(req.url);
    const bucket = decodeURIComponent(url.pathname.split("/")[4]);
    return json({ data: mockStorageFiles[bucket] || [] });
  },
  
  "DELETE /api/meta/storage/:bucket/files/:key": () => json({ data: { deleted: true, key: "file" } }),
  
  "GET /api/meta/functions": () => json({ data: mockEdgeFunctions }),
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function matchRoute(method: string, pathname: string): [((req: Request) => Response | Promise<Response>), Record<string, string>] | null {
  // Try exact match first
  const exactKey = `${method} ${pathname}`;
  if (routes[exactKey]) {
    return [routes[exactKey], {}];
  }
  
  // Try pattern match
  for (const [key, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = key.split(" ");
    if (routeMethod !== method) continue;
    
    const pattern = routePath.replace(/:\w+/g, "([^/]+)");
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    
    if (match) {
      // Extract params
      const params: Record<string, string> = {};
      const paramNames = routePath.match(/:(\w+)/g) || [];
      paramNames.forEach((name, i) => {
        params[name.slice(1)] = match[i + 1];
      });
      return [handler, params];
    }
  }
  
  return null;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Check authorization header (accept any bearer token for mock)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized - Missing Bearer token" }, 401);
    }
    
    // Match route
    const route = matchRoute(method, pathname);
    if (route) {
      try {
        const [handler] = route;
        return await handler(req);
      } catch (err) {
        console.error("Handler error:", err);
        return json({ error: "Internal server error" }, 500);
      }
    }
    
    return json({ error: `Not found: ${method} ${pathname}` }, 404);
  },
});

console.log(`🚀 Mock BetterBase API Server running at http://localhost:${PORT}`);
console.log(`📊 Endpoints available:`);
console.log(`  - GET  /api/meta/project`);
console.log(`  - GET  /api/meta/stats`);
console.log(`  - GET  /api/meta/tables`);
console.log(`  - GET  /api/meta/users`);
console.log(`  - GET  /api/meta/logs`);
console.log(`  - GET  /api/meta/realtime`);
console.log(`  - GET  /api/meta/webhooks`);
console.log(`  - GET  /api/meta/storage/buckets`);
console.log(`  - GET  /api/meta/functions`);
console.log(`\n💡 Use these credentials in the Connect page:`);
console.log(`   URL: http://localhost:${PORT}`);
console.log(`   Service Key: bb_service_anything_works`);
