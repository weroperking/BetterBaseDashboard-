# BetterBaseDashboard — Phase 10–15 Pages
> **Prerequisite:** Both `betterbase_dashboard_rebuild.md` and `betterbase_dashboard_remaining_pages.md` must be fully implemented first.
> **What this document builds:** The six platform pages that correspond to backend Phases 10–15, plus all backend meta endpoints they depend on, all hooks, sidebar updates, and new type definitions.
> **Rule:** Do NOT touch any already-implemented page. Only add new files and append to existing ones where specified.

---

## EXACT FILE LIST

### New dashboard pages:
```
app/dashboard/settings/page.tsx         ← REPLACE (add Phase 10 provider indicator)
app/dashboard/rls/page.tsx              ← CREATE (Phase 11)
app/dashboard/graphql/page.tsx          ← CREATE (Phase 12)
app/dashboard/webhooks/page.tsx         ← CREATE (Phase 13)
app/dashboard/storage/page.tsx          ← CREATE (Phase 14)
app/dashboard/functions/page.tsx        ← CREATE (Phase 15)
```

### New hooks:
```
hooks/use-rls.ts
hooks/use-graphql.ts
hooks/use-webhooks.ts
hooks/use-storage.ts
hooks/use-functions.ts
```

### Files to APPEND to (do not replace):
```
components/layout/sidebar.tsx           ← add Phase 10–15 nav items
lib/betterbase-client.ts                ← add new methods + types
templates/base/src/routes/meta.ts       ← add new meta endpoints (in backend)
```

---

## PART 1: SIDEBAR UPDATE

**File:** `components/layout/sidebar.tsx`

Find the `coreNav` array that already exists. Add a second `platformNav` array below it and render it in a separate section. Do not touch `coreNav` or any other part of the file.

Add this array directly after the `coreNav` definition:

```typescript
const platformNav = [
  { name: "RLS Policies",   href: "/dashboard/rls",       icon: Shield },
  { name: "GraphQL",        href: "/dashboard/graphql",   icon: Code2 },
  { name: "Webhooks",       href: "/dashboard/webhooks",  icon: Webhook },
  { name: "Storage",        href: "/dashboard/storage",   icon: HardDrive },
  { name: "Edge Functions", href: "/dashboard/functions", icon: Cpu },
]
```

Add the missing imports at the top of the file:

```typescript
import { Shield, Code2, Webhook, HardDrive, Cpu } from "lucide-react"
```

Then in the JSX, after the closing tag of the coreNav `<nav>` section and before the Settings/footer section, add:

```tsx
{/* Platform nav */}
<div className="px-3 pb-2">
  <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wider">
    Platform
  </p>
  <div className="space-y-0.5">
    {platformNav.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
          pathname === item.href || pathname.startsWith(item.href)
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        {item.name}
      </Link>
    ))}
  </div>
</div>
```

---

## PART 2: NEW BACKEND META ENDPOINTS

Append ALL of the following to `templates/base/src/routes/meta.ts` in the BetterBase backend repo. Do not remove anything already there. Add below the last existing endpoint.

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// PHASE 10 — PROVIDER INFO
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/provider
// Returns the configured database provider and dialect
metaRoute.get("/provider", async (c) => {
  const databaseUrl = process.env.DATABASE_URL ?? ""
  const tursoUrl = process.env.TURSO_DATABASE_URL ?? ""
  const planetscaleUrl = process.env.PLANETSCALE_URL ?? ""

  let provider = "local"
  let dialect = "sqlite"

  if (tursoUrl) {
    provider = "turso"
    dialect = "sqlite"
  } else if (planetscaleUrl || databaseUrl.includes("pscale")) {
    provider = "planetscale"
    dialect = "mysql"
  } else if (databaseUrl.includes("neon.tech")) {
    provider = "neon"
    dialect = "postgres"
  } else if (databaseUrl.includes("supabase.co")) {
    provider = "supabase"
    dialect = "postgres"
  } else if (databaseUrl.startsWith("postgres") || databaseUrl.startsWith("postgresql")) {
    provider = "postgres"
    dialect = "postgres"
  } else if (databaseUrl.startsWith("file:") || databaseUrl === "" || databaseUrl.endsWith(".db")) {
    provider = "local"
    dialect = "sqlite"
  }

  const providerLabels: Record<string, string> = {
    local:       "Local SQLite",
    turso:       "Turso (SQLite Edge)",
    neon:        "Neon (Serverless Postgres)",
    supabase:    "Supabase Postgres",
    postgres:    "Raw Postgres",
    planetscale: "PlanetScale (MySQL)",
  }

  return c.json({
    data: {
      provider,
      dialect,
      label: providerLabels[provider] ?? provider,
      supportsRls: dialect === "postgres",
    },
    error: null,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 11 — RLS POLICIES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/rls/policies
// Reads all policy files from src/db/policies/ and returns their parsed content
metaRoute.get("/rls/policies", async (c) => {
  const { readdir, readFile } = await import("fs/promises")
  const { existsSync } = await import("fs")
  const { join } = await import("path")

  const policiesDir = join(process.cwd(), "src", "db", "policies")

  if (!existsSync(policiesDir)) {
    return c.json({ data: [], error: null })
  }

  const files = await readdir(policiesDir)
  const policyFiles = files.filter(f => f.endsWith(".policy.ts"))

  const policies = await Promise.all(
    policyFiles.map(async (file) => {
      const raw = await readFile(join(policiesDir, file), "utf-8")
      const tableName = file.replace(".policy.ts", "")

      // Extract rule expressions using regex on the generated policy file format
      const selectMatch = raw.match(/select:\s*[`"'](.+?)[`"']/s)
      const insertMatch = raw.match(/insert:\s*[`"'](.+?)[`"']/s)
      const updateMatch = raw.match(/update:\s*[`"'](.+?)[`"']/s)
      const deleteMatch = raw.match(/delete:\s*[`"'](.+?)[`"']/s)

      return {
        table: tableName,
        select: selectMatch?.[1]?.trim() ?? null,
        insert: insertMatch?.[1]?.trim() ?? null,
        update: updateMatch?.[1]?.trim() ?? null,
        delete: deleteMatch?.[1]?.trim() ?? null,
        raw,
        fileName: file,
      }
    })
  )

  return c.json({ data: policies, error: null })
})

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 12 — GRAPHQL
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/graphql/schema
// Returns the generated SDL schema string and endpoint URL
metaRoute.get("/graphql/schema", async (c) => {
  const { readFile } = await import("fs/promises")
  const { existsSync } = await import("fs")
  const { join } = await import("path")

  // Try both common locations for the generated schema file
  const candidates = [
    join(process.cwd(), "src", "graphql", "schema.graphql"),
    join(process.cwd(), "src", "generated", "schema.graphql"),
    join(process.cwd(), "schema.graphql"),
  ]

  const schemaPath = candidates.find(p => existsSync(p))

  if (!schemaPath) {
    return c.json({
      data: null,
      error: "GraphQL schema not found. Run: bb generate graphql"
    }, 404)
  }

  const schema = await readFile(schemaPath, "utf-8")
  const host = c.req.header("host") ?? "localhost:3000"
  const protocol = c.req.header("x-forwarded-proto") ?? "http"

  return c.json({
    data: {
      schema,
      endpoint: `${protocol}://${host}/api/graphql`,
      schemaPath,
    },
    error: null,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 13 — WEBHOOKS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/webhooks
metaRoute.get("/webhooks", async (c) => {
  const { betterbaseWebhooks } = await import("../db/schema")
  const webhooks = await db
    .select()
    .from(betterbaseWebhooks)
    .orderBy(desc(betterbaseWebhooks.createdAt))
  return c.json({ data: webhooks, error: null })
})

// POST /api/meta/webhooks
metaRoute.post("/webhooks", async (c) => {
  const { betterbaseWebhooks } = await import("../db/schema")
  const { nanoid } = await import("nanoid")
  const body = await c.req.json() as {
    table: string
    events: string[]
    url: string
    secret?: string
    enabled?: boolean
  }
  if (!body.table || !body.url || !body.events?.length) {
    return c.json({ data: null, error: "table, url, and events are required" }, 400)
  }
  const id = nanoid()
  await db.insert(betterbaseWebhooks).values({
    id,
    table: body.table,
    events: JSON.stringify(body.events),
    url: body.url,
    secret: body.secret ?? null,
    enabled: body.enabled !== false,
    createdAt: new Date(),
  })
  return c.json({ data: { id, ...body }, error: null }, 201)
})

// PUT /api/meta/webhooks/:id
metaRoute.put("/webhooks/:id", async (c) => {
  const { betterbaseWebhooks } = await import("../db/schema")
  const id = c.req.param("id")
  const body = await c.req.json() as Record<string, unknown>
  // Serialize events array if present
  const updateData = {
    ...body,
    ...(Array.isArray(body.events) ? { events: JSON.stringify(body.events) } : {}),
  }
  await db
    .update(betterbaseWebhooks)
    .set(updateData)
    .where(eq(betterbaseWebhooks.id, id))
  return c.json({ data: { updated: true }, error: null })
})

// DELETE /api/meta/webhooks/:id
metaRoute.delete("/webhooks/:id", async (c) => {
  const { betterbaseWebhooks } = await import("../db/schema")
  const id = c.req.param("id")
  await db.delete(betterbaseWebhooks).where(eq(betterbaseWebhooks.id, id))
  return c.json({ data: { deleted: true }, error: null })
})

// POST /api/meta/webhooks/:id/test
// Fires a synthetic test event to the webhook endpoint and reports the result
metaRoute.post("/webhooks/:id/test", async (c) => {
  const { betterbaseWebhooks } = await import("../db/schema")
  const id = c.req.param("id")
  const webhook = await db
    .select()
    .from(betterbaseWebhooks)
    .where(eq(betterbaseWebhooks.id, id))
    .get()
  if (!webhook) return c.json({ data: null, error: "Webhook not found" }, 404)

  const testPayload = {
    id: "test_" + Date.now(),
    webhook_id: id,
    type: "INSERT",
    table: webhook.table,
    record: { id: "test-record", _test: true, timestamp: new Date().toISOString() },
    old_record: null,
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BetterBase-Event": "test",
        "X-BetterBase-Signature": webhook.secret
          ? "sha256=" + createHash("sha256")
              .update(webhook.secret + JSON.stringify(testPayload))
              .digest("hex")
          : "",
      },
      body: JSON.stringify(testPayload),
    })
    return c.json({
      data: { status: res.status, ok: res.ok, payload: testPayload },
      error: null,
    })
  } catch (err) {
    return c.json({
      data: { status: 0, ok: false, payload: testPayload },
      error: `Delivery failed: ${String(err)}`,
    }, 200) // return 200 so dashboard can display the error message
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 14 — STORAGE
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/storage/buckets
// Returns the configured storage provider info from environment variables
metaRoute.get("/storage/buckets", async (c) => {
  const provider = process.env.STORAGE_PROVIDER
  const bucket = process.env.STORAGE_BUCKET
  const region = process.env.STORAGE_REGION ?? null
  const endpoint = process.env.STORAGE_ENDPOINT ?? null

  if (!provider || !bucket) {
    return c.json({
      data: null,
      error: "Storage not configured. Run: bb init and select a storage provider."
    }, 404)
  }

  return c.json({
    data: [{
      name: bucket,
      provider,
      region,
      endpoint,
      configured: true,
    }],
    error: null,
  })
})

// GET /api/meta/storage/:bucket/files
// Lists files in the configured storage bucket with optional prefix for folder navigation
metaRoute.get("/storage/:bucket/files", async (c) => {
  const bucket = c.req.param("bucket")
  const prefix = c.req.query("prefix") ?? ""

  // Import the storage adapter from Phase 14 implementation
  // The storage adapter is the unified S3-compatible client created in Phase 14
  const { createStorageAdapter } = await import("../storage/adapter")

  try {
    const adapter = createStorageAdapter()
    const files = await adapter.list(bucket, prefix)
    return c.json({ data: files, error: null })
  } catch (err) {
    return c.json({ data: null, error: `Storage error: ${String(err)}` }, 500)
  }
})

// DELETE /api/meta/storage/:bucket/files/:key
metaRoute.delete("/storage/:bucket/files/:key", async (c) => {
  const bucket = c.req.param("bucket")
  const key = decodeURIComponent(c.req.param("key"))
  const { createStorageAdapter } = await import("../storage/adapter")
  try {
    const adapter = createStorageAdapter()
    await adapter.delete(bucket, key)
    return c.json({ data: { deleted: true, key }, error: null })
  } catch (err) {
    return c.json({ data: null, error: `Delete failed: ${String(err)}` }, 500)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 15 — EDGE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/meta/functions
// Lists all edge functions from src/functions/ directory with build status
metaRoute.get("/functions", async (c) => {
  const { readdir, readFile } = await import("fs/promises")
  const { existsSync } = await import("fs")
  const { join } = await import("path")

  const functionsDir = join(process.cwd(), "src", "functions")

  if (!existsSync(functionsDir)) {
    return c.json({ data: [], error: null })
  }

  const entries = await readdir(functionsDir, { withFileTypes: true })
  const dirs = entries.filter(e => e.isDirectory())

  const functions = await Promise.all(
    dirs.map(async (dir) => {
      const base = join(functionsDir, dir.name)
      const configPath = join(base, "config.ts")
      const indexPath = join(base, "index.ts")
      const buildPath = join(process.cwd(), ".betterbase", "functions", `${dir.name}.js`)

      let runtime = "cloudflare-workers"
      let deployUrl: string | null = null

      if (existsSync(configPath)) {
        const content = await readFile(configPath, "utf-8")
        const runtimeMatch = content.match(/runtime:\s*["'](.+?)["']/)
        const deployMatch = content.match(/deployUrl:\s*["'](.+?)["']/)
        if (runtimeMatch) runtime = runtimeMatch[1]
        if (deployMatch) deployUrl = deployMatch[1]
      }

      return {
        name: dir.name,
        runtime,
        deployUrl,
        hasIndex: existsSync(indexPath),
        built: existsSync(buildPath),
        deployCommand: `bb function deploy ${dir.name}`,
        buildCommand: `bb function build ${dir.name}`,
      }
    })
  )

  return c.json({ data: functions, error: null })
})

// ─────────────────────────────────────────────────────────────────────────────
// Add to schema.ts — betterbaseWebhooks table (used by Phase 13 endpoints above)
// Add this to templates/base/src/db/schema.ts in the betterbase_* tables section
// ─────────────────────────────────────────────────────────────────────────────

/*
  ADD THIS TABLE to templates/base/src/db/schema.ts:

  export const betterbaseWebhooks = sqliteTable("betterbase_webhooks", {
    id: text("id").primaryKey(),
    table: text("table").notNull(),
    events: text("events").notNull(),          // JSON array stored as string: '["INSERT","UPDATE"]'
    url: text("url").notNull(),
    secret: text("secret"),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  })
*/
```

---

## PART 3: NEW CLIENT METHODS AND TYPES

Append these to `lib/betterbase-client.ts` in the dashboard repo.

### Add to the `BetterBaseMetaClient` class:

```typescript
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
async createWebhook(data: {
  table: string
  events: string[]
  url: string
  secret?: string
  enabled?: boolean
}) {
  return this.request<WebhookConfig>("/webhooks", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
async updateWebhook(id: string, data: Partial<WebhookConfig>) {
  return this.request<{ updated: boolean }>(`/webhooks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
async deleteWebhook(id: string) {
  return this.request<{ deleted: boolean }>(`/webhooks/${id}`, {
    method: "DELETE",
  })
}
async testWebhook(id: string) {
  return this.request<WebhookTestResult>(`/webhooks/${id}/test`, {
    method: "POST",
  })
}

// ── Phase 14 — Storage ────────────────────────────────────────────────────────
async getStorageBuckets() {
  return this.request<StorageBucket[]>("/storage/buckets")
}
async getStorageFiles(bucket: string, prefix = "") {
  return this.request<StorageFile[]>(
    `/storage/${encodeURIComponent(bucket)}/files?prefix=${encodeURIComponent(prefix)}`
  )
}
async deleteStorageFile(bucket: string, key: string) {
  return this.request<{ deleted: boolean; key: string }>(
    `/storage/${encodeURIComponent(bucket)}/files/${encodeURIComponent(key)}`,
    { method: "DELETE" }
  )
}

// ── Phase 15 — Edge Functions ─────────────────────────────────────────────────
async getEdgeFunctions() {
  return this.request<EdgeFunction[]>("/functions")
}
```

### Add these types at the bottom of the types section in `lib/betterbase-client.ts`:

```typescript
// Phase 10
export interface ProviderInfo {
  provider: string         // "local" | "neon" | "turso" | "supabase" | "postgres" | "planetscale"
  dialect: string          // "sqlite" | "postgres" | "mysql"
  label: string            // human-readable: "Neon (Serverless Postgres)"
  supportsRls: boolean     // only true for postgres dialect
}

// Phase 11
export interface RlsPolicy {
  table: string
  select: string | null    // SQL expression or null if no policy
  insert: string | null
  update: string | null
  delete: string | null
  raw: string              // full file content for display
  fileName: string
}

// Phase 12
export interface GraphqlSchemaInfo {
  schema: string           // SDL schema string
  endpoint: string         // full URL to /api/graphql
  schemaPath: string       // path on disk
}

// Phase 13
export interface WebhookConfig {
  id: string
  table: string
  events: string[]         // ["INSERT", "UPDATE", "DELETE"]
  url: string
  secret: string | null
  enabled: boolean
  createdAt: string
}

export interface WebhookTestResult {
  status: number
  ok: boolean
  payload: Record<string, unknown>
}

// Phase 14
export interface StorageBucket {
  name: string
  provider: string         // "s3" | "r2" | "b2" | "minio"
  region: string | null
  endpoint: string | null
  configured: boolean
}

export interface StorageFile {
  key: string
  size: number
  lastModified: string
  contentType: string | null
}

// Phase 15
export interface EdgeFunction {
  name: string
  runtime: string          // "cloudflare-workers" | "vercel-edge" | "deno-deploy"
  deployUrl: string | null
  hasIndex: boolean        // whether index.ts exists
  built: boolean           // whether .betterbase/functions/<name>.js exists
  deployCommand: string
  buildCommand: string
}
```

---

## PART 4: NEW HOOKS

### `hooks/use-rls.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useRlsPolicies() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["rls-policies"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getRlsPolicies()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    staleTime: 30000,
  })
}
```

### `hooks/use-graphql.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useGraphqlSchema() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["graphql-schema"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getGraphqlSchema()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    staleTime: 60000,
    retry: false, // don't retry 404 — it just means GraphQL isn't set up yet
  })
}
```

### `hooks/use-webhooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useWebhooks() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getWebhooks()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
  })
}

export function useCreateWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      table: string
      events: string[]
      url: string
      secret?: string
    }) => {
      if (!client) throw new Error("No connection")
      const result = await client.createWebhook(data)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useDeleteWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.deleteWebhook(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useToggleWebhook() {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      if (!client) throw new Error("No connection")
      const result = await client.updateWebhook(id, { enabled })
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhooks"] }),
  })
}

export function useTestWebhook() {
  const client = useMetaClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.testWebhook(id)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}
```

### `hooks/use-storage.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useStorageBuckets() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["storage-buckets"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getStorageBuckets()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    retry: false,
  })
}

export function useStorageFiles(bucket: string, prefix = "") {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["storage-files", bucket, prefix],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getStorageFiles(bucket, prefix)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client && !!bucket,
  })
}

export function useDeleteStorageFile(bucket: string) {
  const client = useMetaClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      if (!client) throw new Error("No connection")
      const result = await client.deleteStorageFile(bucket, key)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: (_, key) => {
      qc.invalidateQueries({ queryKey: ["storage-files", bucket] })
    },
  })
}
```

### `hooks/use-functions.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "./use-project"

export function useEdgeFunctions() {
  const client = useMetaClient()
  return useQuery({
    queryKey: ["edge-functions"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const result = await client.getEdgeFunctions()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    enabled: !!client,
    refetchInterval: 10000, // re-check build status every 10 seconds
  })
}
```

---

## PART 5: UPDATED SETTINGS PAGE

**File:** `app/dashboard/settings/page.tsx` — REPLACE the existing file entirely.

This version adds the Phase 10 provider indicator section.

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useConnectionStore } from "@/lib/store"
import { useMetaClient } from "@/hooks/use-project"
import { ExternalLink, Trash2, Database } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { getActive, removeConnection } = useConnectionStore()
  const connection = getActive()
  const client = useMetaClient()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  const { data: project } = useQuery({
    queryKey: ["project"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const r = await client.getProject()
      if (r.error) throw new Error(r.error)
      return r.data!
    },
    enabled: !!client,
  })

  const { data: provider } = useQuery({
    queryKey: ["provider"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const r = await client.getProvider()
      if (r.error) throw new Error(r.error)
      return r.data!
    },
    enabled: !!client,
  })

  function handleDisconnect() {
    if (!connection) return
    removeConnection(connection.id)
    router.replace("/connect")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Project connection and configuration details
        </p>
      </div>

      {/* Project info */}
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Project</h2>
        <div className="divide-y divide-border">
          <SettingsRow label="Project name" value={project?.name ?? connection?.name ?? "—"} />
          <SettingsRow label="Project ID" value={project?.id ?? "—"} mono />
          <SettingsRow
            label="Created"
            value={project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "—"}
          />
          <SettingsRow label="Project URL" value={connection?.url ?? "—"} mono />
        </div>
        <a
          href={`${connection?.url}/health`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Open health endpoint
        </a>
      </section>

      {/* Phase 10 — Database provider */}
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Database Provider</h2>
        </div>

        {!provider ? (
          <div className="h-10 rounded bg-muted animate-pulse" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ProviderBadge provider={provider.provider} />
              <div>
                <p className="text-sm font-medium text-foreground">{provider.label}</p>
                <p className="text-xs text-muted-foreground">Dialect: {provider.dialect}</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              <SettingsRow label="Provider" value={provider.provider} mono />
              <SettingsRow label="SQL dialect" value={provider.dialect} mono />
              <SettingsRow
                label="Row-Level Security"
                value={provider.supportsRls ? "Supported" : "Not supported (SQLite/MySQL only)"}
              />
            </div>

            {!provider.supportsRls && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  RLS is only available with Postgres providers (Neon, Supabase, raw Postgres).
                  Switch your provider in <code className="font-mono">betterbase.config.ts</code> to enable it.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-destructive/30 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Disconnect project</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Removes this connection from the dashboard. Your backend data is not affected.
            </p>
          </div>
          {confirmDisconnect ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="px-3 py-1.5 rounded bg-muted text-muted-foreground text-xs hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDisconnect(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-colors flex-shrink-0"
            >
              <Trash2 className="h-3 w-3" />
              Disconnect
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn(
        "text-xs text-foreground text-right break-all",
        mono && "font-mono"
      )}>
        {value}
      </span>
    </div>
  )
}

const PROVIDER_STYLES: Record<string, string> = {
  local:       "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  neon:        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  turso:       "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  supabase:    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  postgres:    "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  planetscale: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
}

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
      PROVIDER_STYLES[provider] ?? "bg-muted text-foreground border-border"
    )}>
      {provider}
    </span>
  )
}
```

---

## PART 6: RLS PAGE (Phase 11)

**File:** `app/dashboard/rls/page.tsx`

```tsx
"use client"

import { useRlsPolicies } from "@/hooks/use-rls"
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "@/hooks/use-project"
import { Shield, ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const OPERATIONS = ["select", "insert", "update", "delete"] as const

const OP_COLORS: Record<string, string> = {
  select: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  insert: "bg-green-500/10 text-green-600 border-green-500/20",
  update: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default function RlsPage() {
  const { data: policies, isLoading } = useRlsPolicies()
  const client = useMetaClient()

  // Check if provider supports RLS
  const { data: provider } = useQuery({
    queryKey: ["provider"],
    queryFn: async () => {
      if (!client) throw new Error("No connection")
      const r = await client.getProvider()
      if (r.error) throw new Error(r.error)
      return r.data!
    },
    enabled: !!client,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">RLS Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Row-Level Security rules controlling which rows each user can access
        </p>
      </div>

      {/* Postgres-only warning */}
      {provider && !provider.supportsRls && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              RLS requires a Postgres provider
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Your current provider is <strong>{provider.provider}</strong> ({provider.dialect}).
              RLS policies are only enforced on Postgres. Switch to Neon, Supabase Postgres, or raw Postgres
              in <code className="font-mono">betterbase.config.ts</code> to use RLS in production.
              Policies shown below will be applied once you migrate.
            </p>
          </div>
        </div>
      )}

      {/* How RLS works */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4 space-y-1.5">
        <p className="text-xs font-semibold text-foreground">How BetterBase RLS works</p>
        <p className="text-xs text-muted-foreground">
          Policy expressions are SQL WHERE clauses that get appended to every query for that operation.
          The variable <code className="font-mono bg-muted px-1 py-0.5 rounded">auth.uid()</code> resolves
          to the currently authenticated user's ID from the BetterAuth session.
          Requests using the <code className="font-mono bg-muted px-1 py-0.5 rounded">service_role</code> key
          bypass all RLS policies entirely.
        </p>
      </div>

      {/* Policy list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 rounded-lg border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !policies || policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">No RLS policies defined</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a policy file to start restricting row access
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb rls create &lt;tableName&gt;
          </code>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => {
            const definedCount = OPERATIONS.filter(op => policy[op]).length
            return (
              <div key={policy.table} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Policy header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <code className="text-sm font-semibold text-foreground">{policy.table}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{policy.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {definedCount}/{OPERATIONS.length} operations protected
                    </span>
                    <div className="flex gap-1">
                      {OPERATIONS.map(op => (
                        <div
                          key={op}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            policy[op] ? "bg-green-500" : "bg-muted-foreground/30"
                          )}
                          title={`${op}: ${policy[op] ? "protected" : "no policy"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Operations grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-border">
                  {OPERATIONS.map(op => (
                    <div key={op} className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase border",
                          OP_COLORS[op]
                        )}>
                          {op}
                        </span>
                      </div>
                      {policy[op] ? (
                        <code className="block text-xs font-mono text-foreground leading-relaxed break-all">
                          {policy[op]}
                        </code>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                          <ShieldOff className="h-3 w-3" />
                          <span className="text-xs italic">No policy</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## PART 7: GRAPHQL PAGE (Phase 12)

**File:** `app/dashboard/graphql/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useGraphqlSchema } from "@/hooks/use-graphql"
import { useConnectionStore } from "@/lib/store"
import { Code2, Send, Copy, Check, ExternalLink } from "lucide-react"

const STARTER_QUERIES = [
  {
    label: "Schema types",
    query: `{
  __schema {
    types {
      name
      kind
    }
  }
}`,
  },
  {
    label: "Full introspection",
    query: `{
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      fields {
        name
        type { name kind }
      }
    }
  }
}`,
  },
]

export default function GraphQLPage() {
  const connection = useConnectionStore(s => s.getActive())
  const { data: schemaData, isLoading, error: schemaError } = useGraphqlSchema()
  const [query, setQuery] = useState(STARTER_QUERIES[0].query)
  const [variables, setVariables] = useState("{}")
  const [result, setResult] = useState<unknown>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function runQuery() {
    if (!connection) return
    setRunning(true)
    setRunError(null)
    try {
      let vars = {}
      try { vars = JSON.parse(variables) } catch { /* use empty */ }
      const res = await fetch(schemaData?.endpoint ?? `${connection.url}/api/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${connection.serviceRoleKey}`,
        },
        body: JSON.stringify({ query, variables: vars }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setRunError(String(err))
    } finally {
      setRunning(false)
    }
  }

  function copyEndpoint() {
    navigator.clipboard.writeText(schemaData?.endpoint ?? "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Not set up yet
  if (!isLoading && (schemaError || !schemaData)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">GraphQL</h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated GraphQL API</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">GraphQL not configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate a GraphQL schema from your existing tables
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb generate graphql
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">GraphQL</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore your auto-generated GraphQL API
          </p>
        </div>
        {schemaData && (
          <a
            href={schemaData.endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open full playground
          </a>
        )}
      </div>

      {/* Endpoint */}
      {schemaData && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <code className="text-sm font-mono text-foreground">{schemaData.endpoint}</code>
          </div>
          <button
            onClick={copyEndpoint}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="h-96 rounded-lg border border-border bg-muted animate-pulse" />
      ) : (
        <div className="grid grid-cols-5 gap-4 h-[600px]">

          {/* Left panel: query editor */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Query</p>
              <div className="flex gap-1">
                {STARTER_QUERIES.map(q => (
                  <button
                    key={q.label}
                    onClick={() => setQuery(q.query)}
                    className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              spellCheck={false}
              placeholder="Enter GraphQL query..."
            />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Variables</p>
              <textarea
                value={variables}
                onChange={e => setVariables(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                spellCheck={false}
                placeholder="{}"
              />
            </div>
            <button
              onClick={runQuery}
              disabled={running}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {running ? "Running..." : "Run query"}
            </button>
          </div>

          {/* Middle panel: SDL schema */}
          <div className="col-span-1 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Schema (SDL)</p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 overflow-auto">
              <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre leading-relaxed">
                {schemaData?.schema}
              </pre>
            </div>
          </div>

          {/* Right panel: response */}
          <div className="col-span-2 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Response</p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 overflow-auto">
              {runError ? (
                <div className="p-4">
                  <p className="text-xs text-destructive font-mono">{runError}</p>
                </div>
              ) : result ? (
                <pre className="p-4 text-xs font-mono text-foreground leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground">Run a query to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## PART 8: WEBHOOKS PAGE (Phase 13)

**File:** `app/dashboard/webhooks/page.tsx`

```tsx
"use client"

import { useState } from "react"
import {
  useWebhooks, useCreateWebhook, useDeleteWebhook,
  useTestWebhook, useToggleWebhook
} from "@/hooks/use-webhooks"
import { Webhook, Plus, Trash2, Play, Power, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DB_EVENTS = ["INSERT", "UPDATE", "DELETE"] as const

export default function WebhooksPage() {
  const { data: webhooks, isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()
  const toggleWebhook = useToggleWebhook()

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    table: "", events: [] as string[], url: "", secret: ""
  })
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; status: number }>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function toggleEvent(event: string) {
    setForm(f => ({
      ...f,
      events: f.events.includes(event)
        ? f.events.filter(e => e !== event)
        : [...f.events, event],
    }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createWebhook.mutateAsync({
      table: form.table,
      events: form.events,
      url: form.url,
      secret: form.secret || undefined,
    })
    setForm({ table: "", events: [], url: "", secret: "" })
    setShowCreate(false)
  }

  async function handleTest(id: string) {
    const result = await testWebhook.mutateAsync(id)
    setTestResults(p => ({ ...p, [id]: { ok: result.ok, status: result.status } }))
    setTimeout(() => {
      setTestResults(p => { const n = { ...p }; delete n[id]; return n })
    }, 6000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            HTTP callbacks fired automatically on database INSERT, UPDATE, or DELETE events
          </p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create webhook
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">New webhook</h2>
            <button type="button" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Table <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="posts"
                value={form.table}
                onChange={e => setForm(f => ({ ...f, table: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Endpoint URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                placeholder="https://your-server.com/webhook"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Events <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {DB_EVENTS.map(event => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors",
                    form.events.includes(event)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Signing secret{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Used to sign payload with HMAC SHA-256"
              value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createWebhook.isPending || form.events.length === 0 || !form.table || !form.url}
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createWebhook.isPending ? "Creating..." : "Create webhook"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Webhooks list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-lg border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !webhooks || webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Webhook className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">No webhooks configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a webhook to receive HTTP notifications when your data changes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(webhook => {
            const events: string[] =
              typeof webhook.events === "string"
                ? JSON.parse(webhook.events)
                : webhook.events
            const testResult = testResults[webhook.id]

            return (
              <div
                key={webhook.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-semibold font-mono text-foreground">
                        {webhook.table}
                      </code>
                      {events.map(ev => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground border border-border"
                        >
                          {ev}
                        </span>
                      ))}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        webhook.enabled
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      )}>
                        {webhook.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      → {webhook.url}
                    </p>
                    {webhook.secret && (
                      <p className="text-xs text-muted-foreground">
                        Signed with HMAC SHA-256
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      disabled={testWebhook.isPending}
                      title="Send test payload"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        toggleWebhook.mutate({ id: webhook.id, enabled: !webhook.enabled })
                      }
                      title={webhook.enabled ? "Disable" : "Enable"}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    {deleteId === webhook.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteWebhook.mutate(webhook.id)
                            setDeleteId(null)
                          }}
                          className="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(webhook.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Test result banner */}
                {testResult && (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded text-xs",
                    testResult.ok
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                  )}>
                    {testResult.ok
                      ? <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      : <X className="h-3.5 w-3.5 flex-shrink-0" />
                    }
                    Test delivery: HTTP {testResult.status} — {testResult.ok ? "Success" : "Failed"}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## PART 9: STORAGE PAGE (Phase 14)

**File:** `app/dashboard/storage/page.tsx`

```tsx
"use client"

import { useState } from "react"
import { useStorageBuckets, useStorageFiles, useDeleteStorageFile } from "@/hooks/use-storage"
import { HardDrive, File, Folder, Trash2, ChevronRight, AlertCircle } from "lucide-react"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function StoragePage() {
  const { data: buckets, isLoading: bucketsLoading, error: bucketsError } = useStorageBuckets()
  const [prefix, setPrefix] = useState("")
  const [deleteKey, setDeleteKey] = useState<string | null>(null)

  const activeBucket = buckets?.[0]?.name ?? null
  const { data: files, isLoading: filesLoading } = useStorageFiles(activeBucket ?? "", prefix)
  const deleteFile = useDeleteStorageFile(activeBucket ?? "")

  const breadcrumbs = prefix.split("/").filter(Boolean)

  if (bucketsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
        </div>
        <div className="h-64 rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    )
  }

  if (bucketsError || !buckets || buckets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
          <p className="text-sm text-muted-foreground mt-1">S3-compatible object storage</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HardDrive className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">Storage not configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a storage provider during project setup or configuration
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb init → select storage provider
          </code>
        </div>
      </div>
    )
  }

  const bucket = buckets[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage files in your object storage bucket
        </p>
      </div>

      {/* Bucket info card */}
      <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold font-mono text-foreground">{bucket.name}</p>
            <p className="text-xs text-muted-foreground">
              {bucket.provider}
              {bucket.region && ` · ${bucket.region}`}
              {bucket.endpoint && !bucket.region && ` · ${bucket.endpoint}`}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
          Connected
        </span>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-sm flex-wrap">
        <button
          onClick={() => setPrefix("")}
          className="text-primary hover:underline font-mono text-xs"
        >
          {bucket.name}
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button
              onClick={() => setPrefix(breadcrumbs.slice(0, i + 1).join("/") + "/")}
              className="text-primary hover:underline font-mono text-xs"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* File browser */}
      <div className="rounded-lg border border-border overflow-hidden">
        {filesLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : !files || files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Folder className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {prefix ? "This folder is empty" : "No files in this bucket"}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Last modified
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {files.map(file => {
                  const displayName = file.key.replace(prefix, "")
                  const isFolder = displayName.endsWith("/")
                  return (
                    <tr
                      key={file.key}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => isFolder && setPrefix(file.key)}
                          disabled={!isFolder}
                          className="flex items-center gap-2 text-left"
                        >
                          {isFolder ? (
                            <Folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-xs font-mono",
                            isFolder ? "text-primary hover:underline cursor-pointer" : "text-foreground"
                          )}>
                            {displayName}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {isFolder ? "—" : formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {isFolder ? "—" : new Date(file.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {isFolder ? "folder" : (file.contentType ?? "—")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isFolder && (
                          deleteKey === file.key ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  deleteFile.mutate(file.key)
                                  setDeleteKey(null)
                                }}
                                className="px-2 py-0.5 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteKey(null)}
                                className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteKey(file.key)}
                              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## PART 10: EDGE FUNCTIONS PAGE (Phase 15)

**File:** `app/dashboard/functions/page.tsx`

```tsx
"use client"

import { useEdgeFunctions } from "@/hooks/use-functions"
import { Cpu, Check, X, Terminal, ExternalLink, RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const RUNTIME_STYLES: Record<string, { color: string; label: string }> = {
  "cloudflare-workers": {
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    label: "Cloudflare Workers",
  },
  "vercel-edge": {
    color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
    label: "Vercel Edge",
  },
  "deno-deploy": {
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "Deno Deploy",
  },
}

export default function FunctionsPage() {
  const { data: functions, isLoading } = useEdgeFunctions()
  const qc = useQueryClient()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edge Functions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Serverless functions deployed to the edge from <code className="font-mono text-xs">src/functions/</code>
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["edge-functions"] })}
          className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Workflow guide */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-4">
        <p className="text-xs font-semibold text-foreground mb-2">Deployment workflow</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {[
            "bb function create <name>",
            "→ Edit src/functions/<name>/index.ts",
            "→ bb function build <name>",
            "→ bb function deploy <name>",
          ].map((step, i) => (
            <code key={i} className="px-2 py-1 rounded bg-muted font-mono text-foreground border border-border">
              {step}
            </code>
          ))}
        </div>
      </div>

      {/* Functions list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 rounded-lg border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !functions || functions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Cpu className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">No edge functions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first function to get started
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb function create my-function
          </code>
        </div>
      ) : (
        <div className="space-y-3">
          {functions.map(fn => {
            const runtime = RUNTIME_STYLES[fn.runtime]
            const isReady = fn.hasIndex && fn.built

            return (
              <div
                key={fn.name}
                className="rounded-lg border border-border bg-card p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm font-semibold font-mono text-foreground">
                          {fn.name}
                        </code>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border",
                          runtime?.color ?? "bg-muted text-muted-foreground border-border"
                        )}>
                          {runtime?.label ?? fn.runtime}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          isReady
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        )}>
                          {isReady ? "Ready to deploy" : "Not built"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <StatusPill label="index.ts" ok={fn.hasIndex} />
                        <StatusPill label="Built" ok={fn.built} />
                        {fn.deployUrl && (
                          <a
                            href={fn.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Deployed URL
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CLI commands */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {!fn.built && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted border border-border">
                      <Terminal className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <code className="text-xs font-mono text-foreground">{fn.buildCommand}</code>
                    </div>
                  )}
                  {fn.built && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted border border-border">
                      <Terminal className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <code className="text-xs font-mono text-foreground">{fn.deployCommand}</code>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
      )}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
```

---

## PART 11: VERIFICATION

After implementing everything in this document, check every page:

| Page | Route | Requires | Empty state when |
|------|-------|----------|-----------------|
| Settings (updated) | `/dashboard/settings` | Phase 10 `/api/meta/provider` | Never — always shows |
| RLS Policies | `/dashboard/rls` | Phase 11 `src/db/policies/` | No `.policy.ts` files exist |
| GraphQL | `/dashboard/graphql` | Phase 12 `schema.graphql` | `bb generate graphql` not run |
| Webhooks | `/dashboard/webhooks` | Phase 13 `betterbase_webhooks` table | No webhooks created |
| Storage | `/dashboard/storage` | Phase 14 `STORAGE_PROVIDER` env | Storage not configured |
| Edge Functions | `/dashboard/functions` | Phase 15 `src/functions/` directory | No functions created |

Every page with no data shows a clear empty state with the exact CLI command needed to populate it. No page crashes if the feature is not yet set up — they all fail gracefully.

**TypeScript check:** Run `bun run typecheck` in the dashboard repo after all files are added. Must pass with zero errors before considering this document complete.
