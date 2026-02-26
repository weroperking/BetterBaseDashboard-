"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, ProjectInfo } from "@/lib/betterbase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  const { getActive } = useConnectionStore()
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchProject() {
      setLoading(true)
      const result = await client.getProject()
      
      if (result.error) {
        setError(result.error)
      } else {
        setProject(result.data)
      }
      
      setLoading(false)
    }

    fetchProject()
  }, [getActive])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Settings
          </CardTitle>
          <CardDescription>
            Manage your project settings and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Project Name</p>
            <p className="text-muted-foreground">{project?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Project ID</p>
            <p className="text-muted-foreground font-mono text-sm">{project?.id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Created At</p>
            <p className="text-muted-foreground">
              {project?.createdAt ? new Date(project.createdAt).toLocaleString() : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}