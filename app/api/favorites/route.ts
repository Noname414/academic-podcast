import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const { userId, paperId } = await request.json()

        if (!userId || !paperId) {
            return NextResponse.json(
                { error: "缺少必要參數" },
                { status: 400 }
            )
        }

        // 檢查是否已經收藏
        const { data: existing } = await supabase
            .from("user_favorites")
            .select("id")
            .eq("user_id", userId)
            .eq("paper_id", paperId)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: "已經收藏過了" },
                { status: 409 }
            )
        }

        // 添加到收藏
        const { data, error } = await supabase
            .from("user_favorites")
            .insert({
                user_id: userId,
                paper_id: paperId
            })
            .select()
            .single()

        if (error) {
            console.error("Add favorite error:", error)
            return NextResponse.json(
                { error: "收藏失敗，請稍後再試" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "收藏成功",
            favorite: data
        })

    } catch (error) {
        console.error("Favorites API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId, paperId } = await request.json()

        if (!userId || !paperId) {
            return NextResponse.json(
                { error: "缺少必要參數" },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", userId)
            .eq("paper_id", paperId)

        if (error) {
            console.error("Remove favorite error:", error)
            return NextResponse.json(
                { error: "取消收藏失敗，請稍後再試" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "已取消收藏"
        })

    } catch (error) {
        console.error("Remove favorite API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")
        const paperId = searchParams.get("paperId")

        if (!userId) {
            return NextResponse.json(
                { error: "缺少用戶ID" },
                { status: 400 }
            )
        }

        if (paperId) {
            // 檢查是否收藏了特定論文
            const { data, error } = await supabase
                .from("user_favorites")
                .select("id")
                .eq("user_id", userId)
                .eq("paper_id", paperId)
                .single()

            return NextResponse.json({ isFavorited: !!data })
        } else {
            // 獲取用戶所有收藏
            const { data, error } = await supabase
                .from("user_favorites")
                .select(`
          id,
          paper_id,
          created_at,
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
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Get favorites error:", error)
                return NextResponse.json(
                    { error: "獲取收藏失敗" },
                    { status: 500 }
                )
            }

            return NextResponse.json({ favorites: data })
        }

    } catch (error) {
        console.error("Get favorites API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
} 