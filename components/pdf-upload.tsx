"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    Clock,
    Star,
    StarOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
    file: File
    id: string
    progress: number
    status: 'uploading' | 'processing' | 'success' | 'error'
    errorMessage?: string
    title?: string
    authors?: string
    abstract?: string
    priority: number
}

interface PdfUploadProps {
    onUploadComplete?: (files: UploadedFile[]) => void
    maxFiles?: number
    className?: string
}

export function PdfUpload({ onUploadComplete, maxFiles = 5, className }: PdfUploadProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({})

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        )

        if (files.length === 0) {
            toast({
                title: "無效檔案格式",
                description: "請只上傳PDF檔案",
                variant: "destructive"
            })
            return
        }

        handleFiles(files)
    }, [toast])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        handleFiles(files)
    }, [])

    const handleFiles = useCallback(async (files: File[]) => {
        if (!user) {
            toast({
                title: "請先登錄",
                description: "您需要登錄才能上傳PDF檔案",
                variant: "destructive"
            })
            return
        }

        if (uploadedFiles.length + files.length > maxFiles) {
            toast({
                title: "檔案數量超限",
                description: `最多只能上傳${maxFiles}個檔案`,
                variant: "destructive"
            })
            return
        }

        const newFiles: UploadedFile[] = files.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            progress: 0,
            status: 'uploading' as const,
            priority: 5
        }))

        setUploadedFiles(prev => [...prev, ...newFiles])

        // 開始上傳每個檔案
        for (const uploadFile of newFiles) {
            try {
                await uploadFile_internal(uploadFile)
            } catch (error) {
                console.error("Upload failed:", error)
            }
        }
    }, [user, uploadedFiles.length, maxFiles, toast])

    const uploadFile_internal = async (uploadFile: UploadedFile) => {
        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('title', uploadFile.title || '')
        formData.append('authors', uploadFile.authors || '')
        formData.append('abstract', uploadFile.abstract || '')
        formData.append('priority', uploadFile.priority.toString())

        try {
            const response = await fetch('/api/upload/pdf', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`上傳失敗: ${response.statusText}`)
            }

            const result = await response.json()

            setUploadedFiles(prev => prev.map(file =>
                file.id === uploadFile.id
                    ? { ...file, status: 'success', progress: 100 }
                    : file
            ))

            toast({
                title: "上傳成功",
                description: `${uploadFile.file.name} 已加入待處理清單`
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '上傳失敗'

            setUploadedFiles(prev => prev.map(file =>
                file.id === uploadFile.id
                    ? { ...file, status: 'error', errorMessage }
                    : file
            ))

            toast({
                title: "上傳失敗",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    const removeFile = useCallback((fileId: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    }, [])

    const updateFileDetails = useCallback((fileId: string, updates: Partial<UploadedFile>) => {
        setUploadedFiles(prev => prev.map(file =>
            file.id === fileId ? { ...file, ...updates } : file
        ))
    }, [])

    const toggleDetails = useCallback((fileId: string) => {
        setShowDetails(prev => ({ ...prev, [fileId]: !prev[fileId] }))
    }, [])

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
            case 'processing':
                return <Clock className="w-4 h-4 animate-spin" />
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />
        }
    }

    const getStatusText = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return "上傳中"
            case 'processing':
                return "處理中"
            case 'success':
                return "已完成"
            case 'error':
                return "上傳失敗"
        }
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    PDF 上傳
                </CardTitle>
                <CardDescription>
                    上傳學術論文PDF檔案，系統將自動處理並生成播客內容
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* 上傳區域 */}
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                        拖拽PDF檔案到此處或點擊選擇
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        支援PDF格式，單個檔案最大50MB，最多{maxFiles}個檔案
                    </p>
                    <Button variant="outline">
                        選擇檔案
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* 已上傳檔案列表 */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">已上傳檔案 ({uploadedFiles.length})</h4>
                        {uploadedFiles.map((file) => (
                            <Card key={file.id} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(file.status)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(file.file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(file.status)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDetails(file.id)}
                                            >
                                                詳細設定
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(file.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {file.status === 'uploading' && (
                                        <Progress value={file.progress} className="mt-2" />
                                    )}

                                    {file.status === 'error' && file.errorMessage && (
                                        <Alert variant="destructive" className="mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{file.errorMessage}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardHeader>

                                {/* 詳細設定 */}
                                {showDetails[file.id] && (
                                    <CardContent className="pt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`title-${file.id}`}>論文標題（可選）</Label>
                                                <Input
                                                    id={`title-${file.id}`}
                                                    placeholder="如已知論文標題，請輸入"
                                                    value={file.title || ''}
                                                    onChange={(e) => updateFileDetails(file.id, { title: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`authors-${file.id}`}>作者（可選）</Label>
                                                <Input
                                                    id={`authors-${file.id}`}
                                                    placeholder="以逗號分隔多個作者"
                                                    value={file.authors || ''}
                                                    onChange={(e) => updateFileDetails(file.id, { authors: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`abstract-${file.id}`}>摘要（可選）</Label>
                                            <Textarea
                                                id={`abstract-${file.id}`}
                                                placeholder="論文摘要或簡要描述"
                                                rows={3}
                                                value={file.abstract || ''}
                                                onChange={(e) => updateFileDetails(file.id, { abstract: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`priority-${file.id}`}>處理優先級</Label>
                                            <Select
                                                value={file.priority.toString()}
                                                onValueChange={(value) => updateFileDetails(file.id, { priority: parseInt(value) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-red-500" />
                                                            最高優先級
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-orange-500" />
                                                            高優先級
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        <div className="flex items-center gap-2">
                                                            <StarOff className="w-4 h-4" />
                                                            普通優先級
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="7">
                                                        <div className="flex items-center gap-2">
                                                            <StarOff className="w-4 h-4 text-gray-400" />
                                                            低優先級
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* 提示信息 */}
                {uploadedFiles.length === 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            上傳的PDF檔案將加入待處理清單，系統會自動提取內容並生成播客音檔。
                            處理時間取決於論文長度和當前工作負載。
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>

            {uploadedFiles.length > 0 && (
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            {uploadedFiles.filter(f => f.status === 'success').length} / {uploadedFiles.length} 檔案上傳成功
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setUploadedFiles([])}
                        >
                            清除列表
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
} 