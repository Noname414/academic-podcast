"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Menu,
  Headphones,
  BookOpen,
  Home,
  Bookmark,
  Bell,
  Moon,
  Sun,
  User,
  MessageCircle,
  ThumbsUp,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { useAuth } from "@/hooks/use-auth"
import { AuthDialog } from "@/components/auth-dialog"
import { UserMenu } from "@/components/user-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// Define the type here to be accessible by the component
interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_paper_id: string;
  related_comment_id: string;
  triggering_user: {
    name: string;
  } | null;
  paper: {
    title: string;
  } | null;
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const triggerName = notification.triggering_user?.name ?? '有人';

  const message = notification.type === 'new_reply'
    ? <><strong>{triggerName}</strong> 回覆了您的留言</>
    : <><strong>{triggerName}</strong> 喜歡您的留言</>;

  return (
    <Link href={`/podcast/${notification.related_paper_id}#comment-${notification.related_comment_id}`} className="block p-3 hover:bg-muted -mx-3 rounded-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {notification.type === 'new_reply' ? <MessageCircle className="h-5 w-5 text-blue-500" /> : <ThumbsUp className="h-5 w-5 text-red-500" />}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            在《{notification.paper?.title ?? '某篇論文'}》中
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: zhTW })}
          </p>
        </div>
        {!notification.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
      </div>
    </Link>
  )
}

export function Header() {
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const { user, loading } = useAuth()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  // 確保組件在客戶端完全載入後才渲染主題相關內容
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 這裡可以導航到搜尋結果頁面
      console.log("搜尋:", searchQuery)
      setIsSearchOpen(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">打開選單</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-3 text-lg font-semibold mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Headphones className="h-6 w-6 text-primary" />
                    </div>
                    AI 論文播客
                  </Link>

                  <div className="space-y-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Home className="h-5 w-5" />
                      首頁
                    </Link>
                    <Link
                      href="/#featured-topics"
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <BookOpen className="h-5 w-5" />
                      瀏覽主題
                    </Link>
                    <Link
                      href="/?sortBy=created_at"
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Badge variant="secondary" className="w-fit">
                        新
                      </Badge>
                      最新發布
                    </Link>
                    <Link
                      href="/?sortBy=views"
                      className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Badge variant="secondary" className="w-fit">
                        熱
                      </Badge>
                      熱門論文
                    </Link>
                    {user && (
                      <Link
                        href="/?favorites=true"
                        className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Bookmark className="h-5 w-5" />
                        我的收藏
                      </Link>
                    )}
                  </div>

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">
                      {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      {mounted && theme === "dark" ? "淺色模式" : "深色模式"}
                    </Button>

                    {!user && !loading && (
                      <>
                        <AuthDialog>
                          <Button variant="ghost" className="w-full justify-start gap-3">
                            登入
                          </Button>
                        </AuthDialog>
                        <AuthDialog>
                          <Button className="w-full justify-start gap-3">
                            註冊
                          </Button>
                        </AuthDialog>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          <Link href="/" className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden md:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI 論文播客
            </span>
          </Link>

          {!isMobile && (
            <nav className="flex items-center gap-6 text-sm ml-8">
              <Link href="/" className="font-medium transition-colors hover:text-primary relative group">
                首頁
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/#featured-topics" className="font-medium transition-colors hover:text-primary relative group">
                瀏覽主題
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link
                href="/?sortBy=created_at"
                className="font-medium transition-colors hover:text-primary relative group flex items-center gap-1"
              >
                最新發布
                <Badge variant="secondary" className="text-xs">
                  新
                </Badge>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link
                href="/?sortBy=views"
                className="font-medium transition-colors hover:text-primary relative group flex items-center gap-1"
              >
                熱門論文
                <Badge variant="secondary" className="text-xs">
                  熱
                </Badge>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {isSearchOpen && !isMobile ? (
            <form onSubmit={handleSearch} className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋論文或主題..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
                  setTimeout(() => setIsSearchOpen(false), 200)
                }}
              />
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">搜尋</span>
            </Button>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">切換主題</span>
          </Button>

          {/* Notifications */}
          {user && (
            <Popover onOpenChange={(open) => { if (open) markAllAsRead() }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">通知</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[380px]">
                <div className="p-4">
                  <h4 className="font-semibold text-lg">通知</h4>
                </div>
                <div className="p-1 max-h-[400px] overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>沒有新的通知</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* User Menu */}
          {user ? (
            <UserMenu />
          ) : (
            !isMobile && !loading && (
              <div className="flex items-center gap-2">
                <AuthDialog>
                  <Button variant="ghost" size="sm">
                    登入
                  </Button>
                </AuthDialog>
                <AuthDialog>
                  <Button size="sm">
                    註冊
                  </Button>
                </AuthDialog>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  )
}
