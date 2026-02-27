"use client"

import { useRlsPolicies } from "@/hooks/use-rls"
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "@/hooks/use-project"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <PageContainer size="full">
      <PageHeader 
        title="RLS Policies" 
        subtitle="Row-Level Security rules controlling which rows each user can access"
      />

      {/* Postgres-only warning */}
      {provider && !provider.supportsRls && (
        <Card className="bg-warning/5 border-warning/20 mb-6">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">RLS requires a Postgres provider</p>
              <p className="text-xs text-warning/80 mt-0.5">
                Your current provider is <strong>{provider.provider}</strong> ({provider.dialect}).
                RLS policies are only enforced on Postgres. Switch to Neon, Supabase Postgres, or raw Postgres
                in <code className="font-mono">betterbase.config.ts</code> to use RLS in production.
                Policies shown below will be applied once you migrate.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How RLS works */}
      <Card className="bg-surface-100 mb-6">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground">How BetterBase RLS works</p>
          <p className="text-xs text-foreground-light">
            Policy expressions are SQL WHERE clauses that get appended to every query for that operation.
            The variable <code className="font-mono bg-surface-200 px-1 py-0.5 rounded">auth.uid()</code> resolves
            to the currently authenticated user's ID from the BetterAuth session.
            Requests using the <code className="font-mono bg-surface-200 px-1 py-0.5 rounded">service_role</code> key
            bypass all RLS policies entirely.
          </p>
        </CardContent>
      </Card>

      {/* Policy list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 rounded-lg border border-border bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : !policies || policies.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No RLS policies defined</p>
          <p className="text-xs text-foreground-light mt-1">
            Create a policy file to start restricting row access
          </p>
          <code className="mt-4 inline-block px-3 py-1.5 rounded bg-surface-200 text-xs font-mono text-foreground-light">
            bb rls create tableName
          </code>
        </Card>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => {
            const definedCount = OPERATIONS.filter(op => policy[op]).length
            return (
              <Card key={policy.table} className="bg-surface-100 overflow-hidden">
                {/* Policy header */}
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-surface-200/50">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-brand flex-shrink-0" />
                    <div>
                      <code className="text-sm font-semibold text-foreground">{policy.table}</code>
                      <p className="text-xs text-foreground-light mt-0.5">{policy.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground-light">
                      {definedCount}/{OPERATIONS.length} operations protected
                    </span>
                    <div className="flex gap-1">
                      {OPERATIONS.map(op => (
                        <div
                          key={op}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            policy[op] ? "bg-brand" : "bg-foreground-muted"
                          )}
                          title={`${op}: ${policy[op] ? "protected" : "no policy"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>

                {/* Operations grid */}
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-border">
                    {OPERATIONS.map(op => (
                      <div key={op} className="p-4 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={cn("font-mono uppercase", OP_COLORS[op])}>
                            {op}
                          </Badge>
                        </div>
                        {policy[op] ? (
                          <code className="block text-xs font-mono text-foreground leading-relaxed break-all">
                            {policy[op]}
                          </code>
                        ) : (
                          <div className="flex items-center gap-1.5 text-foreground-muted">
                            <ShieldOff className="h-3 w-3" />
                            <span className="text-xs italic">No policy</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
