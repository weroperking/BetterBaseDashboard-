"use client"

import { useState } from "react"
import {
  useWebhooks, useCreateWebhook, useDeleteWebhook,
  useTestWebhook, useToggleWebhook
} from "@/hooks/use-webhooks"
import { Webhook, Plus, Trash2, Play, Power, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DB_EVENTS = ["INSERT", "UPDATE", "DELETE"] as const

export default function WebhooksPage() {
  const { data: webhooks, isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()
  const toggleWebhook = useToggleWebhook()

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    table: "", events: [] as string[], url: "", secret: ""
  })
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; status: number }>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function toggleEvent(event: string) {
    setForm(f => ({
      ...f,
      events: f.events.includes(event)
        ? f.events.filter(e => e !== event)
        : [...f.events, event],
    }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createWebhook.mutateAsync({
      table: form.table,
      events: form.events,
      url: form.url,
      secret: form.secret || undefined,
    })
    setForm({ table: "", events: [], url: "", secret: "" })
    setShowCreate(false)
  }

  async function handleTest(id: string) {
    try {
      const result = await testWebhook.mutateAsync(id)
      setTestResults(p => ({ ...p, [id]: { ok: result.ok, status: result.status } }))
    } catch (err) {
      setTestResults(p => ({ ...p, [id]: { ok: false, status: 0 } }))
    }
    setTimeout(() => {
      setTestResults(p => { const n = { ...p }; delete n[id]; return n })
    }, 6000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            HTTP callbacks fired automatically on database INSERT, UPDATE, or DELETE events
          </p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create webhook
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">New webhook</h2>
            <button type="button" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Table <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="posts"
                value={form.table}
                onChange={e => setForm(f => ({ ...f, table: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Endpoint URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                placeholder="https://your-server.com/webhook"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Events <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {DB_EVENTS.map(event => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors",
                    form.events.includes(event)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Signing secret{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Used to sign payload with HMAC SHA-256"
              value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
              className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createWebhook.isPending || form.events.length === 0 || !form.table || !form.url}
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createWebhook.isPending ? "Creating..." : "Create webhook"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Webhooks list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-lg border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : !webhooks || webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Webhook className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">No webhooks configured</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a webhook to receive HTTP notifications when your data changes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map(webhook => {
            const events: string[] = (() => {
              try {
                return typeof webhook.events === "string"
                  ? JSON.parse(webhook.events)
                  : webhook.events
              } catch {
                return []
              }
            })()
            const testResult = testResults[webhook.id]

            return (
              <div
                key={webhook.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-semibold font-mono text-foreground">
                        {webhook.table}
                      </code>
                      {events.map(ev => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground border border-border"
                        >
                          {ev}
                        </span>
                      ))}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        webhook.enabled
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      )}>
                        {webhook.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      → {webhook.url}
                    </p>
                    {webhook.secret && (
                      <p className="text-xs text-muted-foreground">
                        Signed with HMAC SHA-256
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      disabled={testWebhook.isPending}
                      title="Send test payload"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        toggleWebhook.mutate({ id: webhook.id, enabled: !webhook.enabled })
                      }
                      title={webhook.enabled ? "Disable" : "Enable"}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    {deleteId === webhook.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteWebhook.mutate(webhook.id)
                            setDeleteId(null)
                          }}
                          className="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(webhook.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Test result banner */}
                {testResult && (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded text-xs",
                    testResult.ok
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                  )}>
                    {testResult.ok
                      ? <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      : <X className="h-3.5 w-3.5 flex-shrink-0" />
                    }
                    Test delivery: HTTP {testResult.status} — {testResult.ok ? "Success" : "Failed"}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
