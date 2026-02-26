"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient } from "@/lib/betterbase-client"

export default function ConnectPage() {
  const router = useRouter()
  const { connections, addConnection, setActive } = useConnectionStore()
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-foreground mb-2">BetterBase</div>
          <p className="text-muted-foreground text-sm">
            Connect to a BetterBase project to get started
          </p>
        </div>

        {connections.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Recent connections</p>
            <div className="space-y-2">
              {connections.map(conn => (
                <button
                  key={conn.id}
                  onClick={() => { setActive(conn.id); router.push("/dashboard") }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{conn.name}</div>
                    <div className="text-xs text-muted-foreground">{conn.url}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
              ))}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or add new</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Project name
            </label>
            <input
              type="text"
              placeholder="My App"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Project URL <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              placeholder="http://localhost:3000"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Service role key <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              placeholder="bb_service_..."
              value={form.serviceRoleKey}
              onChange={e => setForm(f => ({ ...f, serviceRoleKey: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your project .env as BETTERBASE_SERVICE_ROLE_KEY
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={testing}
            className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {testing ? "Testing connection..." : "Connect to project"}
          </button>
        </form>
      </div>
    </div>
  )
}