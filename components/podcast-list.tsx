"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Play, Pause, Calendar, Clock, Heart, Download, Share2, TrendingUp, Users, Eye } from "lucide-react"
import { usePapers } from "@/hooks/use-papers"
import { useToast } from "@/hooks/use-toast"

interface FilterState {
  category?: string
  tags: string[]
  durationRange: [number, number]
  dateRange?: Date
}

interface PodcastListProps {
  category?: string
  searchQuery?: string
  filters?: FilterState
}

export function PodcastList({ category = "all", searchQuery = "", filters }: PodcastListProps) {
  const [sortBy, setSortBy] = useState<"created_at" | "views" | "likes">("created_at")
  const [likedPodcasts, setLikedPodcasts] = useState<Set<string>>(new Set())
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const { papers: rawPapers, loading, error } = usePapers({
    category: category === "all" ? undefined : category,
    search: searchQuery || undefined,
    sortBy,
    limit: 20,
  })

  // 客戶端篩選
  const papers = useMemo(() => {
    if (!filters) return rawPapers

    return rawPapers.filter((paper) => {
      // 標籤篩選
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag =>
          paper.tags.some(paperTag => paperTag.includes(tag))
        )
        if (!hasMatchingTag) return false
      }

      // 時長篩選
      const durationInMinutes = paper.duration_seconds / 60
      if (durationInMinutes < filters.durationRange[0] || durationInMinutes > filters.durationRange[1]) {
        return false
      }

      // 日期篩選
      if (filters.dateRange) {
        const paperDate = new Date(paper.created_at)
        const filterDate = new Date(filters.dateRange)
        if (paperDate.toDateString() !== filterDate.toDateString()) {
          return false
        }
      }

      return true
    })
  }, [rawPapers, filters])

  const toggleLike = (paperId: string) => {
    setLikedPodcasts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(paperId)) {
        newSet.delete(paperId)
      } else {
        newSet.add(paperId)
      }
      return newSet
    })
  }

  const handlePlayToggle = async (paper: any) => {
    try {
      // 如果當前正在播放這個播客，則暫停
      if (currentlyPlaying === paper.id) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        setCurrentlyPlaying(null)
        return
      }

      // 停止當前播放的音頻
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      // 設置載入狀態
      setIsLoading(prev => new Set([...prev, paper.id]))

      // 創建新的音頻元素
      const audio = new Audio(paper.audio_url || "/sample-podcast.mp3")
      audioRef.current = audio

      // 設置音頻事件
      audio.oncanplay = () => {
        setIsLoading(prev => {
          const newSet = new Set(prev)
          newSet.delete(paper.id)
          return newSet
        })
      }

      audio.onended = () => {
        setCurrentlyPlaying(null)
      }

      audio.onerror = () => {
        setIsLoading(prev => {
          const newSet = new Set(prev)
          newSet.delete(paper.id)
          return newSet
        })
        toast({
          title: "播放錯誤",
          description: "無法播放音頻，請稍後再試",
          variant: "destructive",
        })
      }

      // 開始播放
      await audio.play()
      setCurrentlyPlaying(paper.id)
      setIsLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(paper.id)
        return newSet
      })
    } catch (error) {
      setIsLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(paper.id)
        return newSet
      })
      toast({
        title: "播放錯誤",
        description: "無法播放音頻，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (paper: any) => {
    const url = `${window.location.origin}/podcast/${paper.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: paper.title,
          text: `來聽聽這個關於「${paper.title}」的學術播客`,
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast({
          title: "連結已複製",
          description: "播客連結已複製到剪貼板",
        })
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: "連結已複製",
          description: "播客連結已複製到剪貼板",
        })
      } catch (clipboardError) {
        toast({
          title: "分享失敗",
          description: "無法分享或複製連結",
          variant: "destructive",
        })
      }
    }
  }

  const handleDownload = async (paper: any) => {
    try {
      const link = document.createElement("a")
      link.href = paper.audio_url || "/sample-podcast.mp3"
      link.download = `${paper.title}.mp3`
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "開始下載",
        description: "音頻文件下載已開始",
      })
    } catch (error) {
      toast({
        title: "下載失敗",
        description: "無法下載音頻文件，請稍後再試",
        variant: "destructive",
      })
    }
  }

  // 清理音頻資源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">載入錯誤</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">找不到相關播客</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `沒有找到包含 "${searchQuery}" 的播客` : "此分類暫無播客"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          找到 {papers.length} 個播客
          {searchQuery && ` (搜尋: "${searchQuery}")`}
        </p>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as "created_at" | "views" | "likes")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">最新發布</SelectItem>
            <SelectItem value="views">最多觀看</SelectItem>
            <SelectItem value="likes">最多喜歡</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Podcast List */}
      <div className="space-y-4">
        {papers.map((paper) => (
          <Card key={paper.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row">
              {/* Play Button Section */}
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 lg:w-32">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group-hover:scale-110"
                    onClick={() => handlePlayToggle(paper)}
                    disabled={isLoading.has(paper.id)}
                  >
                    {isLoading.has(paper.id) ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : currentlyPlaying === paper.id ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                  {paper.trending && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">熱門</Badge>
                  )}
                  {currentlyPlaying === paper.id && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <CardHeader className="pb-3">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {paper.category.toUpperCase()}
                        </Badge>
                        {paper.trending && (
                          <Badge variant="secondary" className="text-xs flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            熱門
                          </Badge>
                        )}
                        {currentlyPlaying === paper.id && (
                          <Badge variant="secondary" className="text-xs flex items-center bg-green-100 text-green-800">
                            正在播放
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {paper.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(paper.created_at).toLocaleDateString("zh-TW")}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.round(paper.duration_seconds / 60)} 分鐘
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {paper.views.toLocaleString()} 次觀看
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {paper.authors.join(", ")}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {paper.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="text-muted-foreground leading-relaxed line-clamp-2 lg:line-clamp-3">{paper.summary}</p>
                  {paper.journal && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      發表於 <span className="font-medium">{paper.journal}</span>
                    </div>
                  )}
                </CardContent>

                <Separator />

                <CardFooter className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(paper.id)}
                      className="flex items-center gap-1"
                    >
                      <Heart className={`h-4 w-4 ${likedPodcasts.has(paper.id) ? "fill-red-500 text-red-500" : ""}`} />
                      {paper.likes + (likedPodcasts.has(paper.id) ? 1 : 0)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleDownload(paper)}
                    >
                      <Download className="h-4 w-4" />
                      下載
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleShare(paper)}
                    >
                      <Share2 className="h-4 w-4" />
                      分享
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    asChild
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Link href={`/podcast/${paper.id}`}>查看詳情</Link>
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
