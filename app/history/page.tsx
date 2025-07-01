"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { History, Play, ArrowLeft, Search, Calendar, Clock, Trash2, CheckCircle } from 'lucide-react'

interface PlayHistoryItem {
    id: string
    position_seconds: number
    completed: boolean
    created_at: string
    updated_at: string
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

export default function HistoryPage() {
    const { user, loading } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const [history, setHistory] = useState<PlayHistoryItem[]>([])
    const [filteredHistory, setFilteredHistory] = useState<PlayHistoryItem[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        if (user) {
            fetchHistory()
        }
    }, [user, loading, router])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = history.filter(item =>
                item.papers.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.papers.authors.some(author =>
                    author.toLowerCase().includes(searchQuery.toLowerCase())
                ) ||
                item.papers.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredHistory(filtered)
        } else {
            setFilteredHistory(history)
        }
    }, [history, searchQuery])

    const fetchHistory = async () => {
        if (!user) return

        try {
            setIsLoadingHistory(true)
            const response = await fetch(`/api/history?userId=${user.id}`)
            const data = await response.json()

            if (response.ok) {
                setHistory(data.history || [])
            } else {
                toast({
                    title: "載入失敗",
                    description: data.error || "無法載入播放歷史",
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
            setIsLoadingHistory(false)
        }
    }

    const handleRemoveHistory = async (paperId: string) => {
        if (!user) return

        setRemovingIds(prev => new Set(prev).add(paperId))

        try {
            const response = await fetch('/api/history', {
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
                setHistory(prev => prev.filter(item => item.papers.id !== paperId))
                toast({
                    title: "已刪除記錄",
                    description: "播放記錄已移除"
                })
            } else {
                toast({
                    title: "操作失敗",
                    description: data.error || "刪除記錄失敗",
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

    const handleClearAllHistory = async () => {
        if (!user) return

        try {
            const response = await fetch('/api/history', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id
                })
            })

            const data = await response.json()

            if (response.ok) {
                setHistory([])
                toast({
                    title: "已清除所有記錄",
                    description: "所有播放記錄已清除"
                })
            } else {
                toast({
                    title: "操作失敗",
                    description: data.error || "清除記錄失敗",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "操作失敗",
                description: "請稍後再試",
                variant: "destructive"
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

    const getProgressPercentage = (position: number, total: number) => {
        return Math.round((position / total) * 100)
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
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <History className="h-8 w-8 text-blue-500" />
                            播放歷史
                        </h1>
                        <p className="text-muted-foreground">
                            您的播放記錄 ({filteredHistory.length} 個)
                        </p>
                    </div>
                    {history.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleClearAllHistory}
                            className="gap-2 text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            清除所有記錄
                        </Button>
                    )}
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索播放記錄..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {isLoadingHistory ? (
                    <div className="grid gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <Card className="text-center p-12">
                        <div className="space-y-4">
                            <History className="h-16 w-16 text-muted-foreground mx-auto" />
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {searchQuery ? '沒有找到相關記錄' : '還沒有播放記錄'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? '嘗試使用不同的關鍵字搜索'
                                        : '開始聆聽播客，您的播放記錄會顯示在這裡'
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
                        {filteredHistory.map((item) => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                                                        {item.papers.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary">
                                                            {item.papers.category}
                                                        </Badge>
                                                        {item.completed && (
                                                            <Badge variant="default" className="gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                已完成
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-medium">作者：</span>
                                                {item.papers.authors.join(', ')}
                                            </div>

                                            {item.papers.journal && (
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-medium">期刊：</span>
                                                    {item.papers.journal}
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>播放進度</span>
                                                    <span>
                                                        {formatDuration(item.position_seconds)} / {formatDuration(item.papers.duration_seconds)}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={getProgressPercentage(item.position_seconds, item.papers.duration_seconds)}
                                                    className="h-2"
                                                />
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDuration(item.papers.duration_seconds)}
                                                </div>
                                                {item.papers.publish_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(item.papers.publish_date)}
                                                    </div>
                                                )}
                                                <div className="text-xs">
                                                    最後播放：{formatDate(item.updated_at)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[100px]">
                                            <Button
                                                size="sm"
                                                onClick={() => handlePlayPodcast(item.papers.id)}
                                                className="gap-2"
                                                disabled={!item.papers.audio_url}
                                            >
                                                <Play className="h-4 w-4" />
                                                {item.completed ? '重新播放' : '繼續播放'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveHistory(item.papers.id)}
                                                disabled={removingIds.has(item.papers.id)}
                                                className="gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {removingIds.has(item.papers.id) ? '刪除中...' : '刪除'}
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