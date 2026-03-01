"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useConnectionStore, ProjectConnection } from "@/lib/store"
import { useMetaClient } from "@/hooks/use-project"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Trash2, Database, Key, Settings as SettingsIcon, Copy, Check, RefreshCw, FolderKanban } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const router = useRouter()
  const { connections, getActive, removeConnection, setActive } = useConnectionStore()
  const connection = getActive()
  const client = useMetaClient()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [copied, setCopied] = useState(false)

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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSwitchProject(connectionId: string) {
    setActive(connectionId)
    router.refresh()
  }

  return (
    <PageContainer size="default">
      <PageHeader 
        title="Settings" 
        subtitle="Project connection and configuration details"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Project Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <FolderKanban className="h-4 w-4 text-[#a0a0a0]" />
              Project Settings
            </CardTitle>
            <CardDescription>Select and manage your projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-[#a0a0a0]">Switch Project</label>
              <Select
                value={connection?.id || ""}
                onValueChange={handleSwitchProject}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem key={conn.id} value={conn.id}>
                      <div className="flex items-center gap-2">
                        <span>{conn.name}</span>
                        {conn.id === connection?.id && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Active</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="divide-y divide-[#333333]">
              <SettingsRow label="Current project" value={connection?.name ?? "—"} />
              <SettingsRow label="Project ID" value={connection?.projectId ?? "—"} mono />
              <SettingsRow label="Project URL" value={connection?.url ?? "—"} mono />
            </div>
            {connection?.url && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="h-4 w-4" />}
                className="w-full"
                asChild
              >
                <a href={`${connection.url}/health`} target="_blank" rel="noopener noreferrer">
                  Open health endpoint
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Database provider */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#a0a0a0]" />
              <CardTitle className="text-base font-medium">Database Provider</CardTitle>
            </div>
            <CardDescription>Your database configuration</CardDescription>
          </CardHeader>

          {!provider ? (
            <CardContent>
              <div className="h-10 rounded bg-[#2d2d2d] animate-pulse" />
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <ProviderBadge provider={provider.provider} />
                <div>
                  <p className="text-sm font-medium text-white">{provider.label}</p>
                  <p className="text-xs text-[#a0a0a0]">Dialect: {provider.dialect}</p>
                </div>
              </div>

              <div className="divide-y divide-[#333333]">
                <SettingsRow label="Provider" value={provider.provider} mono />
                <SettingsRow label="SQL dialect" value={provider.dialect} mono />
                <SettingsRow
                  label="Row-Level Security"
                  value={provider.supportsRls ? "Supported" : "Not supported (SQLite/MySQL only)"}
                />
              </div>

              {!provider.supportsRls && (
                <div className="rounded-md bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] px-3 py-2">
                  <p className="text-xs text-[#fbbf24]">
                    RLS is only available with Postgres providers (Neon, Supabase, raw Postgres).
                    Switch your provider in <code className="font-mono bg-[#2d2d2d] px-1 rounded">betterbase.config.ts</code> to enable it.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#a0a0a0]" />
              <CardTitle className="text-base font-medium">API Keys</CardTitle>
            </div>
            <CardDescription>Keys used for API authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-[#333333]">
              <SettingsRow label="Service Role Key" value={connection?.serviceRoleKey ? "••••••••••••••••" : "—"} mono />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Rotate Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-[rgba(239,68,68,0.3)]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[#ef4444]">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect your connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Disconnect project</p>
                <p className="text-xs text-[#a0a0a0] mt-0.5">
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
                    variant="secondary"
                    onClick={() => setConfirmDisconnect(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[rgba(239,68,68,0.3)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => setConfirmDisconnect(true)}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsRow({ label, value, mono, action }: { label: string; value: string; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
      <span className="text-xs text-[#a0a0a0] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs text-white text-right break-all",
          mono && "font-mono"
        )}>
          {value}
        </span>
        {action}
      </div>
    </div>
  )
}

const PROVIDER_STYLES: Record<string, string> = {
  local:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neon:        "bg-green-500/10 text-green-400 border-green-500/20",
  turso:       "bg-purple-500/10 text-purple-400 border-purple-500/20",
  supabase:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  postgres:    "bg-sky-500/10 text-sky-400 border-sky-500/20",
  planetscale: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={cn(
      "px-3 py-1.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
      PROVIDER_STYLES[provider] ?? "bg-[#2d2d2d] text-white border-[#404040]"
    )}>
      {provider}
    </span>
  )
}
