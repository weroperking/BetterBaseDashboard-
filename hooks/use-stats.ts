import { useEffect, useState } from "react"
import { useConnectionStore } from "@/lib/store"
import { BetterBaseMetaClient, Stats, ChartDataPoint } from "@/lib/betterbase-client"

export function useStats() {
  const { getActive } = useConnectionStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connection = getActive()
    if (!connection) {
      setLoading(false)
      return
    }

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

  return { stats, chartData, loading, error }
}