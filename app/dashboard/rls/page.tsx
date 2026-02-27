"use client"

import { useRlsPolicies } from "@/hooks/use-rls"
import { useQuery } from "@tanstack/react-query"
import { useMetaClient } from "@/hooks/use-project"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldOff, AlertTriangle, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const OPERATIONS = ["select", "insert", "update", "delete"] as const

const OP_COLORS: Record<string, string> = {
  select: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  insert: "bg-green-500/10 text-green-400 border-green-500/20",
  update: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  delete: "bg-red-500/10 text-red-400 border-red-500/20",
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
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
          >
            New Policy
          </Button>
        }
      />

      {/* Postgres-only warning */}
      {provider && !provider.supportsRls && (
        <Card className="mb-4 bg-[rgba(251,191,36,0.05)] border-[rgba(251,191,36,0.2)]">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-[#fbbf24] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#fbbf24]">RLS requires a Postgres provider</p>
              <p className="text-xs text-[#a0a0a0] mt-0.5">
                Your current provider is <strong className="text-white">{provider.provider}</strong> ({provider.dialect}).
                RLS policies are only enforced on Postgres. Switch to Neon, Supabase Postgres, or raw Postgres
                in <code className="font-mono bg-[#2d2d2d] px-1 rounded">betterbase.config.ts</code> to use RLS in production.
                Policies shown below will be applied once you migrate.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How RLS works */}
      <Card className="mb-4">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-white">How BetterBase RLS works</p>
          <p className="text-xs text-[#a0a0a0]">
            Policy expressions are SQL WHERE clauses that get appended to every query for that operation.
            The variable <code className="font-mono bg-[#2d2d2d] px-1 py-0.5 rounded text-white">auth.uid()</code> resolves
            to the currently authenticated user's ID from the BetterAuth session.
            Requests using the <code className="font-mono bg-[#2d2d2d] px-1 py-0.5 rounded text-white">service_role</code> key
            bypass all RLS policies entirely.
          </p>
        </CardContent>
      </Card>

      {/* Policy list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
          ))}
        </div>
      ) : !policies || policies.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <Shield className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No RLS policies defined</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Create a policy file to start restricting row access
              </p>
            </div>
            <code className="px-4 py-2 rounded bg-[#2d2d2d] text-xs font-mono text-[#a0a0a0]">
              bb rls create tableName
            </code>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => {
            const definedCount = OPERATIONS.filter(op => policy[op]).length
            return (
              <Card key={policy.table} className="overflow-hidden">
                {/* Policy header */}
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-[#1e1e1e]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#24b47e] flex-shrink-0" />
                    <div>
                      <code className="text-sm font-semibold font-mono text-white">{policy.table}</code>
                      <p className="text-xs text-[#a0a0a0] mt-0.5">{policy.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a0a0a0]">
                      {definedCount}/{OPERATIONS.length} operations protected
                    </span>
                    <div className="flex gap-1">
                      {OPERATIONS.map(op => (
                        <div
                          key={op}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            policy[op] ? "bg-[#24b47e]" : "bg-[#666666]"
                          )}
                          title={`${op}: ${policy[op] ? "protected" : "no policy"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>

                {/* Operations grid */}
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#333333]">
                    {OPERATIONS.map(op => (
                      <div key={op} className="p-4 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={cn("font-mono uppercase text-xs", OP_COLORS[op])}>
                            {op}
                          </Badge>
                        </div>
                        {policy[op] ? (
                          <code className="block text-xs font-mono text-[#a0a0a0] leading-relaxed break-all">
                            {policy[op]}
                          </code>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#666666]">
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
