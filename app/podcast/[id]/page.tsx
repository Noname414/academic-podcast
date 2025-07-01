"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PodcastPlayer } from "@/components/podcast-player"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Share2,
  BookOpen,
  MessageSquare,
  Heart,
  ExternalLink,
  Users,
  Eye,
  ThumbsUp,
  Flag,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { usePaper, usePapers } from "@/hooks/use-papers"

interface PodcastDetailProps {
  params: Promise<{
    id: string
  }>
}

export default function PodcastDetail({ params }: PodcastDetailProps) {
  const resolvedParams = use(params)
  const [isLiked, setIsLiked] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "李研究員",
      avatar: "/placeholder-avatar.jpg",
      content: "這篇論文的方法論很有創新性，特別是在處理低資源語言方面的技術突破。",
      timestamp: "2小時前",
      likes: 12,
      replies: 3,
    },
    {
      id: 2,
      author: "王教授",
      avatar: "/placeholder-avatar.jpg",
      content: "播客的解釋很清楚，讓我對這個領域有了更深入的理解。希望能有更多類似的內容。",
      timestamp: "5小時前",
      likes: 8,
      replies: 1,
    },
  ])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { toast } = useToast()

  // 使用真實的資料庫資料
  const { paper, loading, error } = usePaper(resolvedParams.id)
  const { papers: relatedPapers } = usePapers({
    category: paper?.category,
    limit: 3,
  })

  useEffect(() => {
    // 模擬檢查登入狀態
    setIsLoggedIn(Math.random() > 0.5)
  }, [])

  const toggleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "已取消收藏" : "已加入收藏",
      description: isLiked ? "已從收藏列表中移除" : "已添加到您的收藏列表",
    })
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

  const submitComment = () => {
    if (!comment.trim()) return

    const newComment = {
      id: comments.length + 1,
      author: "我",
      avatar: "/placeholder-avatar.jpg",
      content: comment,
      timestamp: "剛剛",
      likes: 0,
      replies: 0,
    }

    setComments([newComment, ...comments])
    setComment("")

    toast({
      title: "評論已發布",
      description: "您的評論已成功發布",
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
              <Badge variant="outline">{paper.category.toUpperCase()}</Badge>
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
            <Button variant="outline" onClick={toggleLike} className="flex items-center gap-2">
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {paper.likes + (isLiked ? 1 : 0)}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    討論區 ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoggedIn ? (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="分享您對這篇論文的看法..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button onClick={submitComment} disabled={!comment.trim()}>
                          發布評論
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">登入後參與討論</p>
                      <Button onClick={() => setIsLoggedIn(true)}>登入 / 註冊</Button>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.author}</span>
                            <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              回覆 ({comment.replies})
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Flag className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                <span className="font-semibold">{comments.length}</span>
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
