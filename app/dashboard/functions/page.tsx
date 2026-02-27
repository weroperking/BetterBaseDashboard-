"use client"

import { useEdgeFunctions } from "@/hooks/use-functions"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <PageContainer size="full">
      <PageHeader 
        title="Edge Functions" 
        subtitle="Serverless functions deployed to the edge"
        actions={
          <Button
            variant="default"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => qc.invalidateQueries({ queryKey: ["edge-functions"] })}
          >
            Refresh
          </Button>
        }
      />

      {/* Workflow guide */}
      <Card className="bg-surface-100 mb-6">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2">Deployment workflow</p>
          <div className="flex items-center gap-2 text-xs text-foreground-light flex-wrap">
            {[
              "bb function create <name>",
              "→ Edit src/functions/<name>/index.ts",
              "→ bb function build <name>",
              "→ bb function deploy <name>",
            ].map((step, i) => (
              <code key={i} className="px-2 py-1 rounded bg-surface-200 font-mono text-foreground border border-border">
                {step}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Functions list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 rounded-lg border border-border bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : !functions || functions.length === 0 ? (
        <Card className="p-12 text-center">
          <Cpu className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No edge functions yet</p>
          <p className="text-xs text-foreground-light mt-1">
            Create your first function to get started
          </p>
          <code className="mt-4 inline-block px-3 py-1.5 rounded bg-surface-200 text-xs font-mono text-foreground-light">
            bb function create my-function
          </code>
        </Card>
      ) : (
        <div className="space-y-4">
          {functions.map(fn => {
            const runtime = RUNTIME_STYLES[fn.runtime]
            const isReady = fn.hasIndex && fn.built

            return (
              <Card key={fn.name} className="bg-surface-100">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <Cpu className="h-5 w-5 text-brand" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-semibold font-mono text-foreground">
                            {fn.name}
                          </code>
                          <Badge variant="outline" className={cn(runtime?.color)}>
                            {runtime?.label ?? fn.runtime}
                          </Badge>
                          <Badge variant={isReady ? "brand" : "warning"}>
                            {isReady ? "Ready to deploy" : "Not built"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                          <StatusPill label="index.ts" ok={fn.hasIndex} />
                          <StatusPill label="Built" ok={fn.built} />
                          {fn.deployUrl && (
                            <a
                              href={fn.deployUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-brand hover:underline"
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
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-surface-200 border border-border">
                        <Terminal className="h-3 w-3 text-foreground-muted flex-shrink-0" />
                        <code className="text-xs font-mono text-foreground">{fn.buildCommand}</code>
                      </div>
                    )}
                    {fn.built && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-surface-200 border border-border">
                        <Terminal className="h-3 w-3 text-foreground-muted flex-shrink-0" />
                        <code className="text-xs font-mono text-foreground">{fn.deployCommand}</code>
                      </div>
                    )}
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

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <Check className="h-3 w-3 text-brand flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-foreground-muted flex-shrink-0" />
      )}
      <span className="text-xs text-foreground-light">{label}</span>
    </div>
  )
}
