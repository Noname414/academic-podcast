"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Calendar, Edit, Save, X, ArrowLeft } from 'lucide-react'

interface UserStats {
    favoritesCount: number
    playHistoryCount: number
    totalListeningTime: number
    joinedDate: string
}

export default function ProfilePage() {
    const { user, loading } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingStats, setIsLoadingStats] = useState(true)
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        if (user) {
            setFormData({
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                email: user.email || ''
            })
            fetchUserStats()
        }
    }, [user, loading, router])

    const fetchUserStats = async () => {
        if (!user) return

        try {
            setIsLoadingStats(true)

            // 獲取收藏數量
            const favoritesResponse = await fetch(`/api/favorites?userId=${user.id}`)
            const favoritesData = await favoritesResponse.json()
            const favoritesCount = favoritesData.favorites?.length || 0

            // 獲取播放歷史數量
            const historyResponse = await fetch(`/api/history?userId=${user.id}`)
            const historyData = await historyResponse.json()
            const playHistoryCount = historyData.history?.length || 0

            // 計算總收聽時間（簡化計算）
            const totalListeningTime = playHistoryCount * 20 // 假設平均每個播客聽20分鐘

            setUserStats({
                favoritesCount,
                playHistoryCount,
                totalListeningTime,
                joinedDate: user.created_at || new Date().toISOString()
            })
        } catch (error) {
            console.error('獲取用戶統計失敗:', error)
        } finally {
            setIsLoadingStats(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // 這裡可以添加更新用戶信息的 API 調用
            // 目前只是模擬保存
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast({
                title: "保存成功",
                description: "您的個人資料已更新"
            })
            setIsEditing(false)
        } catch (error) {
            toast({
                title: "保存失敗",
                description: "請稍後再試",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                email: user.email || ''
            })
        }
        setIsEditing(false)
    }

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatListeningTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60

        if (hours > 0) {
            return `${hours} 小時 ${remainingMinutes} 分鐘`
        }
        return `${remainingMinutes} 分鐘`
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Skeleton className="h-96 w-full" />
                        </div>
                        <div>
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '用戶'
    const userInitial = userName.charAt(0).toUpperCase()

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                        <h1 className="text-3xl font-bold">個人資料</h1>
                        <p className="text-muted-foreground">管理您的帳戶設定和偏好</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 個人資料卡片 */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>基本資料</CardTitle>
                                    <CardDescription>管理您的個人資訊</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        編輯
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            取消
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaving ? '保存中...' : '保存'}
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 頭像區域 */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
                                        <AvatarFallback className="text-xl">{userInitial}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">個人頭像</p>
                                        <p className="text-xs text-muted-foreground">
                                            通過 Google 帳戶同步
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* 個人資訊表單 */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">姓名</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            disabled={!isEditing}
                                            className={!isEditing ? "bg-muted" : ""}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">電子郵件</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            disabled={true}
                                            className="bg-muted"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            電子郵件地址無法修改
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>帳戶類型</Label>
                                        <div>
                                            <Badge variant="secondary">
                                                <User className="h-3 w-3 mr-1" />
                                                一般用戶
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>註冊日期</Label>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            {userStats ? formatJoinDate(userStats.joinedDate) : '載入中...'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 統計資訊卡片 */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>使用統計</CardTitle>
                                <CardDescription>您的學習足跡</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoadingStats ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                ) : userStats ? (
                                    <>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {userStats.favoritesCount}
                                            </div>
                                            <div className="text-sm text-muted-foreground">收藏論文</div>
                                        </div>

                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {userStats.playHistoryCount}
                                            </div>
                                            <div className="text-sm text-muted-foreground">播放記錄</div>
                                        </div>

                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {formatListeningTime(userStats.totalListeningTime)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">總收聽時間</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        無法載入統計資訊
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 