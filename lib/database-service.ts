import { createServerComponentClient } from "./supabase"
import type { Database } from "./database.types"

type Paper = Database["public"]["Tables"]["papers"]["Row"]
type PaperInsert = Database["public"]["Tables"]["papers"]["Insert"]
type User = Database["public"]["Tables"]["users"]["Row"]
type Comment = Database["public"]["Tables"]["comments"]["Row"]
type PendingUpload = Database["public"]["Tables"]["pending_uploads"]["Row"]
type PendingUploadInsert = Database["public"]["Tables"]["pending_uploads"]["Insert"]

export class DatabaseService {
  private supabase = createServerComponentClient()

  // 論文相關操作
  async getPapers(options?: {
    category?: string
    search?: string
    sortBy?: "created_at" | "views" | "likes"
    limit?: number
    offset?: number
  }) {
    try {
      console.log("DatabaseService.getPapers called with options:", options)

      let query = this.supabase.from("papers").select("*")

      if (options?.category && options.category !== "all") {
        query = query.eq("category", options.category)
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`)
      }

      if (options?.sortBy) {
        query = query.order(options.sortBy, { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase error in getPapers:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("Papers fetched successfully:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("Error in getPapers:", error)
      throw error
    }
  }

  async getPaperById(id: string) {
    try {
      console.log("DatabaseService.getPaperById called with id:", id)

      const { data, error } = await this.supabase.from("papers").select("*").eq("id", id).single()

      if (error) {
        console.error("Supabase error in getPaperById:", error)
        if (error.code === "PGRST116") {
          return null // Paper not found
        }
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("Paper fetched successfully:", data?.title)
      return data
    } catch (error) {
      console.error("Error in getPaperById:", error)
      throw error
    }
  }

  async getTrendingPapers(limit = 6) {
    try {
      const { data, error } = await this.supabase
        .from("papers")
        .select("*")
        .eq("trending", true)
        .order("views", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Supabase error in getTrendingPapers:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getTrendingPapers:", error)
      throw error
    }
  }

  async getLatestPaper() {
    try {
      const { data, error } = await this.supabase
        .from("papers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("Supabase error in getLatestPaper:", error)
        if (error.code === "PGRST116") {
          return null // No papers found
        }
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in getLatestPaper:", error)
      throw error
    }
  }

  async incrementPaperViews(paperId: string) {
    try {
      const { error } = await this.supabase.rpc("increment_paper_views", {
        paper_id: paperId,
      })

      if (error) {
        console.error("Supabase error in incrementPaperViews:", error)
        // Don't throw error for view increment failures
        console.warn("Failed to increment views, continuing...")
      }
    } catch (error) {
      console.error("Error in incrementPaperViews:", error)
      // Don't throw error for view increment failures
    }
  }

  async createPaper(paper: PaperInsert) {
    try {
      const { data, error } = await this.supabase.from("papers").insert(paper).select().single()

      if (error) {
        console.error("Supabase error in createPaper:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in createPaper:", error)
      throw error
    }
  }

  async deletePaper(paperId: string) {
    try {
      const { error } = await this.supabase.from('papers').delete().eq('id', paperId);
      if (error) {
        console.error("Supabase error in deletePaper:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return { success: true };
    } catch (error) {
      console.error("Error in deletePaper:", error);
      throw error;
    }
  }

  // 用戶相關操作
  async getUserById(id: string) {
    try {
      const { data, error } = await this.supabase.from("users").select("*").eq("id", id).single()

      if (error) {
        console.error("Supabase error in getUserById:", error)
        if (error.code === "PGRST116") {
          return null // User not found
        }
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in getUserById:", error)
      throw error
    }
  }

  async createUser(user: Database["public"]["Tables"]["users"]["Insert"]) {
    try {
      const { data, error } = await this.supabase.from("users").insert(user).select().single()

      if (error) {
        console.error("Supabase error in createUser:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in createUser:", error)
      throw error
    }
  }

  async getUsers() {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error in getUsers:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getUsers:", error)
      throw error
    }
  }

  // 統計數據
  async getStats() {
    try {
      console.log("DatabaseService.getStats called")

      const [papersResult, usersResult, viewsResult] = await Promise.all([
        this.supabase.from("papers").select("id", { count: "exact", head: true }),
        this.supabase.from("users").select("id", { count: "exact", head: true }),
        this.supabase.from("papers").select("views"),
      ])

      if (papersResult.error) {
        console.error("Error fetching papers count:", papersResult.error)
        throw new Error(`Database error: ${papersResult.error.message}`)
      }

      if (usersResult.error) {
        console.error("Error fetching users count:", usersResult.error)
        throw new Error(`Database error: ${usersResult.error.message}`)
      }

      if (viewsResult.error) {
        console.error("Error fetching views:", viewsResult.error)
        throw new Error(`Database error: ${viewsResult.error.message}`)
      }

      const totalViews =
        viewsResult.data?.reduce((sum, paper) => {
          return sum + (paper.views || 0)
        }, 0) || 0

      const stats = {
        papersCount: papersResult.count || 0,
        usersCount: usersResult.count || 0,
        totalViews: totalViews,
        totalListeningHours: Math.round(totalViews * 0.3), // 假設平均收聽時長
      }

      console.log("Stats calculated:", stats)
      return stats
    } catch (error) {
      console.error("Error in getStats:", error)
      throw error
    }
  }

  async getCategoryStats() {
    try {
      console.log("DatabaseService.getCategoryStats called")

      // 獲取所有論文的分類和統計資料
      const { data: papers, error } = await this.supabase
        .from("papers")
        .select("category, views, trending, created_at")

      if (error) {
        console.error("Error fetching category stats:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      // 統計每個分類的資料
      const categoryMap = new Map()

      papers?.forEach(paper => {
        const category = paper.category || "其他"
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            count: 0,
            views: 0,
            trending: 0,
            recentCount: 0
          })
        }

        const stats = categoryMap.get(category)
        stats.count++
        stats.views += paper.views || 0
        if (paper.trending) stats.trending++

        // 計算最近 30 天的論文數量
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        if (new Date(paper.created_at) > thirtyDaysAgo) {
          stats.recentCount++
        }
      })

      // 轉換為陣列並排序
      const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        id: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: category,
        count: stats.count,
        views: stats.views,
        trending: stats.trending,
        recentCount: stats.recentCount
      })).sort((a, b) => b.count - a.count)

      console.log("Category stats calculated:", categoryStats)
      return categoryStats
    } catch (error) {
      console.error("Error in getCategoryStats:", error)
      throw error
    }
  }

  // 收藏相關操作
  async getUserFavorites(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_favorites")
        .select(`
          *,
          papers (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error in getUserFavorites:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserFavorites:", error)
      throw error
    }
  }

  async toggleFavorite(userId: string, paperId: string) {
    try {
      // 檢查是否已收藏
      const { data: existing } = await this.supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("paper_id", paperId)
        .single()

      if (existing) {
        // 取消收藏
        const { error } = await this.supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("paper_id", paperId)

        if (error) {
          console.error("Supabase error removing favorite:", error)
          throw new Error(`Database error: ${error.message}`)
        }
        return false // 表示已取消收藏
      } else {
        // 添加收藏
        const { error } = await this.supabase.from("user_favorites").insert({ user_id: userId, paper_id: paperId })

        if (error) {
          console.error("Supabase error adding favorite:", error)
          throw new Error(`Database error: ${error.message}`)
        }
        return true // 表示已添加收藏
      }
    } catch (error) {
      console.error("Error in toggleFavorite:", error)
      throw error
    }
  }

  async isPaperFavorited(userId: string, paperId: string) {
    try {
      const { data } = await this.supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("paper_id", paperId)
        .single()

      return !!data
    } catch (error) {
      console.error("Error in isPaperFavorited:", error)
      return false
    }
  }

  // 收藏/按讚相關操作
  async isPaperLikedByUser(paperId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("paper_likes")
        .select("id")
        .eq("paper_id", paperId)
        .eq("user_id", userId)
        .single()
      if (error && error.code !== "PGRST116") throw error
      return !!data
    } catch (error) {
      console.error("Error in isPaperLikedByUser:", error)
      return false
    }
  }

  async togglePaperLike(paperId: string, userId: string) {
    try {
      const { data, error } = await this.supabase.rpc("toggle_paper_like", {
        p_paper_id: paperId,
        p_user_id: userId,
      })
      if (error) throw new Error(`Database error: ${error.message}`)
      return data
    } catch (error) {
      console.error("Error in togglePaperLike:", error)
      throw error
    }
  }

  // 評論相關操作
  async getComments(paperId: string) {
    try {
      const { data, error } = await this.supabase
        .from("comments")
        .select(
          `
          *,
          users ( name, avatar_url ),
          replies:comments (
            *,
            users ( name, avatar_url )
          )
        `,
        )
        .eq("paper_id", paperId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })

      if (error) throw new Error(`Database error: ${error.message}`)
      return data || []
    } catch (error) {
      console.error("Error in getComments:", error)
      throw error
    }
  }

  async getCommentById(commentId: string) {
    const { data, error } = await this.supabase.from('comments').select('*, user_id').eq('id', commentId).single()
    if (error) {
      console.error('Error fetching comment by id', error)
      return null
    }
    return data
  }

  async createComment(comment: Database["public"]["Tables"]["comments"]["Insert"]) {
    const { data, error } = await this.supabase.from("comments").insert(comment).select(`*, users (name, avatar_url)`).single()
    if (error) throw new Error(`Database error: ${error.message}`)
    return data
  }

  async toggleCommentLike(commentId: string, userId: string) {
    const { data, error } = await this.supabase.rpc("toggle_comment_like", { p_comment_id: commentId, p_user_id: userId })
    if (error) throw new Error(`Database error: ${error.message}`)
    return data
  }

  async getCommentLikesForUser(commentIds: string[], userId: string): Promise<string[]> {
    if (commentIds.length === 0) return []
    const { data, error } = await this.supabase.from("comment_likes").select("comment_id").eq("user_id", userId).in("comment_id", commentIds)
    if (error) return []
    return data.map(like => like.comment_id)
  }

  // 通知相關操作
  async createNotification(notification: Database["public"]["Tables"]["notifications"]["Insert"]) {
    const { error } = await this.supabase.from('notifications').insert(notification)
    if (error) console.error('Error creating notification', error)
  }

  async getNotifications(userId: string) {
    const { data, error } = await this.supabase
      .from("notifications")
      .select(
        `
        id, type, is_read, created_at, related_paper_id, related_comment_id,
        triggering_user:users!triggering_user_id (name),
        paper:papers (title)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) {
      console.error("Error fetching notifications", error)
      return []
    }
    return data || []
  }

  async markNotificationsAsRead(notificationIds: string[], userId: string) {
    const { error } = await this.supabase.from('notifications').update({ is_read: true }).in('id', notificationIds).eq('user_id', userId)
    if (error) console.error('Error marking notifications as read', error)
    return { success: !error }
  }

  // 播放歷史
  async updatePlayHistory(userId: string, paperId: string, positionSeconds: number, completed = false) {
    try {
      const { error } = await this.supabase.from("play_history").upsert({
        user_id: userId,
        paper_id: paperId,
        position_seconds: positionSeconds,
        completed,
      })

      if (error) {
        console.error("Supabase error in updatePlayHistory:", error)
        // Don't throw error for play history failures
      }
    } catch (error) {
      console.error("Error in updatePlayHistory:", error)
      // Don't throw error for play history failures
    }
  }

  async getPlayHistory(userId: string, paperId: string) {
    try {
      const { data, error } = await this.supabase
        .from("play_history")
        .select("*")
        .eq("user_id", userId)
        .eq("paper_id", paperId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error in getPlayHistory:", error)
      }

      return data
    } catch (error) {
      console.error("Error in getPlayHistory:", error)
      return null
    }
  }

  // 待上傳文件管理
  async createPendingUpload(upload: PendingUploadInsert) {
    try {
      const { data, error } = await this.supabase
        .from("pending_uploads")
        .insert(upload)
        .select()
        .single()

      if (error) {
        console.error("Supabase error in createPendingUpload:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in createPendingUpload:", error)
      throw error
    }
  }

  async getPendingUploads(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("pending_uploads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error in getPendingUploads:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getPendingUploads:", error)
      throw error
    }
  }

  async getAllPendingUploads(options?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed'
    limit?: number
    offset?: number
  }) {
    try {
      let query = this.supabase
        .from("pending_uploads")
        .select(`
          *,
          users!inner(name, email)
        `)

      if (options?.status) {
        query = query.eq("status", options.status)
      }

      query = query.order("priority", { ascending: false })
        .order("created_at", { ascending: true })

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase error in getAllPendingUploads:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error("Error in getAllPendingUploads:", error)
      throw error
    }
  }

  async updatePendingUpload(id: string, updates: Partial<PendingUpload>) {
    try {
      const { data, error } = await this.supabase
        .from("pending_uploads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase error in updatePendingUpload:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error in updatePendingUpload:", error)
      throw error
    }
  }

  async deletePendingUpload(id: string) {
    try {
      const { error } = await this.supabase
        .from("pending_uploads")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Supabase error in deletePendingUpload:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Error in deletePendingUpload:", error)
      throw error
    }
  }
}

export const db = new DatabaseService()
