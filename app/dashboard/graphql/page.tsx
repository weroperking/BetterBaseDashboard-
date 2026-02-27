"use client"

import { useState } from "react"
import { useGraphqlSchema } from "@/hooks/use-graphql"
import { useConnectionStore } from "@/lib/store"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { Code2, Send, Copy, Check, ExternalLink, AlertTriangle, Play, Save, History } from "lucide-react"

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
      <PageContainer size="full">
        <PageHeader title="GraphQL" subtitle="Auto-generated GraphQL API" />
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <Code2 className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">GraphQL not configured</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Generate a GraphQL schema from your existing tables
              </p>
            </div>
            <code className="px-4 py-2 rounded bg-[#2d2d2d] text-xs font-mono text-[#a0a0a0]">
              bb generate graphql
            </code>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader 
        title="GraphQL" 
        subtitle="Explore your auto-generated GraphQL API"
        actions={
          schemaData && (
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="h-4 w-4" />}
              asChild
            >
              <a href={schemaData.endpoint} target="_blank" rel="noopener noreferrer">
                Open full playground
              </a>
            </Button>
          )
        }
      />

      {/* Endpoint */}
      {schemaData && (
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#24b47e]" />
              <code className="text-sm font-mono text-white">{schemaData.endpoint}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? <Check className="h-3.5 w-3.5 text-[#24b47e]" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={copyEndpoint}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security warning for service role key */}
      <Card className="mb-4 bg-[rgba(251,191,36,0.05)] border-[rgba(251,191,36,0.2)]">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-[#fbbf24] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#fbbf24]">Elevated privileges</p>
            <p className="text-xs text-[#a0a0a0] mt-0.5">
              Queries run with the <code className="font-mono bg-[#2d2d2d] px-1 rounded">service_role</code> key bypasses all RLS policies.
              Use with caution in production.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-[600px] rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
      ) : (
        <div className="grid grid-cols-5 gap-4 h-[600px]">
          {/* Left panel: query editor */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white uppercase tracking-wide">Query</p>
              <div className="flex gap-1">
                {STARTER_QUERIES.map(q => (
                  <Button
                    key={q.label}
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuery(q.query)}
                  >
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-[#1e1e1e] rounded-[6px] border border-[#404040] overflow-hidden">
              <div className="flex h-full">
                {/* Line numbers */}
                <div className="w-10 bg-[#1e1e1e] border-r border-[#333333] p-2 pt-3 text-right">
                  {query.split('\n').map((_, i) => (
                    <div key={i} className="text-xs font-mono text-[#666666] leading-5">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code area */}
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-[#1e1e1e] text-white font-mono text-xs p-3 resize-none focus:outline-none leading-5"
                  spellCheck={false}
                  placeholder="Enter GraphQL query..."
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white mb-1.5">Variables</p>
              <div className="bg-[#1e1e1e] rounded-[6px] border border-[#404040]">
                <textarea
                  value={variables}
                  onChange={e => setVariables(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1e1e1e] text-white font-mono text-xs p-3 resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="{}"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={runQuery}
                disabled={running}
                icon={<Play className="h-4 w-4" />}
                className="flex-1"
              >
                {running ? "Running..." : "Run Query"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<History className="h-4 w-4" />}
              >
                History
              </Button>
            </div>
          </div>

          {/* Middle panel: SDL schema */}
          <div className="col-span-1 flex flex-col gap-2">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">Schema (SDL)</p>
            <Card className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto bg-[#1e1e1e]">
                <div className="flex">
                  {/* Line numbers */}
                  <div className="w-8 bg-[#1e1e1e] border-r border-[#333333] p-2 pt-3 text-right flex-shrink-0">
                    {(schemaData?.schema || '').split('\n').slice(0, 50).map((_, i) => (
                      <div key={i} className="text-xs font-mono text-[#666666] leading-5">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <pre className="text-xs font-mono text-[#a0a0a0] p-3 whitespace-pre leading-5">
                    {schemaData?.schema?.slice(0, 2000)}
                    {schemaData?.schema && schemaData.schema.length > 2000 && '...'}
                  </pre>
                </div>
              </div>
            </Card>
          </div>

          {/* Right panel: response */}
          <div className="col-span-2 flex flex-col gap-2">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">Response</p>
            <Card className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto bg-[#1e1e1e] p-4">
                {runError ? (
                  <pre className="text-xs text-[#ef4444] font-mono">{runError}</pre>
                ) : result ? (
                  <pre className="text-xs font-mono text-white leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Code2 className="h-8 w-8 text-[#666666] mx-auto mb-2" />
                      <p className="text-xs text-[#666666]">Run a query to see the response</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
