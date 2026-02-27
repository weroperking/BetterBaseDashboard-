"use client"

import { useState } from "react"
import {
  useWebhooks, useCreateWebhook, useDeleteWebhook,
  useTestWebhook, useToggleWebhook
} from "@/hooks/use-webhooks"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Webhook, Plus, Trash2, Play, Power, Check, X, Settings } from "lucide-react"
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
    <PageContainer size="full">
      <PageHeader 
        title="Webhooks" 
        subtitle="HTTP callbacks fired automatically on database events"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(v => !v)}
          >
            Create webhook
          </Button>
        }
      />

      {/* Create form */}
      {showCreate && (
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-base font-medium">
              <span>New webhook</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table">Table <span className="text-[#ef4444]">*</span></Label>
                  <Input
                    id="table"
                    placeholder="posts"
                    value={form.table}
                    onChange={e => setForm(f => ({ ...f, table: e.target.value }))}
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Endpoint URL <span className="text-[#ef4444]">*</span></Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Events <span className="text-[#ef4444]">*</span></Label>
                <div className="flex gap-2">
                  {DB_EVENTS.map(event => (
                    <Button
                      key={event}
                      type="button"
                      size="sm"
                      variant={form.events.includes(event) ? "primary" : "secondary"}
                      onClick={() => toggleEvent(event)}
                      className="font-mono"
                    >
                      {event}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">
                  Signing secret{" "}
                  <span className="text-[#a0a0a0] font-normal">(optional)</span>
                </Label>
                <Input
                  id="secret"
                  type="text"
                  placeholder="Used to sign payload with HMAC SHA-256"
                  value={form.secret}
                  onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createWebhook.isPending || form.events.length === 0 || !form.table || !form.url}
                >
                  {createWebhook.isPending ? "Creating..." : "Create webhook"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Webhooks list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-lg border border-[#404040] bg-[#222222] animate-pulse" />
          ))}
        </div>
      ) : !webhooks || webhooks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center">
              <Webhook className="h-8 w-8 text-[#666666]" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No webhooks configured</p>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Create a webhook to receive HTTP notifications when your data changes
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
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
              <Card key={webhook.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm font-semibold font-mono text-white">
                          {webhook.table}
                        </code>
                        {events.map(ev => (
                          <Badge key={ev} variant="outline" className="font-mono">
                            {ev}
                          </Badge>
                        ))}
                        <Badge variant={webhook.enabled ? "success" : "secondary"}>
                          {webhook.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono text-[#a0a0a0] truncate">
                        → {webhook.url}
                      </p>
                      {webhook.secret && (
                        <p className="text-xs text-[#666666]">
                          Signed with HMAC SHA-256
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleTest(webhook.id)}
                        disabled={testWebhook.isPending}
                        title="Send test payload"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          toggleWebhook.mutate({ id: webhook.id, enabled: !webhook.enabled })
                        }
                        title={webhook.enabled ? "Disable" : "Enable"}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      {deleteId === webhook.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              deleteWebhook.mutate(webhook.id)
                              setDeleteId(null)
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(webhook.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Test result banner */}
                  {testResult && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded text-xs",
                      testResult.ok
                        ? "bg-[rgba(36,180,126,0.1)] text-[#24b47e] border border-[rgba(36,180,126,0.2)]"
                        : "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]"
                    )}>
                      {testResult.ok
                        ? <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        : <X className="h-3.5 w-3.5 flex-shrink-0" />
                      }
                      Test delivery: HTTP {testResult.status} — {testResult.ok ? "Success" : "Failed"}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
