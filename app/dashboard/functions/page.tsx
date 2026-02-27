"use client"

import { useEdgeFunctions } from "@/hooks/use-functions"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, Check, X, Terminal, ExternalLink, RefreshCw, Plus, Play, Settings } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const RUNTIME_STYLES: Record<string, { color: string; label: string }> = {
  "cloudflare-workers": {
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    label: "Cloudflare Workers",
  },
  "vercel-edge": {
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    label: "Vercel Edge",
  },
  "deno-deploy": {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => qc.invalidateQueries({ queryKey: ["edge-functions"] })}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              New Function
            </Button>
          </div>
        }
      />

      {/* Workflow guide */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-white mb-2">Deployment workflow</p>
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0] flex-wrap">
            {[
              "bb function create <name>",
              "→ Edit src/functions/<name>/index.ts",
              "→ bb function build <name>",
              "→ bb function deploy <name>",
            ].map((step, i) => (
              <code key={i} className="px-2 py-1 rounded bg-[#2d2d2d] font-mono text-white border border-[#404040]">
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
            <div key={i} className="h-28 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
          ))}
        </div>
      ) : !functions || functions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <Cpu className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No edge functions yet</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Create your first function to get started
              </p>
            </div>
            <code className="px-4 py-2 rounded bg-[#2d2d2d] text-xs font-mono text-[#a0a0a0]">
              bb function create my-function
            </code>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {functions.map(fn => {
            const runtime = RUNTIME_STYLES[fn.runtime]
            const isReady = fn.hasIndex && fn.built

            return (
              <Card key={fn.name}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-[rgba(36,180,126,0.2)] flex items-center justify-center flex-shrink-0">
                        <Cpu className="h-5 w-5 text-[#24b47e]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-semibold font-mono text-white">
                            {fn.name}
                          </code>
                          <Badge variant="outline" className={cn(runtime?.color)}>
                            {runtime?.label ?? fn.runtime}
                          </Badge>
                          <Badge variant={isReady ? "success" : "warning"}>
                            {isReady ? "Ready" : "Not built"}
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
                              className="flex items-center gap-1 text-xs text-[#24b47e] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Deployed URL
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fn.built && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Play className="h-4 w-4" />}
                        >
                          Deploy
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* CLI commands */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {!fn.built && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#2d2d2d] border border-[#404040]">
                        <Terminal className="h-3 w-3 text-[#666666] flex-shrink-0" />
                        <code className="text-xs font-mono text-white">{fn.buildCommand}</code>
                      </div>
                    )}
                    {fn.built && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#2d2d2d] border border-[#404040]">
                        <Terminal className="h-3 w-3 text-[#666666] flex-shrink-0" />
                        <code className="text-xs font-mono text-white">{fn.deployCommand}</code>
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
        <Check className="h-3 w-3 text-[#24b47e] flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-[#666666] flex-shrink-0" />
      )}
      <span className="text-xs text-[#a0a0a0]">{label}</span>
    </div>
  )
}
