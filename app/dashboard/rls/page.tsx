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
