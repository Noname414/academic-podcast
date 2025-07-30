"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PodcastList } from "@/components/podcast-list"
import { SearchFilters } from "@/components/search-filters"
import { ArrowLeft, Play, Clock, Eye, TrendingUp, Headphones } from "lucide-react"
import Link from "next/link"
import { getCategoryDisplayName } from "@/lib/utils"

type TopicStats = {
    id: string
    name: string
    count: number
    views: number
    trending: number
    recentCount: number
}

type Paper = {
    id: string
    title: string
    authors: string[]
    category: string
    summary: string | null
    duration_seconds: number
    views: number
    likes: number
    trending: boolean
    created_at: string
    audio_url: string | null
}

export default function TopicPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const category = params.category as string

    const [topicStats, setTopicStats] = useState<TopicStats | null>(null)
    const [papers, setPapers] = useState<Paper[]>([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<"created_at" | "views" | "likes">("created_at")

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                // 獲取主題統計
                const statsResponse = await fetch("/api/topics")
                const allStats = await statsResponse.json()
                const currentTopicStats = allStats.find((topic: TopicStats) =>
                    topic.id === category || topic.name.toLowerCase() === decodeURIComponent(category).toLowerCase()
                )
                setTopicStats(currentTopicStats)

                // 獲取該分類的論文
                const papersResponse = await fetch(
                    `/api/papers?category=${encodeURIComponent(currentTopicStats?.name || category)}&sortBy=${sortBy}&limit=50`
                )
                const papersData = await papersResponse.json()
                setPapers(papersData)
            } catch (error) {
                console.error("Error fetching topic data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [category, sortBy])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!topicStats) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">主題未找到</h1>
                    <p className="text-muted-foreground">抱歉，找不到此主題的相關內容。</p>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回首頁
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours} 小時 ${minutes} 分鐘`
        }
        return `${minutes} 分鐘`
    }

    const totalDuration = papers.reduce((sum, paper) => sum + paper.duration_seconds, 0)
    const totalViews = papers.reduce((sum, paper) => sum + paper.views, 0)

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* 返回按鈕 */}
            <Link href="/">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回首頁
                </Button>
            </Link>

            {/* 主題標題和統計 */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{getCategoryDisplayName(topicStats.name)}</h1>
                    <p className="text-lg text-muted-foreground">
                        探索 {getCategoryDisplayName(topicStats.name)} 領域的最新研究和深度討論
                    </p>
                </div>

                {/* 統計卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Headphones className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-2xl font-bold">{topicStats.count}</div>
                            <div className="text-sm text-muted-foreground">集數</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Eye className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">總觀看</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-2xl font-bold">{Math.round(totalDuration / 3600)}</div>
                            <div className="text-sm text-muted-foreground">總時長(小時)</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-2xl font-bold">{topicStats.recentCount}</div>
                            <div className="text-sm text-muted-foreground">本月新增</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 內容標籤頁 */}
            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="all">全部內容</TabsTrigger>
                        <TabsTrigger value="trending">熱門推薦</TabsTrigger>
                        <TabsTrigger value="recent">最新更新</TabsTrigger>
                    </TabsList>

                    {/* 排序選項 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">排序：</span>
                        <Button
                            variant={sortBy === "created_at" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("created_at")}
                        >
                            最新
                        </Button>
                        <Button
                            variant={sortBy === "views" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("views")}
                        >
                            觀看數
                        </Button>
                        <Button
                            variant={sortBy === "likes" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("likes")}
                        >
                            喜歡數
                        </Button>
                    </div>
                </div>

                <TabsContent value="all" className="space-y-6">
                    <PodcastList category={topicStats.name} />
                </TabsContent>

                <TabsContent value="trending" className="space-y-6">
                    <div className="space-y-4">
                        {papers.filter(paper => paper.trending).map((paper) => (
                            <Card key={paper.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Play Button Section */}
                                    <div className="flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 lg:w-32">
                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-16 w-16 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group-hover:scale-110"
                                            >
                                                <Play className="h-8 w-8 ml-1" />
                                            </Button>
                                            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">熱門</Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 min-w-0">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {getCategoryDisplayName(paper.category)}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs flex items-center">
                                                            <TrendingUp className="w-3 h-3 mr-1" />
                                                            熱門
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                                                        {paper.title}
                                                    </CardTitle>
                                                    <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                                                        <span className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {Math.round(paper.duration_seconds / 60)} 分鐘
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            {paper.views.toLocaleString()} 次觀看
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pb-3">
                                            <p className="text-muted-foreground leading-relaxed line-clamp-2">{paper.summary}</p>
                                        </CardContent>

                                        <CardFooter className="pt-4">
                                            <Button variant="outline" asChild>
                                                <Link href={`/podcast/${paper.id}`}>查看詳情</Link>
                                            </Button>
                                        </CardFooter>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {papers.filter(paper => paper.trending).length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">目前沒有熱門推薦內容</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-6">
                    <div className="space-y-4">
                        {papers
                            .filter(paper => {
                                const thirtyDaysAgo = new Date()
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                                return new Date(paper.created_at) > thirtyDaysAgo
                            })
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((paper) => (
                                <Card key={paper.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Play Button Section */}
                                        <div className="flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 lg:w-32">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-16 w-16 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group-hover:scale-110"
                                            >
                                                <Play className="h-8 w-8 ml-1" />
                                            </Button>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 min-w-0">
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {getCategoryDisplayName(paper.category)}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-xs">
                                                                最新
                                                            </Badge>
                                                        </div>
                                                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                                                            {paper.title}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {Math.round(paper.duration_seconds / 60)} 分鐘
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                {paper.views.toLocaleString()} 次觀看
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pb-3">
                                                <p className="text-muted-foreground leading-relaxed line-clamp-2">{paper.summary}</p>
                                            </CardContent>

                                            <CardFooter className="pt-4">
                                                <Button variant="outline" asChild>
                                                    <Link href={`/podcast/${paper.id}`}>查看詳情</Link>
                                                </Button>
                                            </CardFooter>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        {papers.filter(paper => {
                            const thirtyDaysAgo = new Date()
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                            return new Date(paper.created_at) > thirtyDaysAgo
                        }).length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">最近沒有新增內容</p>
                                </div>
                            )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 