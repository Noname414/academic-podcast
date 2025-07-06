"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react"
import { formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface PodcastPlayerProps {
  id: string
  audioUrl: string
  title: string
  authors: string
  journal?: string
  publishDate?: string
  duration?: number
  isLatest?: boolean
  arxivUrl?: string | null
  pdfUrl?: string | null
}

export function PodcastPlayer({
  id,
  audioUrl,
  title,
  authors,
  journal,
  publishDate,
  duration = 0,
  isLatest = false,
  arxivUrl,
  pdfUrl,
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // 檢查是否已收藏
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return

      setIsCheckingFavorite(true)
      try {
        const response = await fetch(`/api/favorites?userId=${user.id}&paperId=${id}`)
        const data = await response.json()
        setIsLiked(data.isFavorited)
      } catch (error) {
        console.error("檢查收藏狀態失敗:", error)
      } finally {
        setIsCheckingFavorite(false)
      }
    }

    checkFavoriteStatus()
  }, [user, id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setTotalDuration(audio.duration)
      setIsLoading(false)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleEnded = () => setIsPlaying(false)
    
    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setIsLoading(false)
      setIsPlaying(false)
      toast({
        title: "音頻錯誤",
        description: "音頻文件載入失敗，請檢查網路連接或稍後再試",
        variant: "destructive",
      })
    }

    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      toast({
        title: "播放錯誤",
        description: "無法播放音頻，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(audio.currentTime - 15, 0)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.currentTime + 15, totalDuration)
  }

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackRate = () => {
    const audio = audioRef.current
    if (!audio) return

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]

    audio.playbackRate = nextRate
    setPlaybackRate(nextRate)

    toast({
      title: "播放速度",
      description: `已調整為 ${nextRate}x 速度`,
    })
  }

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "請先登錄",
        description: "您需要登錄才能收藏播客",
        variant: "destructive",
      })
      return
    }

    try {
      const method = isLiked ? "DELETE" : "POST"
      const response = await fetch("/api/favorites", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          paperId: id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "操作失敗")
      }

      setIsLiked(!isLiked)
      toast({
        title: isLiked ? "已取消收藏" : "已加入收藏",
        description: isLiked ? "已從收藏列表中移除" : "已添加到您的收藏列表",
      })
    } catch (error) {
      toast({
        title: "操作失敗",
        description: error instanceof Error ? error.message : "操作失敗，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `來聽聽這個關於「${title}」的學術播客`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "連結已複製",
          description: "播客連結已複製到剪貼板",
        })
      }
    } catch (error) {
      // 如果分享失敗，嘗試複製連結
      try {
        await navigator.clipboard.writeText(window.location.href)
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

  const handleDownload = async () => {
    try {
      // 檢查音頻 URL 是否有效
      if (!audioUrl || audioUrl === "/sample-podcast.mp3") {
        toast({
          title: "下載失敗",
          description: "音頻文件不可用",
          variant: "destructive",
        })
        return
      }

      // 嘗試獲取音頻文件以檢查是否可訪問
      const response = await fetch(audioUrl, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // 創建一個隱藏的下載連結
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `${title.replace(/[^\w\s-]/gi, '')}.mp3`
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "開始下載",
        description: "音頻文件下載已開始",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "下載失敗",
        description: error instanceof Error && error.message.includes('CORS') 
          ? "由於跨域限制，無法直接下載。請右鍵點擊播放器並選擇保存音頻。"
          : "無法下載音頻文件，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleViewPaper = () => {
    if (journal) {
      // 優先使用ArXiv URL，然後PDF URL，最後使用Google Scholar搜索
      let targetUrl = ""

      if (arxivUrl && arxivUrl !== "https://arxiv.org/search/") {
        targetUrl = arxivUrl
      } else if (pdfUrl && pdfUrl !== "https://arxiv.org/pdf/") {
        targetUrl = pdfUrl
      } else {
        // 回退到Google Scholar搜索
        const searchQuery = encodeURIComponent(`${title} ${authors}`)
        targetUrl = `https://scholar.google.com/scholar?q=${searchQuery}`
      }

      window.open(targetUrl, '_blank')
    } else {
      toast({
        title: "無法查看原始論文",
        description: "此播客沒有關聯的論文信息",
        variant: "destructive",
      })
    }
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Main Player Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-2 hover:border-primary transition-all duration-200"
                onClick={togglePlay}
                disabled={isLoading}
                aria-label={isLoading ? "載入中" : (isPlaying ? "暫停播放" : "開始播放")}
                aria-pressed={isPlaying}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
              {isLatest && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{title}</h3>
              <p className="text-sm text-muted-foreground truncate">{authors}</p>
              {journal && <p className="text-xs text-muted-foreground">{journal}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLike}
                  disabled={isCheckingFavorite}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? "取消收藏" : "加入收藏"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>分享</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>下載音檔</p>
              </TooltipContent>
            </Tooltip>

            {journal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleViewPaper}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>查看原始論文</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Slider
              value={[currentTime]}
              max={totalDuration || 100}
              step={1}
              onValueChange={handleTimeChange}
              className="w-full"
            />
            <Progress
              value={progress}
              className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 pointer-events-none opacity-30"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={skipBackward}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>後退 15 秒</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={changePlaybackRate}>
                    <span className="text-xs font-medium">{playbackRate}x</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>調整播放速度</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={skipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>前進 15 秒</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMuted ? "取消靜音" : "靜音"}</p>
                  </TooltipContent>
                </Tooltip>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
