"use client"

import { useState, useEffect } from "react"

interface Stats {
  papersCount: number
  usersCount: number
  totalViews: number
  totalListeningHours: number
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching stats...")

        const response = await fetch("/api/stats")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error in useStats:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        // Set default stats on error
        setStats({
          papersCount: 0,
          usersCount: 0,
          totalViews: 0,
          totalListeningHours: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
