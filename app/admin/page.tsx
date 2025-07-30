"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, RefreshCw, Sprout, Users, BookCopy, Upload, Shield } from "lucide-react"
import { UserManagementTable } from "@/components/admin/user-table"
import { PaperManagementTable } from "@/components/admin/paper-table"
import { PendingUploadsAdmin } from "@/components/admin/pending-uploads-admin"
import { useAuth } from "@/hooks/use-auth"
import { createClientComponentClient } from "@/lib/supabase"

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // 檢查管理員權限
  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return

      if (!user) {
        router.push('/?auth=required')
        return
      }

      try {
        const supabase = createClientComponentClient()
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          setAuthError('無法驗證管理員權限')
          return
        }

        const adminStatus = userData?.role === 'admin'
        setIsAdmin(adminStatus)

        if (!adminStatus) {
          setAuthError('您沒有管理員權限訪問此頁面')
        }
      } catch (error) {
        setAuthError('權限檢查失敗')
      }
    }

    checkAdminStatus()
  }, [user, authLoading, router])

  // 如果還在加載中，顯示加載狀態
  if (authLoading || isAdmin === null) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">正在驗證管理員權限...</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果不是管理員，顯示錯誤信息
  if (!isAdmin || authError) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="max-w-md mx-auto border-red-500">
          <Shield className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-700">訪問被拒絕</AlertTitle>
          <AlertDescription className="text-red-600">
            {authError || '您沒有權限訪問管理員控制台'}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => router.push('/')} variant="outline">
            返回首頁
          </Button>
        </div>
      </div>
    )
  }

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true)
      setResult(null)

      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.code === 'ADMIN_REQUIRED') {
        setAuthError('管理員權限已失效，請重新登錄')
        return
      }

      setResult({
        success: data.success,
        message: data.message || (data.success ? "資料庫初始化成功" : "資料庫初始化失敗"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: `發生錯誤: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const seedDatabase = async () => {
    try {
      setIsSeeding(true)
      setResult(null)

      const response = await fetch("/api/admin/seed-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.code === 'ADMIN_REQUIRED') {
        setAuthError('管理員權限已失效，請重新登錄')
        return
      }

      setResult({
        success: data.success,
        message: data.message || (data.success ? "資料庫種子資料添加成功" : "資料庫種子資料添加失敗"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: `發生錯誤: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">管理員控制台</h1>
        <div className="ml-auto text-sm text-muted-foreground">
          歡迎，{user?.user_metadata?.full_name || user?.email}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              資料庫初始化
            </CardTitle>
            <CardDescription>初始化資料庫結構和基本資料</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              點擊下方按鈕初始化資料庫。這將創建所有必要的表格和函數。
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={initializeDatabase} disabled={isInitializing || isSeeding} className="w-full">
              {isInitializing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  初始化中...
                </>
              ) : (
                "初始化資料庫"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              添加種子資料
            </CardTitle>
            <CardDescription>添加示例用戶和論文資料</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              點擊下方按鈕添加示例資料。這將創建示例用戶和論文資料，用於測試和展示。
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={seedDatabase} disabled={isInitializing || isSeeding} className="w-full">
              {isSeeding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  添加中...
                </>
              ) : (
                "添加種子資料"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {result && (
        <Alert className={`mt-6 ${result.success ? "border-green-500" : "border-red-500"}`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>{result.success ? "成功" : "錯誤"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              用戶管理
            </CardTitle>
            <CardDescription>查看和管理所有用戶</CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementTable />
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              待處理上傳管理
            </CardTitle>
            <CardDescription>查看和管理所有用戶的PDF上傳</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingUploadsAdmin />
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCopy className="h-5 w-5" />
              論文管理
            </CardTitle>
            <CardDescription>查看和管理所有論文</CardDescription>
          </CardHeader>
          <CardContent>
            <PaperManagementTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
