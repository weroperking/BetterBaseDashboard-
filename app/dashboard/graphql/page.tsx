"use client"

import { useState } from "react"
import { useGraphqlSchema } from "@/hooks/use-graphql"
import { useConnectionStore } from "@/lib/store"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { Code2, Send, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react"

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
          <Code2 className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">GraphQL not configured</p>
          <p className="text-xs text-foreground-light mt-1">
            Generate a GraphQL schema from your existing tables
          </p>
          <code className="mt-4 inline-block px-3 py-1.5 rounded bg-surface-200 text-xs font-mono text-foreground-light">
            bb generate graphql
          </code>
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
              variant="default"
              size="sm"
              icon={<ExternalLink className="h-3.5 w-3.5" />}
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
        <Card className="bg-surface-100 mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-brand" />
              <code className="text-sm font-mono text-foreground">{schemaData.endpoint}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={copyEndpoint}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security warning for service role key */}
      <Card className="bg-warning/5 border-warning/20 mb-6">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Elevated privileges</p>
            <p className="text-xs text-warning/80 mt-0.5">
              Queries run with the <code className="font-mono">service_role</code> key bypass all RLS policies.
              Use with caution in production.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-96 rounded-lg border border-border bg-surface-100 animate-pulse" />
      ) : (
        <div className="grid grid-cols-5 gap-4 h-[600px]">
          {/* Left panel: query editor */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Query</p>
              <div className="flex gap-1">
                {STARTER_QUERIES.map(q => (
                  <Button
                    key={q.label}
                    size="sm"
                    variant="default"
                    onClick={() => setQuery(q.query)}
                  >
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 font-mono text-xs"
              spellCheck={false}
              placeholder="Enter GraphQL query..."
            />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Variables</p>
              <Textarea
                value={variables}
                onChange={e => setVariables(e.target.value)}
                rows={3}
                className="font-mono text-xs"
                spellCheck={false}
                placeholder="{}"
              />
            </div>
            <Button
              variant="primary"
              onClick={runQuery}
              disabled={running}
              icon={<Send className="h-4 w-4" />}
            >
              {running ? "Running..." : "Run query"}
            </Button>
          </div>

          {/* Middle panel: SDL schema */}
          <div className="col-span-1 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Schema (SDL)</p>
            <Card className="flex-1 bg-surface-100 overflow-hidden">
              <CardContent className="p-3 h-full overflow-auto">
                <pre className="text-xs font-mono text-foreground-light whitespace-pre leading-relaxed">
                  {schemaData?.schema}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Right panel: response */}
          <div className="col-span-2 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Response</p>
            <Card className="flex-1 bg-surface-100 overflow-hidden">
              <CardContent className="p-4 h-full overflow-auto">
                {runError ? (
                  <p className="text-xs text-destructive font-mono">{runError}</p>
                ) : result ? (
                  <pre className="text-xs font-mono text-foreground leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-foreground-light">Run a query to see the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
