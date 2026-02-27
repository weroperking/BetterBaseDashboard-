"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, ArrowRight, Plus, Trash2, Server, Link2 } from "lucide-react"

export default function ConnectPage() {
  const router = useRouter()
  const { connections, addConnection, setActive, removeConnection } = useConnectionStore()
  const [form, setForm] = useState({ name: "", url: "", serviceRoleKey: "" })
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setTesting(true)
    setError(null)

    const client = new BetterBaseMetaClient({
      id: "test",
      name: form.name,
      url: form.url,
      serviceRoleKey: form.serviceRoleKey,
      projectId: "",
      addedAt: "",
    })

    const test = await client.testConnection()

    if (!test.ok) {
      setError(test.error ?? "Connection failed")
      setTesting(false)
      return
    }

    const projectInfo = await client.getProject()

    addConnection({
      name: form.name || projectInfo.data?.name || "My Project",
      url: form.url,
      serviceRoleKey: form.serviceRoleKey,
      projectId: projectInfo.data?.id ?? "",
    })

    router.push("/dashboard")
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    removeConnection(id)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center">
              <Database className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-bold text-foreground">BetterBase</span>
          </div>
          <p className="text-foreground-light text-sm">
            Connect to a BetterBase project to get started
          </p>
        </div>

        {/* Saved Connections */}
        {connections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Recent connections</h2>
              <Badge variant="secondary">{connections.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {connections.map(conn => (
                <Card 
                  key={conn.id} 
                  className="cursor-pointer hover:border-brand transition-colors group"
                  onClick={() => { setActive(conn.id); router.push("/dashboard") }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-surface-200 flex items-center justify-center">
                          <Server className="w-4 h-4 text-foreground-light" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{conn.name}</div>
                          <div className="text-xs text-foreground-light">{conn.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDelete(e, conn.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <ArrowRight className="w-4 h-4 text-foreground-muted" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-foreground-muted">or add new</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {connections.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-foreground-muted" />
            </div>
            <div>
              <h3 className="text-foreground font-medium">No connections yet</h3>
              <p className="text-foreground-light text-sm mt-0.5">
                Add your first project to get started
              </p>
            </div>
          </div>
        )}

        {/* Connection Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Connect to project</CardTitle>
            <CardDescription>
              Enter your project details to connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My App"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">
                  Project URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="http://localhost:3000"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceRoleKey">
                  Service role key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="serviceRoleKey"
                  type="password"
                  placeholder="bb_service_..."
                  value={form.serviceRoleKey}
                  onChange={e => setForm(f => ({ ...f, serviceRoleKey: e.target.value }))}
                  required
                  className="font-mono"
                />
                <p className="text-xs text-foreground-light">
                  Found in your project .env as BETTERBASE_SERVICE_ROLE_KEY
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={testing}
                className="w-full"
                icon={!testing ? <Plus className="w-4 h-4" /> : undefined}
              >
                {testing ? "Testing connection..." : "Connect to project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
