'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, BookX, Eye, ThumbsUp, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import { getCategoryDisplayName } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PaperManagementTable() {
    const { data: papers, error, mutate } = useSWR('/api/papers?limit=100', fetcher) // Fetch a larger number for admin
    const [isDeleting, setIsDeleting] = useState(false)
    const [paperToDelete, setPaperToDelete] = useState<any>(null)

    const handleDeletePaper = async () => {
        if (!paperToDelete) return
        setIsDeleting(true)

        try {
            const response = await fetch(`/api/admin/papers/${paperToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || '刪除論文失敗')
            }

            toast.success(`論文 "${paperToDelete.title}" 已成功刪除`)
            mutate(papers.filter((paper: any) => paper.id !== paperToDelete.id), false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : '發生未知錯誤')
        } finally {
            setIsDeleting(false)
            setPaperToDelete(null)
        }
    }

    if (error) return <div className="text-red-500">加載失敗: {error.message}</div>
    if (!papers) return (
        <div>
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-1" />
            <Skeleton className="h-12 w-full mb-1" />
            <Skeleton className="h-12 w-full mb-1" />
        </div>
    )

    return (
        <>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>標題</TableHead>
                            <TableHead>分類</TableHead>
                            <TableHead>統計</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {papers.length > 0 ? (
                            papers.map((paper: any) => (
                                <TableRow key={paper.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{paper.title}</TableCell>
                                    <TableCell><Badge variant="outline">{getCategoryDisplayName(paper.category)}</Badge></TableCell>
                                    <TableCell className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{paper.views}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{paper.likes}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setPaperToDelete(paper)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>刪除</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <BookX className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    沒有論文
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!paperToDelete} onOpenChange={(open) => !open && setPaperToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除論文嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作無法撤銷。這將永久刪除論文 <strong>"{paperToDelete?.title}"</strong> 及其所有相關數據(包括留言和按讚)。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePaper} disabled={isDeleting}>
                            {isDeleting ? "刪除中..." : "確定刪除"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 