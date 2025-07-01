import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest) {
    try {
        // 獲取所有分類的統計資料
        const categoryStats = await db.getCategoryStats()

        return NextResponse.json(categoryStats)
    } catch (error) {
        console.error("Error in topics API:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
} 