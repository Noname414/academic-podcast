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
import { MoreHorizontal, Trash2, UserX } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { toast } from 'sonner'
import { Skeleton } from '../ui/skeleton'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function UserManagementTable() {
    const { data: users, error, mutate } = useSWR('/api/admin/users', fetcher)
    const [isDeleting, setIsDeleting] = useState(false)
    const [userToDelete, setUserToDelete] = useState<any>(null)

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        setIsDeleting(true)

        try {
            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || '刪除用戶失敗')
            }

            toast.success(`用戶 ${userToDelete.name} 已成功刪除`)
            mutate(users.filter((user: any) => user.id !== userToDelete.id), false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : '發生未知錯誤')
        } finally {
            setIsDeleting(false)
            setUserToDelete(null)
        }
    }

    if (error) return <div className="text-red-500">加載失敗: {error.message}</div>
    if (!users) return (
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
                            <TableHead>用戶</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>加入時間</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">打開選單</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setUserToDelete(user)}
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
                                    <UserX className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    沒有用戶
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除用戶嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作無法撤銷。這將永久刪除用戶 <strong>{userToDelete?.name} ({userToDelete?.email})</strong> 的帳戶及其所有相關數據。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting}>
                            {isDeleting ? "刪除中..." : "確定刪除"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 