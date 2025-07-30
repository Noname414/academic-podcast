"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Trash2,
    RefreshCw,
    Star,
    StarOff
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface PendingUpload {
    id: string
    original_filename: string
    file_size: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error_message?: string
    extracted_title?: string
    extracted_authors?: string[]
    extracted_abstract?: string
    priority: number
    created_at: string
    updated_at: string
}

interface PendingUploadsListProps {
    className?: string
    showTitle?: boolean
}

export function PendingUploadsList({ className, showTitle = true }: PendingUploadsListProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [uploads, setUploads] = useState<PendingUpload[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchUploads = async () => {
        if (!user) return

        try {
            const response = await fetch('/api/upload/pdf')
            if (!response.ok) {
                throw new Error('獲取上傳列表失敗')
            }

            const result = await response.json()
            if (result.success) {
                setUploads(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch uploads:', error)
            toast({
                title: "獲取失敗",
                description: "無法獲取上傳列表",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchUploads()
    }, [user])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchUploads()
    }

    const handleDelete = async (uploadId: string) => {
        try {
            const response = await fetch(`/api/upload/${uploadId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('刪除失敗')
            }

            setUploads(prev => prev.filter(upload => upload.id !== uploadId))
            toast({
                title: "刪除成功",
                description: "已從待處理列表中移除"
            })
        } catch (error) {
            toast({
                title: "刪除失敗",
                description: "無法刪除該項目",
                variant: "destructive"
            })
        }
    }

    const getStatusColor = (status: PendingUpload['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getStatusIcon = (status: PendingUpload['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />
            case 'processing':
                return <RefreshCw className="w-4 h-4 animate-spin" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'failed':
                return <AlertCircle className="w-4 h-4" />
        }
    }

    const getStatusText = (status: PendingUpload['status']) => {
        switch (status) {
            case 'pending':
                return '等待處理'
            case 'processing':
                return '處理中'
            case 'completed':
                return '已完成'
            case 'failed':
                return '處理失敗'
        }
    }

    const getPriorityIcon = (priority: number) => {
        if (priority <= 2) {
            return <Star className="w-4 h-4 text-red-500" />
        } else if (priority <= 4) {
            return <Star className="w-4 h-4 text-orange-500" />
        } else {
            return <StarOff className="w-4 h-4 text-gray-400" />
        }
    }

    const getPriorityText = (priority: number) => {
        if (priority <= 2) return '最高優先級'
        if (priority <= 4) return '高優先級'
        if (priority <= 6) return '普通優先級'
        return '低優先級'
    }

    if (!user) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    請先登錄以查看您的上傳列表
                </AlertDescription>
            </Alert>
        )
    }

    if (loading) {
        return (
            <Card className={className}>
                {showTitle && (
                    <CardHeader>
                        <CardTitle>待處理列表</CardTitle>
                        <CardDescription>您上傳的PDF檔案處理狀態</CardDescription>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        <span>載入中...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            {showTitle && (
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>待處理列表</CardTitle>
                            <CardDescription>您上傳的PDF檔案處理狀態</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            刷新
                        </Button>
                    </div>
                </CardHeader>
            )}

            <CardContent className="space-y-4">
                {uploads.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">暫無上傳檔案</h3>
                        <p className="text-muted-foreground">
                            上傳PDF檔案後，您可以在此查看處理進度
                        </p>
                    </div>
                ) : (
                    uploads.map((upload) => (
                        <Card key={upload.id} className="relative">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <FileText className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium truncate">
                                                    {upload.extracted_title || upload.original_filename}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    {getPriorityIcon(upload.priority)}
                                                </div>
                                            </div>

                                            {upload.extracted_title && upload.original_filename !== upload.extracted_title && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    檔案名稱: {upload.original_filename}
                                                </p>
                                            )}

                                            {upload.extracted_authors && upload.extracted_authors.length > 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    作者: {upload.extracted_authors.join(', ')}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{(upload.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>{getPriorityText(upload.priority)}</span>
                                                <span>
                                                    {formatDistanceToNow(new Date(upload.created_at), {
                                                        addSuffix: true,
                                                        locale: zhTW
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Badge className={getStatusColor(upload.status)}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(upload.status)}
                                                {getStatusText(upload.status)}
                                            </div>
                                        </Badge>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(upload.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {upload.extracted_abstract && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {upload.extracted_abstract}
                                        </p>
                                    </div>
                                )}

                                {upload.status === 'processing' && (
                                    <div className="mt-3">
                                        <Progress value={undefined} className="w-full" />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            正在處理中，請耐心等待...
                                        </p>
                                    </div>
                                )}

                                {upload.status === 'failed' && upload.error_message && (
                                    <Alert variant="destructive" className="mt-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            {upload.error_message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </CardContent>
        </Card>
    )
} 