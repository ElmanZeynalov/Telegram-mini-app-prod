import { useState, useEffect, useCallback } from "react"
import { AnalyticsStats, StatsPeriod } from "../types"

export function useStats(period: StatsPeriod = '7d', language: string = 'all', pollingInterval = 30000) {
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/analytics/stats?period=${period}&language=${language}`)
            if (!res.ok) throw new Error("Failed to fetch statistics")
            const data = await res.json()
            setStats(data)
        } catch (e) {
            console.error("Stats fetch error:", e)
            if (!isBackground) setError("Failed to load statistics")
        } finally {
            if (!isBackground) setLoading(false)
        }
    }, [period, language])

    useEffect(() => {
        // Initial fetch
        fetchStats()

        // Polling
        if (pollingInterval > 0) {
            const interval = setInterval(() => {
                fetchStats(true)
            }, pollingInterval)
            return () => clearInterval(interval)
        }
    }, [fetchStats, pollingInterval])

    return { stats, loading, error, refetch: () => fetchStats(false) }
}
