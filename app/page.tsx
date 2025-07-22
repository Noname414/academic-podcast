"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PodcastPlayer } from "@/components/podcast-player"
import { FeaturedTopics } from "@/components/featured-topics"
import { PodcastList } from "@/components/podcast-list"
import { SearchFilters } from "@/components/search-filters"
import { StatsSection } from "@/components/stats-section"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Search, TrendingUp, Clock, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePapers } from "@/hooks/use-papers"
import { useSearchParams } from "next/navigation"
import { AuthDialog } from "@/components/auth-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface FilterState {
  category?: string
  tags: string[]
  durationRange: [number, number]
  dateRange?: Date
}

export default function Home() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [showAuthAlert, setShowAuthAlert] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    durationRange: [0, 60],
  })

  // 從URL參數獲取初始值
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const searchParam = searchParams.get("search")

    const category = categoryParam || "all"
    const search = searchParam || ""

    setSelectedCategory(category)
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  // 處理篩選器變化 - 使用 useCallback 避免無限重新渲染
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters((prev: FilterState) => {
      // 只有在實際變化時才更新，避免不必要的重新渲染
      if (JSON.stringify(prev) !== JSON.stringify(newFilters)) {
        return newFilters
      }
      return prev
    })
  }, [])

  // 獲取最新的論文作為特色播客
  const { papers: latestPapers, loading: latestLoading } = usePapers({
    sortBy: "created_at",
    limit: 1,
  })

  const latestPaper = latestPapers?.[0]

  useEffect(() => {
    // 檢查是否因為需要認證而被重定向回來
    const authRequired = searchParams?.get('auth')
    if (authRequired === 'required' && !user) {
      setShowAuthAlert(true)
    }
  }, [searchParams, user])

  useEffect(() => {
    // 如果用戶已登錄，隱藏認證提示
    if (user) {
      setShowAuthAlert(false)
    }
  }, [user])

  if (latestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* 認證提示 */}
        {showAuthAlert && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-orange-800 dark:text-orange-200">
                您需要登錄才能訪問該功能。請先登錄或註冊帳戶。
              </span>
              <div className="flex items-center gap-2">
                <AuthDialog>
                  <Button variant="outline" size="sm">
                    立即登錄
                  </Button>
                </AuthDialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section with Gradient Background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 mr-2" />
                全新 AI 驅動的學術播客平台
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in-up">
                AI 論文播客
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up animation-delay-200">
                自動化學術播客平台，為你摘要並朗讀最前沿的 AI 論文
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                <Button size="lg" className="text-lg px-8 py-3" onClick={() => {
                  const element = document.getElementById('podcast-list');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  開始收聽
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3" onClick={() => {
                  const element = document.getElementById('featured-topics');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  瀏覽論文
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Latest Podcast */}
        {latestPaper && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">最新一集</h2>
                <p className="text-muted-foreground">收聽最新發布的學術論文播客</p>
              </div>
              <Badge variant="secondary" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {latestPaper.trending ? "熱門" : "最新"}
              </Badge>
            </div>

            <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-1">
                <CardHeader className="bg-background rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{latestPaper.title}</CardTitle>
                      <CardDescription className="flex items-center text-base">
                        <Clock className="w-4 h-4 mr-1" />
                        發布於 {new Date(latestPaper.created_at).toLocaleDateString("zh-TW")} •
                        {Math.round(latestPaper.duration_seconds / 60)} 分鐘 •
                        <Users className="w-4 h-4 ml-2 mr-1" />
                        {latestPaper.views.toLocaleString()} 次收聽
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {latestPaper.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-background">
                  <PodcastPlayer
                    id={latestPaper.id}
                    audioUrl={latestPaper.audio_url || "/sample-podcast.mp3"}
                    title={latestPaper.title}
                    authors={latestPaper.authors.join(", ")}
                    journal={latestPaper.journal ?? undefined}
                    publishDate={latestPaper.publish_date ?? undefined}
                    duration={latestPaper.duration_seconds}
                    isLatest={true}
                    arxivUrl={latestPaper.arxiv_url}
                    pdfUrl={latestPaper.pdf_url}
                  />
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium mb-2">論文摘要</h3>
                    <p className="text-muted-foreground leading-relaxed">{latestPaper.summary}</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary" asChild>
                      <Link href={`/podcast/${latestPaper.id}`}>展開全文 →</Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-background rounded-b-lg flex justify-between">
                  <Button
                    variant="outline"
                    asChild
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Link href={`/podcast/${latestPaper.id}`}>查看詳情</Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      下載音檔
                    </Button>
                    <Button variant="outline" size="sm">
                      分享
                    </Button>
                    <Button variant="outline" size="sm">
                      收藏
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </Card>
          </section>
        )}

        {/* Featured Topics */}
        <section id="featured-topics" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">精選主題</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              探索不同領域的前沿研究，從自然語言處理到醫療AI，涵蓋最新的學術進展
            </p>
          </div>
          <FeaturedTopics />
        </section>

        {/* Search and Browse */}
        <section id="podcast-list" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">瀏覽播客</h2>
            <p className="text-muted-foreground">搜尋和篩選您感興趣的學術論文播客</p>
          </div>

          {/* Enhanced Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜尋論文標題、作者或關鍵字..."
                className="pl-12 pr-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  清除
                </Button>
              )}
            </div>
            <SearchFilters
              onCategoryChange={setSelectedCategory}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                全部
              </TabsTrigger>
              <TabsTrigger value="nlp">NLP</TabsTrigger>
              <TabsTrigger value="cv">電腦視覺</TabsTrigger>
              <TabsTrigger value="rl">強化學習</TabsTrigger>
              <TabsTrigger value="theory">理論</TabsTrigger>
              <TabsTrigger value="medical">醫療AI</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="all" filters={filters} />
            </TabsContent>
            <TabsContent value="nlp" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="nlp" filters={filters} />
            </TabsContent>
            <TabsContent value="cv" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="cv" filters={filters} />
            </TabsContent>
            <TabsContent value="rl" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="rl" filters={filters} />
            </TabsContent>
            <TabsContent value="theory" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="theory" filters={filters} />
            </TabsContent>
            <TabsContent value="medical" className="mt-6">
              <PodcastList searchQuery={searchQuery} category="medical" filters={filters} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </main>
    </div>
  )
}
