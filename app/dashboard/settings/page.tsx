"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useConnectionStore } from "@/lib/store"
import { useMetaClient } from "@/hooks/use-project"
import { PageContainer, PageHeader, PageSection } from "@/components/layout/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <PageContainer size="constrained">
      <PageHeader 
        title="Settings" 
        subtitle="Project connection and configuration details"
      />

      {/* Project info */}
      <Card className="bg-surface-100">
        <CardContent className="p-5 space-y-4">
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
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            icon={<ExternalLink className="h-3 w-3" />}
            asChild
          >
            <a href={`${connection?.url}/health`} target="_blank" rel="noopener noreferrer">
              Open health endpoint
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Database provider */}
      <Card className="bg-surface-100">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-foreground-muted" />
            <h2 className="text-sm font-semibold text-foreground">Database Provider</h2>
          </div>

          {!provider ? (
            <div className="h-10 rounded bg-surface-200 animate-pulse" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ProviderBadge provider={provider.provider} />
                <div>
                  <p className="text-sm font-medium text-foreground">{provider.label}</p>
                  <p className="text-xs text-foreground-light">Dialect: {provider.dialect}</p>
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
                <div className="rounded-md bg-warning/10 border border-warning/20 px-3 py-2">
                  <p className="text-xs text-warning">
                    RLS is only available with Postgres providers (Neon, Supabase, raw Postgres).
                    Switch your provider in <code className="font-mono">betterbase.config.ts</code> to enable it.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30 bg-surface-100">
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Disconnect project</p>
              <p className="text-xs text-foreground-light mt-0.5">
                Removes this connection from the dashboard. Your backend data is not affected.
              </p>
            </div>
            {confirmDisconnect ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setConfirmDisconnect(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => setConfirmDisconnect(true)}
              >
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
      <span className="text-xs text-foreground-light flex-shrink-0">{label}</span>
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
      PROVIDER_STYLES[provider] ?? "bg-surface-200 text-foreground border-border"
    )}>
      {provider}
    </span>
  )
}
