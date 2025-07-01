"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Settings, ArrowLeft, Moon, Volume2, Bell, Download, Trash2, Shield } from 'lucide-react'

interface UserSettings {
    autoPlay: boolean
    playbackSpeed: number
    volumeLevel: number
    notifications: boolean
    downloadQuality: string
    theme: string
    language: string
}

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const { theme, setTheme } = useTheme()
    const { toast } = useToast()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [settings, setSettings] = useState<UserSettings>({
        autoPlay: true,
        playbackSpeed: 1.0,
        volumeLevel: 80,
        notifications: true,
        downloadQuality: 'high',
        theme: 'system',
        language: 'zh-TW'
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setMounted(true)

        if (!loading && !user) {
            router.push('/')
            return
        }

        loadUserSettings()
    }, [user, loading, router])

    const loadUserSettings = () => {
        try {
            const savedSettings = localStorage.getItem('userSettings')
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings)
                setSettings({ ...settings, ...parsed })
            }
        } catch (error) {
            console.error('載入設定失敗:', error)
        }
    }

    const saveSettings = async () => {
        setIsSaving(true)
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings))

            if (settings.theme !== theme) {
                setTheme(settings.theme)
            }

            toast({
                title: "設定已保存",
                description: "您的偏好設定已成功保存"
            })
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

    const handleSettingChange = (key: keyof UserSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const clearAllData = async () => {
        if (!confirm('確定要清除所有個人數據嗎？此操作無法撤銷。')) {
            return
        }

        try {
            localStorage.removeItem('userSettings')

            toast({
                title: "數據已清除",
                description: "所有個人數據已清除"
            })

            setSettings({
                autoPlay: true,
                playbackSpeed: 1.0,
                volumeLevel: 80,
                notifications: true,
                downloadQuality: 'high',
                theme: 'system',
                language: 'zh-TW'
            })
        } catch (error) {
            toast({
                title: "清除失敗",
                description: "請稍後再試",
                variant: "destructive"
            })
        }
    }

    if (loading || !mounted) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                            <Settings className="h-8 w-8 text-gray-500" />
                            設定
                        </h1>
                        <p className="text-muted-foreground">管理您的偏好和帳戶設定</p>
                    </div>
                    <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="gap-2"
                    >
                        {isSaving ? '保存中...' : '保存設定'}
                    </Button>
                </div>

                {/* 外觀設定 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5" />
                            外觀設定
                        </CardTitle>
                        <CardDescription>自訂應用程式的外觀和主題</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>主題模式</Label>
                                <p className="text-sm text-muted-foreground">
                                    選擇淺色、深色或跟隨系統設定
                                </p>
                            </div>
                            <Select
                                value={settings.theme}
                                onValueChange={(value) => handleSettingChange('theme', value)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">淺色</SelectItem>
                                    <SelectItem value="dark">深色</SelectItem>
                                    <SelectItem value="system">系統</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>語言</Label>
                                <p className="text-sm text-muted-foreground">
                                    選擇應用程式介面語言
                                </p>
                            </div>
                            <Select
                                value={settings.language}
                                onValueChange={(value) => handleSettingChange('language', value)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="zh-TW">繁體中文</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 播放設定 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5" />
                            播放設定
                        </CardTitle>
                        <CardDescription>調整音頻播放相關設定</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>自動播放</Label>
                                <p className="text-sm text-muted-foreground">
                                    自動播放下一個播客
                                </p>
                            </div>
                            <Switch
                                checked={settings.autoPlay}
                                onCheckedChange={(checked) => handleSettingChange('autoPlay', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>預設播放速度</Label>
                                <p className="text-sm text-muted-foreground">
                                    新播客的預設播放速度
                                </p>
                            </div>
                            <Select
                                value={settings.playbackSpeed.toString()}
                                onValueChange={(value) => handleSettingChange('playbackSpeed', parseFloat(value))}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.5">0.5x</SelectItem>
                                    <SelectItem value="0.75">0.75x</SelectItem>
                                    <SelectItem value="1">1x</SelectItem>
                                    <SelectItem value="1.25">1.25x</SelectItem>
                                    <SelectItem value="1.5">1.5x</SelectItem>
                                    <SelectItem value="2">2x</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 通知設定 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            通知設定
                        </CardTitle>
                        <CardDescription>管理通知偏好</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>推送通知</Label>
                                <p className="text-sm text-muted-foreground">
                                    接收新播客和更新通知
                                </p>
                            </div>
                            <Switch
                                checked={settings.notifications}
                                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 隱私和安全 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            隱私和安全
                        </CardTitle>
                        <CardDescription>管理您的數據和隱私設定</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">數據管理</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    您可以下載或刪除您的個人數據
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        下載我的數據
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllData}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        清除所有數據
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-2">帳戶狀態</h4>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        <Shield className="h-3 w-3 mr-1" />
                                        已驗證
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        您的帳戶已通過電子郵件驗證
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        size="lg"
                        className="gap-2"
                    >
                        {isSaving ? '保存中...' : '保存所有設定'}
                    </Button>
                </div>
            </div>
        </div>
    )
} 