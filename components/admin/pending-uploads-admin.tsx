"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Trash2,
    RefreshCw,
    Star,
    StarOff,
    Search,
    Eye,
    Settings
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface PendingUpload {
    id: string
    user_id: string
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
    users: {
        name: string
        email: string
    }
}

export function PendingUploadsAdmin() {
    const { toast } = useToast()
    const [uploads, setUploads] = useState<PendingUpload[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const fetchUploads = async () => {
        try {
            const params = new URLSearchParams()
            if (statusFilter !== "all") {
                params.append("status", statusFilter)
            }
            params.append("limit", itemsPerPage.toString())
            params.append("offset", ((currentPage - 1) * itemsPerPage).toString())

            const response = await fetch(`/api/admin/pending-uploads?${params}`)
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
    }, [statusFilter, currentPage])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchUploads()
    }

    const handleUpdateStatus = async (uploadId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/pending-uploads/${uploadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                throw new Error('更新狀態失敗')
            }

            setUploads(prev => prev.map(upload =>
                upload.id === uploadId
                    ? { ...upload, status: newStatus as any, updated_at: new Date().toISOString() }
                    : upload
            ))

            toast({
                title: "更新成功",
                description: "已更新處理狀態"
            })
        } catch (error) {
            toast({
                title: "更新失敗",
                description: "無法更新狀態",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async (uploadId: string) => {
        if (!confirm('確定要刪除這個上傳嗎？')) return

        try {
            const response = await fetch(`/api/admin/pending-uploads/${uploadId}`, {
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

    const filteredUploads = uploads.filter(upload => {
        if (!searchQuery) return true

        const searchTerm = searchQuery.toLowerCase()
        return upload.original_filename.toLowerCase().includes(searchTerm) ||
            upload.extracted_title?.toLowerCase().includes(searchTerm) ||
            upload.users.name.toLowerCase().includes(searchTerm) ||
            upload.users.email.toLowerCase().includes(searchTerm)
    })

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>待處理上傳管理</CardTitle>
                    <CardDescription>管理所有用戶的PDF上傳和處理狀態</CardDescription>
                </CardHeader>
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>待處理上傳管理</CardTitle>
                        <CardDescription>管理所有用戶的PDF上傳和處理狀態</CardDescription>
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

            <CardContent className="space-y-6">
                {/* 搜尋和篩選 */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜尋檔案名稱、標題或用戶..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="篩選狀態" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部狀態</SelectItem>
                            <SelectItem value="pending">等待處理</SelectItem>
                            <SelectItem value="processing">處理中</SelectItem>
                            <SelectItem value="completed">已完成</SelectItem>
                            <SelectItem value="failed">處理失敗</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {filteredUploads.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">暫無上傳檔案</h3>
                        <p className="text-muted-foreground">
                            目前沒有符合條件的上傳檔案
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>檔案資訊</TableHead>
                                    <TableHead>用戶</TableHead>
                                    <TableHead>優先級</TableHead>
                                    <TableHead>狀態</TableHead>
                                    <TableHead>上傳時間</TableHead>
                                    <TableHead>操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUploads.map((upload) => (
                                    <TableRow key={upload.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium truncate max-w-48">
                                                        {upload.extracted_title || upload.original_filename}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {(upload.file_size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                                {upload.extracted_authors && (
                                                    <div className="text-xs text-muted-foreground">
                                                        作者: {upload.extracted_authors.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{upload.users.name}</div>
                                                <div className="text-sm text-muted-foreground">{upload.users.email}</div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getPriorityIcon(upload.priority)}
                                                <span className="text-sm">{upload.priority}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Select
                                                value={upload.status}
                                                onValueChange={(value) => handleUpdateStatus(upload.id, value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <Badge className={getStatusColor(upload.status)}>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(upload.status)}
                                                            {getStatusText(upload.status)}
                                                        </div>
                                                    </Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">等待處理</SelectItem>
                                                    <SelectItem value="processing">處理中</SelectItem>
                                                    <SelectItem value="completed">已完成</SelectItem>
                                                    <SelectItem value="failed">處理失敗</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDistanceToNow(new Date(upload.created_at), {
                                                    addSuffix: true,
                                                    locale: zhTW
                                                })}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(upload.id)}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* 分頁 */}
                {uploads.length >= itemsPerPage && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            顯示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, uploads.length)} 項，共 {uploads.length} 項
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                上一頁
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={uploads.length < itemsPerPage}
                            >
                                下一頁
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 