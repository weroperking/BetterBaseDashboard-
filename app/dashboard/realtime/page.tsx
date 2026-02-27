"use client"

import { Activity, Users, List, Radio, Power, PowerOff, RefreshCw } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealtime } from "@/hooks/use-realtime"

function LoadingState() {
  return (
    <PageContainer size="full">
      <PageHeader title="Realtime" subtitle="Monitor WebSocket connections" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-[#2d2d2d]" />
              <div className="h-4 w-4 animate-pulse rounded bg-[#2d2d2d]" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-[#2d2d2d]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-[#2d2d2d]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded bg-[#2d2d2d]" />
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
        <Activity className="h-12 w-12 text-[#ef4444] mx-auto mb-4" />
        <p className="text-sm font-medium text-white">{message}</p>
      </Card>
    </PageContainer>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-4">
          <Radio className="h-8 w-8 text-[#666666]" />
        </div>
        <p className="text-base font-semibold text-white">No realtime data available</p>
        <p className="text-sm text-[#a0a0a0] mt-1">
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
      <PageHeader 
        title="Realtime" 
        subtitle="Monitor WebSocket connections"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Status Card */}
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-[rgba(36,180,126,0.2)] flex items-center justify-center">
              <Radio className="h-5 w-5 text-[#24b47e]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Database Realtime</p>
              <p className="text-xs text-[#a0a0a0]">Broadcast database changes to connected clients</p>
            </div>
          </div>
          <Badge variant="success">
            <Power className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#a0a0a0]">Connected Clients</CardTitle>
            <Users className="h-4 w-4 text-[#666666]" />
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold text-white leading-tight">
              {data.connectedClients}
            </div>
            <p className="text-xs text-[#666666] mt-1">Active WebSocket connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#a0a0a0]">Total Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-[#666666]" />
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold text-white leading-tight">
              {data.totalSubscriptions}
            </div>
            <p className="text-xs text-[#666666] mt-1">Active table subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#a0a0a0]">Subscribed Tables</CardTitle>
            <List className="h-4 w-4 text-[#666666]" />
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold text-white leading-tight">
              {data.subscribedTables.length}
            </div>
            <p className="text-xs text-[#666666] mt-1">Tables being monitored</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <List className="h-4 w-4 text-[#a0a0a0]" />
            Subscribed Tables
            <Badge variant="secondary">{data.subscribedTables.length}</Badge>
          </CardTitle>
          <CardDescription>
            Tables with active realtime subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.subscribedTables.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.subscribedTables.map((table) => (
                <div key={table} className="flex items-center gap-2 p-2 rounded bg-[#2d2d2d]">
                  <div className="h-2 w-2 rounded-full bg-[#24b47e] animate-pulse" />
                  <span className="font-mono text-sm text-white truncate">{table}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <List className="h-8 w-8 text-[#666666] mx-auto mb-2" />
              <p className="text-sm text-[#a0a0a0]">No tables are currently subscribed</p>
              <p className="text-xs text-[#666666] mt-1">
                Use the Realtime API to subscribe to table changes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
