"use client"

import { useState, useEffect, useCallback } from "react"
import type { Database } from "@/lib/database.types"

type Paper = Database["public"]["Tables"]["papers"]["Row"]

interface UsePapersOptions {
  category?: string
  search?: string
  sortBy?: "created_at" | "views" | "likes"
  limit?: number
}

export function usePapers(options: UsePapersOptions = {}) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.category) params.set("category", options.category)
      if (options.search) params.set("search", options.search)
      if (options.sortBy) params.set("sortBy", options.sortBy)
      if (options.limit) params.set("limit", options.limit.toString())

      console.log("Fetching papers with params:", params.toString())

      const response = await fetch(`/api/papers?${params}`)

      if (!response.ok) {
        // 依 Content-Type 分流解析
        const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json")

        const errorPayload = isJson
          ? await response.json().catch(() => ({}))
          : { error: await response.text().catch(() => "") }

        const friendly = errorPayload.message || errorPayload.error || `HTTP ${response.status} ${response.statusText}`

        throw new Error(friendly)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setPapers(data)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      console.error("Error in usePapers:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setPapers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [options.category, options.search, options.sortBy, options.limit])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  return { papers, loading, error, refetch: fetchPapers }
}

type PaperWithLikeStatus = Paper & { is_liked_by_user?: boolean }

export function usePaper(id: string) {
  const [paper, setPaper] = useState<PaperWithLikeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaper = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching paper with id:", id)

      // We need to know the user's like status, so we pass a flag
      const response = await fetch(`/api/papers/${id}?include_like_status=true`)

      if (!response.ok) {
        // 依 Content-Type 分流解析
        const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json")
        const errorPayload = isJson ? await response.json().catch(() => ({})) : { error: await response.text().catch(() => "") }
        const friendly = errorPayload.message || errorPayload.error || `HTTP ${response.status} ${response.statusText}`
        throw new Error(friendly)
      }

      const data = await response.json()
      setPaper(data)
    } catch (err) {
      console.error("Error in usePaper:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setPaper(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPaper()
  }, [fetchPaper])

  const setLikeStatus = (isLiked: boolean) => {
    setPaper(prev => {
      if (!prev) return null
      return {
        ...prev,
        is_liked_by_user: isLiked,
        likes: prev.likes + (isLiked ? 1 : -1)
      }
    })
  }

  return { paper, loading, error, setLikeStatus, refetch: fetchPaper }
}
