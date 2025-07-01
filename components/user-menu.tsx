'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { User, Settings, LogOut, Heart, History } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
    const { user, signOut } = useAuth()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
            toast.success('已成功登出')
            router.push('/')
        } catch (error) {
            toast.error('登出失敗，請稍後再試')
        } finally {
            setIsSigningOut(false)
        }
    }

    const handleNavigation = (path: string) => {
        router.push(path)
    }

    if (!user) return null

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '用戶'
    const userInitial = userName.charAt(0).toUpperCase()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>個人資料</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/favorites')} className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>我的收藏</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/history')} className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>播放歷史</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isSigningOut ? '登出中...' : '登出'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 