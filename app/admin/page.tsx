"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, RefreshCw, Sprout } from "lucide-react"

export default function AdminPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true)
      setResult(null)

      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      const data = await response.json()
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
      <h1 className="text-3xl font-bold mb-8">管理員控制台</h1>

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
    </div>
  )
}
