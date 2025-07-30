"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Clock,
  Eye,
  Heart,
  Share2,
  Calendar,
  Users,
  BookOpen,
  Download,
  MessageSquare
} from "lucide-react"
import { CommentSection } from "@/components/comment-section"
import { usePapers } from "@/hooks/use-papers"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getCategoryDisplayName } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PodcastPlayer } from "@/components/podcast-player"

interface PodcastDetailProps {
  params: Promise<{
    id: string
  }>
}

export default function PodcastDetail({ params }: PodcastDetailProps) {
  const resolvedParams = use(params)
  const [isLiked, setIsLiked] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // 使用真實的資料庫資料
  const { paper, loading, error, setLikeStatus, refetch } = usePaper(resolvedParams.id)
  const { papers: relatedPapers } = usePapers({
    category: paper?.category,
    limit: 3,
  })

  const toggleLike = async () => {
    if (!paper) return
    if (!user) {
      toast({
        title: "需要登入",
        description: "請先登入才能按讚。",
        variant: "destructive"
      })
      return
    }

    const originalLikeStatus = paper.is_liked_by_user ?? false
    const originalLikesCount = paper.likes

    // Optimistic update
    setLikeStatus(!originalLikeStatus)

    try {
      const response = await fetch(`/api/papers/${paper.id}/like`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 501 && errorData.sql) {
          toast({
            title: "資料庫功能尚未建立",
            description: (
              <div className="space-y-2">
                <p>{errorData.message}</p>
                <p className="font-semibold">請在 Supabase SQL Editor 中執行以下指令碼來修復:</p>
                <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 text-xs text-white overflow-auto">
                  <code>{errorData.sql}</code>
                </pre>
              </div>
            ),
            duration: 20000, // Show for longer
            variant: "destructive",
          })
        } else {
          throw new Error(errorData.message || "按讚失敗")
        }
      }
    } catch (e) {
      // Revert on error
      setLikeStatus(originalLikeStatus)
      toast({
        title: "發生錯誤",
        description: e instanceof Error ? e.message : "無法完成操作，請稍後再試。",
        variant: "destructive"
      })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "連結已複製",
      description: "播客連結已複製到剪貼板",
    })
  }

  const handleDownload = () => {
    toast({
      title: "開始下載",
      description: "音頻文件下載已開始",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold">找不到播客</h2>
          <p className="text-muted-foreground">抱歉，我們找不到您要查看的播客。</p>
          <Button asChild>
            <Link href="/">返回首頁</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-muted">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{getCategoryDisplayName(paper.category)}</Badge>
              {paper.trending && <Badge>熱門</Badge>}
              <Badge variant="secondary" className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {paper.views.toLocaleString()}
              </Badge>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{paper.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {new Date(paper.created_at).toLocaleDateString("zh-TW")}
              </span>
              <span className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {Math.round(paper.duration_seconds / 60)} 分鐘
              </span>
              <span className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {paper.authors.join(", ")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {paper.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={toggleLike} className="flex items-center gap-2" disabled={!paper}>
              <Heart className={`h-4 w-4 ${paper?.is_liked_by_user ? "fill-red-500 text-red-500" : ""}`} />
              {paper?.likes ?? 0}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              下載音檔
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Audio Player */}
          <Card className="border-2">
            <CardContent className="p-6">
              <PodcastPlayer
                id={paper.id}
                audioUrl={paper.audio_url || "/sample-podcast.mp3"}
                title={paper.title}
                authors={paper.authors.join(", ")}
                journal={paper.journal || undefined}
                publishDate={paper.publish_date || undefined}
                duration={paper.duration_seconds}
                arxivUrl={paper.arxiv_url}
                pdfUrl={paper.pdf_url}
              />
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">論文摘要</TabsTrigger>
              <TabsTrigger value="transcript">完整內容</TabsTrigger>
              <TabsTrigger value="comments">討論區</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      論文摘要
                    </CardTitle>
                    {paper.journal && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={
                            paper.arxiv_url && paper.arxiv_url !== "https://arxiv.org/search/"
                              ? paper.arxiv_url
                              : paper.pdf_url && paper.pdf_url !== "https://arxiv.org/pdf/"
                                ? paper.pdf_url
                                : `https://scholar.google.com/scholar?q=${encodeURIComponent(`${paper.title} ${paper.authors.join(" ")}`)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          查看原始論文
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">作者</h3>
                    <p className="text-muted-foreground">{paper.authors.join(", ")}</p>
                  </div>

                  {paper.journal && (
                    <div>
                      <h3 className="font-semibold mb-2">發表於</h3>
                      <p className="text-muted-foreground">
                        {paper.journal} ({paper.publish_date})
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">研究摘要</h3>
                    <p className="text-muted-foreground leading-relaxed">{paper.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>完整論文內容</CardTitle>
                  <CardDescription>詳細的研究方法、發現和結論</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="whitespace-pre-line leading-relaxed">{paper.full_text || paper.summary}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <CommentSection paperId={paper.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Papers */}
          <Card>
            <CardHeader>
              <CardTitle>相關論文</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedPapers
                .filter((p) => p.id !== paper.id)
                .slice(0, 3)
                .map((relatedPaper) => (
                  <div key={relatedPaper.id} className="group">
                    <Link
                      href={`/podcast/${relatedPaper.id}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium group-hover:text-primary transition-colors mb-1">
                        {relatedPaper.title}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {relatedPaper.views.toLocaleString()} 次觀看
                      </p>
                    </Link>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Subscribe */}
          <Card>
            <CardHeader>
              <CardTitle>訂閱更新</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">訂閱我們的播客，獲取最新學術論文更新。</p>
              <div className="space-y-2">
                <Button className="w-full">訂閱 RSS</Button>
                <Button variant="outline" className="w-full">
                  電子報訂閱
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>播客統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">總觀看次數</span>
                <span className="font-semibold">{paper.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">收藏次數</span>
                <span className="font-semibold">{paper.likes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">評論數量</span>
                <span className="font-semibold">{/* This will now be handled inside CommentSection */}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">播放時長</span>
                <span className="font-semibold">{Math.round(paper.duration_seconds / 60)} 分鐘</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
