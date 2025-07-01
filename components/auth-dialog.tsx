'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'

interface AuthDialogProps {
    children: React.ReactNode
}

export function AuthDialog({ children }: AuthDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { signIn, signUp, signInWithGoogle } = useAuth()

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await signIn(email, password)

        if (error) {
            toast.error(error)
        } else {
            toast.success('登錄成功!')
            setOpen(false)
        }

        setIsLoading(false)
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            toast.error('密碼不一致')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            toast.error('密碼至少需要 6 個字符')
            setIsLoading(false)
            return
        }

        const { error } = await signUp(email, password, name)

        if (error) {
            toast.error(error)
        } else {
            toast.success('註冊成功! 請檢查您的郵箱以驗證帳戶')
            setOpen(false)
        }

        setIsLoading(false)
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        const { error } = await signInWithGoogle()

        if (error) {
            toast.error(error)
            setIsLoading(false)
        }
        // 對於 OAuth，不需要設置 loading 為 false，因為頁面會重定向
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>登錄 / 註冊</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">登錄</TabsTrigger>
                        <TabsTrigger value="signup">註冊</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4">
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">電子郵箱</Label>
                                <Input
                                    id="signin-email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="請輸入您的電子郵箱"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signin-password">密碼</Label>
                                <Input
                                    id="signin-password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="請輸入您的密碼"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                登錄
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">或</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            使用 Google 登錄
                        </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">姓名</Label>
                                <Input
                                    id="signup-name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="請輸入您的姓名"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-email">電子郵箱</Label>
                                <Input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="請輸入您的電子郵箱"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-password">密碼</Label>
                                <Input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="請輸入您的密碼（至少 6 個字符）"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm-password">確認密碼</Label>
                                <Input
                                    id="signup-confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    placeholder="請再次輸入您的密碼"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                註冊
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">或</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            使用 Google 註冊
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 