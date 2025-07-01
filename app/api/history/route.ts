import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json(
                { error: "缺少用戶ID" },
                { status: 400 }
            )
        }

        // 獲取用戶播放歷史
        const { data, error } = await supabase
            .from("play_history")
            .select(`
                id,
                position_seconds,
                completed,
                created_at,
                updated_at,
                papers (
                    id,
                    title,
                    authors,
                    journal,
                    publish_date,
                    duration_seconds,
                    audio_url,
                    category
                )
            `)
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })

        if (error) {
            console.error("Get history error:", error)
            return NextResponse.json(
                { error: "獲取播放歷史失敗" },
                { status: 500 }
            )
        }

        return NextResponse.json({ history: data || [] })

    } catch (error) {
        console.error("History API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, paperId, positionSeconds, completed } = await request.json()

        if (!userId || !paperId || positionSeconds === undefined) {
            return NextResponse.json(
                { error: "缺少必要參數" },
                { status: 400 }
            )
        }

        // 更新播放歷史
        const { data, error } = await supabase
            .from("play_history")
            .upsert({
                user_id: userId,
                paper_id: paperId,
                position_seconds: positionSeconds,
                completed: completed || false
            })
            .select()
            .single()

        if (error) {
            console.error("Update history error:", error)
            return NextResponse.json(
                { error: "更新播放歷史失敗" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "播放歷史已更新",
            history: data
        })

    } catch (error) {
        console.error("Update history API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId, paperId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: "缺少用戶ID" },
                { status: 400 }
            )
        }

        let query = supabase
            .from("play_history")
            .delete()
            .eq("user_id", userId)

        if (paperId) {
            // 刪除特定播客的播放記錄
            query = query.eq("paper_id", paperId)
        }
        // 如果沒有 paperId，則刪除用戶所有播放記錄

        const { error } = await query

        if (error) {
            console.error("Delete history error:", error)
            return NextResponse.json(
                { error: "刪除播放歷史失敗" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: paperId ? "播放記錄已刪除" : "所有播放記錄已清除"
        })

    } catch (error) {
        console.error("Delete history API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
} 