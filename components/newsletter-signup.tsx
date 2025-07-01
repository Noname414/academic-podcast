"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "訂閱失敗")
      }

      setIsSubscribed(true)
      setEmail("")

      toast({
        title: "訂閱成功！",
        description: "感謝您的訂閱，我們會定期發送最新的學術播客更新。",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "訂閱失敗，請稍後再試"

      toast({
        title: "訂閱失敗",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="mb-16">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">訂閱成功！</h3>
            <p className="text-green-700 dark:text-green-300">
              感謝您的訂閱，我們會定期發送最新的學術播客更新到您的信箱。
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="mb-16">
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            訂閱學術播客更新
          </CardTitle>
          <CardDescription className="text-base">第一時間獲取最新的 AI 研究論文播客，每週精選推送</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary">每週更新</Badge>
            <Badge variant="secondary">精選內容</Badge>
            <Badge variant="secondary">免費訂閱</Badge>
            <Badge variant="secondary">隨時取消</Badge>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="輸入您的電子郵件地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-2 focus:border-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  訂閱中...
                </div>
              ) : (
                "立即訂閱"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            我們尊重您的隱私，不會與第三方分享您的電子郵件地址
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
