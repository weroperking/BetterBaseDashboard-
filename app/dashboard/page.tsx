"use client"

import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, Stats, ChartDataPoint } from "@/lib/betterbase-client"
import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, Activity, FileText, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Database, Plus } from "lucide-react"

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
        <PageHeader
          title="Overview"
          subtitle="Dashboard overview and key metrics for your project."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 animate-pulse rounded bg-[#2d2d2d]" />
                <div className="h-6 w-6 animate-pulse rounded bg-[#2d2d2d]" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-[#2d2d2d]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Overview"
          subtitle="Dashboard overview and key metrics for your project."
        />
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-status-danger mx-auto mb-4" />
          <p className="text-sm font-medium text-white">{error}</p>
        </Card>
      </PageContainer>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Sessions",
      value: stats?.activeSessions ?? 0,
      icon: Activity,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Requests Today",
      value: stats?.requestsToday ?? 0,
      icon: FileText,
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "Errors Today",
      value: stats?.errorsToday ?? 0,
      icon: AlertCircle,
      trend: "-5%",
      trendUp: false,
    },
  ]

  // Sample recent activity data
  const recentActivity = [
    { type: "user_signup", description: "New user registered", time: "2 min ago" },
    { type: "api_request", description: "API request to /api/users", time: "5 min ago" },
    { type: "db_change", description: "Table 'posts' updated", time: "12 min ago" },
    { type: "api_request", description: "API request to /api/products", time: "18 min ago" },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        subtitle="Dashboard overview and key metrics for your project."
      />

      {/* Stats Cards - Supabase Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#a0a0a0]">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-[#666666]" />
            </CardHeader>
            <CardContent>
              <div className="text-[32px] font-semibold text-white leading-tight">
                {stat.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5 text-accent-green" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-status-danger" />
                )}
                <span className={`text-xs font-medium ${stat.trendUp ? 'text-accent-green' : 'text-status-danger'}`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-[#666666]">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />}>
            New Table
          </Button>
          <Button variant="secondary" size="sm" icon={<Database className="h-4 w-4" />}>
            Run SQL
          </Button>
          <Button variant="secondary" size="sm" icon={<Users className="h-4 w-4" />}>
            Add User
          </Button>
        </CardContent>
      </Card>

      {/* Request Volume Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Request Volume (Last 24 Hours)</CardTitle>
          <Badge variant="secondary">{chartData.length} data points</Badge>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-48 flex items-end gap-1">
              {chartData.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent-green rounded-t transition-all hover:bg-accent-green-hover"
                    style={{ height: `${Math.min((point.requests / Math.max(...chartData.map(d => d.requests), 1)) * 100, 100)}%` }}
                    title={`${point.requests} requests at ${point.hour}`}
                  />
                  <span className="text-[10px] text-[#666666]">{point.hour}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-[#a0a0a0]">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">{activity.description}</TableCell>
                  <TableCell className="text-right text-[#666666]">{activity.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
