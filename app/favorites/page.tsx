"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Heart, Play, ArrowLeft, Search, Calendar, Clock, Trash2 } from 'lucide-react'

interface FavoritePaper {
    id: string
    paper_id: string
    created_at: string
    papers: {
        id: string
        title: string
        authors: string[]
        journal: string | null
        publish_date: string | null
        duration_seconds: number
        audio_url: string | null
        category: string
    }
}

export default function FavoritesPage() {
    const { user, loading } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const [favorites, setFavorites] = useState<FavoritePaper[]>([])
    const [filteredFavorites, setFilteredFavorites] = useState<FavoritePaper[]>([])
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        if (user) {
            fetchFavorites()
        }
    }, [user, loading, router])

    useEffect(() => {
        // 根據搜索查詢過濾收藏
        if (searchQuery.trim()) {
            const filtered = favorites.filter(favorite =>
                favorite.papers.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                favorite.papers.authors.some(author =>
                    author.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                favorite.papers.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredFavorites(filtered)
        } else {
            setFilteredFavorites(favorites)
        }
    }, [favorites, searchQuery])

    const fetchFavorites = async () => {
        if (!user) return

        try {
            setIsLoadingFavorites(true)
            const response = await fetch(`/api/favorites?userId=${user.id}`)
            const data = await response.json()

            if (response.ok) {
                setFavorites(data.favorites || [])
            } else {
                toast({
                    title: "載入失敗",
                    description: data.error || "無法載入收藏列表",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "載入失敗",
                description: "請檢查網路連接後重試",
                variant: "destructive"
            })
        } finally {
            setIsLoadingFavorites(false)
        }
    }

    const handleRemoveFavorite = async (paperId: string) => {
        if (!user) return

        setRemovingIds(prev => new Set(prev).add(paperId))

        try {
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    paperId: paperId
                })
            })

            const data = await response.json()

            if (response.ok) {
                setFavorites(prev => prev.filter(fav => fav.papers.id !== paperId))
                toast({
                    title: "已取消收藏",
                    description: "已從收藏列表中移除"
                })
            } else {
                toast({
                    title: "操作失敗",
                    description: data.error || "取消收藏失敗",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "操作失敗",
                description: "請稍後再試",
                variant: "destructive"
            })
        } finally {
            setRemovingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(paperId)
                return newSet
            })
        }
    }

    const handlePlayPodcast = (paperId: string) => {
        router.push(`/podcast/${paperId}`)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) {
            return `${minutes} 分鐘`
        }
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours} 小時 ${remainingMinutes} 分鐘`
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-full max-w-sm" />
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
                {/* 標題和返回按鈕 */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Heart className="h-8 w-8 text-red-500" />
                            我的收藏
                        </h1>
                        <p className="text-muted-foreground">
                            您收藏的學術播客 ({filteredFavorites.length} 個)
                        </p>
                    </div>
                </div>

                {/* 搜索欄 */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索收藏的播客..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* 收藏列表 */}
                {isLoadingFavorites ? (
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : filteredFavorites.length === 0 ? (
                    <Card className="text-center p-12">
                        <div className="space-y-4">
                            <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {searchQuery ? '沒有找到相關收藏' : '還沒有收藏任何播客'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? '嘗試使用不同的關鍵字搜索'
                                        : '開始探索學術播客，將有趣的內容加入收藏吧！'
                                    }
                                </p>
                            </div>
                            {!searchQuery && (
                                <Button onClick={() => router.push('/')} className="gap-2">
                                    探索播客
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredFavorites.map((favorite) => (
                            <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            {/* 標題和類別 */}
                                            <div>
                                                <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                                                    {favorite.papers.title}
                                                </h3>
                                                <Badge variant="secondary" className="mb-2">
                                                    {favorite.papers.category}
                                                </Badge>
                                            </div>

                                            {/* 作者 */}
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-medium">作者：</span>
                                                {favorite.papers.authors.join(', ')}
                                            </div>

                                            {/* 期刊和發布日期 */}
                                            {favorite.papers.journal && (
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-medium">期刊：</span>
                                                    {favorite.papers.journal}
                                                </div>
                                            )}

                                            {/* 底部信息 */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDuration(favorite.papers.duration_seconds)}
                                                </div>
                                                {favorite.papers.publish_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(favorite.papers.publish_date)}
                                                    </div>
                                                )}
                                                <div className="text-xs">
                                                    收藏於 {formatDate(favorite.created_at)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 操作按鈕 */}
                                        <div className="flex flex-col gap-2 min-w-[100px]">
                                            <Button
                                                size="sm"
                                                onClick={() => handlePlayPodcast(favorite.papers.id)}
                                                className="gap-2"
                                                disabled={!favorite.papers.audio_url}
                                            >
                                                <Play className="h-4 w-4" />
                                                播放
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveFavorite(favorite.papers.id)}
                                                disabled={removingIds.has(favorite.papers.id)}
                                                className="gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {removingIds.has(favorite.papers.id) ? '移除中...' : '移除'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 