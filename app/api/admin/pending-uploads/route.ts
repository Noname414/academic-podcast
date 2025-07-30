import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-service"
import { withAdminAuth } from "@/lib/admin-auth"

async function getHandler(request: NextRequest) {
    try {
        // 解析查詢參數
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") as 'pending' | 'processing' | 'completed' | 'failed' | null
        const limit = parseInt(searchParams.get("limit") || "10")
        const offset = parseInt(searchParams.get("offset") || "0")

        const uploads = await db.getAllPendingUploads({
            status: status || undefined,
            limit,
            offset,
        })

        return NextResponse.json({
            success: true,
            data: uploads,
        })

    } catch (error) {
        console.error("Get admin uploads error:", error)
        return NextResponse.json(
            {
                error: "獲取上傳列表失敗",
                message: error instanceof Error ? error.message : "未知錯誤",
            },
            { status: 500 }
        )
    }
}

export const GET = withAdminAuth(getHandler) 