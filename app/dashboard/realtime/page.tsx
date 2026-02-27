"use client"

import { Activity, Users, List } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtime } from "@/hooks/use-realtime"

function LoadingState() {
  return (
    <PageContainer size="full">
      <PageHeader title="Realtime" subtitle="Monitor WebSocket connections" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-surface-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-surface-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-surface-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-surface-200" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-surface-100">
        <CardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-surface-200" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded bg-surface-200" />
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <PageContainer size="full">
      <PageHeader title="Realtime" subtitle="Monitor WebSocket connections" />
      <Card className="p-8 text-center">
        <p className="text-destructive">{message}</p>
      </Card>
    </PageContainer>
  )
}

function EmptyState() {
  return (
    <Card className="bg-surface-100">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Activity className="h-12 w-12 text-foreground-muted mb-4" />
        <p className="text-foreground-light text-center">No realtime data available</p>
        <p className="text-sm text-foreground-light text-center mt-1">
          Connect to a project to monitor WebSocket connections
        </p>
      </CardContent>
    </Card>
  )
}

export default function RealtimePage() {
  const { data, loading, error } = useRealtime()

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} />
  }

  if (!data) {
    return (
      <PageContainer size="full">
        <PageHeader title="Realtime" subtitle="Monitor WebSocket connections" />
        <EmptyState />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader title="Realtime" subtitle="Monitor WebSocket connections" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="bg-surface-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-light">Connected Clients</CardTitle>
            <Users className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.connectedClients}</div>
            <p className="text-xs text-foreground-light">Active WebSocket connections</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-light">Total Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSubscriptions}</div>
            <p className="text-xs text-foreground-light">Active table subscriptions</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-light">Subscribed Tables</CardTitle>
            <List className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subscribedTables.length}</div>
            <p className="text-xs text-foreground-light">Tables being monitored</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <List className="h-4 w-4 text-foreground-light" />
            Subscribed Tables
            <Badge variant="secondary">{data.subscribedTables.length}</Badge>
          </CardTitle>
          <CardDescription>
            Tables with active realtime subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.subscribedTables.length > 0 ? (
            <ul className="space-y-2">
              {data.subscribedTables.map((table) => (
                <li key={table} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  <span className="font-mono text-sm">{table}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <List className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <p className="text-sm text-foreground-light">No tables are currently subscribed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
