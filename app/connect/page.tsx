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
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#3fcf8e]/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#3fcf8e]/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#3fcf8e]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#3fcf8e]/2 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center">
              <Database className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">BetterBase</span>
          </div>
          <p className="text-[#a0a0a0] text-sm">
            Connect to a BetterBase project to get started
          </p>
        </div>

        {/* Saved Connections */}
        {connections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">Recent connections</h2>
              <Badge variant="secondary">{connections.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {connections.map(conn => (
                <Card 
                  key={conn.id} 
                  className="cursor-pointer hover:border-brand transition-colors group"
                  onClick={() => { setActive(conn.id); router.push("/dashboard") }}
                >
                  <CardContent className="p-4 bg-[#2d2d2d] border border-[#333333] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#2e2e2e] flex items-center justify-center">
                          <Server className="w-4 h-4 text-[#a0a0a0]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{conn.name}</div>
                          <div className="text-xs text-[#a0a0a0]">{conn.url}</div>
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
                        <ArrowRight className="w-4 h-4 text-[#666666]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#333333]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#1a1a1a] px-2 text-[#666666]">or add new</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {connections.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#2e2e2e] flex items-center justify-center">
              <Link2 className="w-6 h-6 text-[#666666]" />
            </div>
            <div>
              <h3 className="text-white font-medium">No connections yet</h3>
              <p className="text-[#a0a0a0] text-sm mt-0.5">
                Add your first project to get started
              </p>
            </div>
          </div>
        )}

        </div>

        {/* Connection Form */}
        <Card className="bg-[#2d2d2d] border border-[#333333]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg text-white">Connect to project</CardTitle>
            <CardDescription className="text-[#a0a0a0]">
              Enter your project details to connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Project name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My App"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-white">
                  Project URL <span className="text-[#f87171]">*</span>
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
                <Label htmlFor="serviceRoleKey" className="text-white">
                  Service role key <span className="text-[#f87171]">*</span>
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
                <p className="text-xs text-[#a0a0a0]">
                  Found in your project .env as BETTERBASE_SERVICE_ROLE_KEY
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-[#f87171]/10 border border-[#f87171]/20">
                  <p className="text-sm text-[#f87171]">{error}</p>
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
