"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, Stats, ChartDataPoint } from "@/lib/betterbase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Users, Activity, FileText, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const { getActive } = useConnectionStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) return

    const client = new BetterBaseMetaClient(connection)

    async function fetchData() {
      setLoading(true)
      const [statsResult, chartResult] = await Promise.all([
        client.getStats(),
        client.getLogsChart()
      ])

      if (statsResult.error) {
        setError(statsResult.error)
      } else {
        setStats(statsResult.data)
      }

      if (chartResult.data) {
        setChartData(chartResult.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [getActive])

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-foreground-light">Loading...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error}</p>
        </div>
      </PageContainer>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
    },
    {
      title: "Active Sessions",
      value: stats?.activeSessions ?? 0,
      icon: Activity,
    },
    {
      title: "Requests Today",
      value: stats?.requestsToday ?? 0,
      icon: FileText,
    },
    {
      title: "Errors Today",
      value: stats?.errorsToday ?? 0,
      icon: AlertCircle,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        subtitle="Dashboard overview and key metrics for your project."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-foreground-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Request Volume (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end gap-2">
              {chartData.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand rounded-t"
                    style={{ height: `${Math.min((point.requests / Math.max(...chartData.map(d => d.requests))) * 100, 100)}%` }}
                  />
                  <span className="text-xs text-foreground-light">{point.hour}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground-light text-sm">No data available</p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
