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
