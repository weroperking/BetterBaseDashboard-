"use client"

import { useState } from "react"
import { useGraphqlSchema } from "@/hooks/use-graphql"
import { useConnectionStore } from "@/lib/store"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">GraphQL</h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated GraphQL API</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">GraphQL not configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate a GraphQL schema from your existing tables
          </p>
          <code className="mt-3 px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
            bb generate graphql
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">GraphQL</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore your auto-generated GraphQL API
          </p>
        </div>
        {schemaData && (
          <a
            href={schemaData.endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open full playground
          </a>
        )}
      </div>

      {/* Endpoint */}
      {schemaData && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <code className="text-sm font-mono text-foreground">{schemaData.endpoint}</code>
          </div>
          <button
            onClick={copyEndpoint}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* Security warning for service role key */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Elevated privileges
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
            Queries run with the <code className="font-mono">service_role</code> key bypass all RLS policies.
            Use with caution in production.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 rounded-lg border border-border bg-muted animate-pulse" />
      ) : (
        <div className="grid grid-cols-5 gap-4 h-[600px]">

          {/* Left panel: query editor */}
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Query</p>
              <div className="flex gap-1">
                {STARTER_QUERIES.map(q => (
                  <button
                    key={q.label}
                    onClick={() => setQuery(q.query)}
                    className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              spellCheck={false}
              placeholder="Enter GraphQL query..."
            />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">Variables</p>
              <textarea
                value={variables}
                onChange={e => setVariables(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                spellCheck={false}
                placeholder="{}"
              />
            </div>
            <button
              onClick={runQuery}
              disabled={running}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {running ? "Running..." : "Run query"}
            </button>
          </div>

          {/* Middle panel: SDL schema */}
          <div className="col-span-1 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Schema (SDL)</p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 overflow-auto">
              <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre leading-relaxed">
                {schemaData?.schema}
              </pre>
            </div>
          </div>

          {/* Right panel: response */}
          <div className="col-span-2 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">Response</p>
            <div className="flex-1 rounded-lg border border-border bg-muted/30 overflow-auto">
              {runError ? (
                <div className="p-4">
                  <p className="text-xs text-destructive font-mono">{runError}</p>
                </div>
              ) : result ? (
                <pre className="p-4 text-xs font-mono text-foreground leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground">Run a query to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
