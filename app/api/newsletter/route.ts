import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "請提供有效的電子郵箱地址" },
                { status: 400 }
            )
        }

        // 檢查是否已經訂閱
        const { data: existing } = await supabase
            .from("newsletter_subscriptions")
            .select("id")
            .eq("email", email)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: "此電子郵箱已經訂閱過了" },
                { status: 409 }
            )
        }

        // 添加到訂閱列表
        const { data, error } = await supabase
            .from("newsletter_subscriptions")
            .insert({
                email,
                subscribed_at: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single()

        if (error) {
            console.error("Newsletter subscription error:", error)
            return NextResponse.json(
                { error: "訂閱失敗，請稍後再試" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "訂閱成功！感謝您的訂閱",
            subscription: data
        })

    } catch (error) {
        console.error("Newsletter API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "請提供電子郵箱地址" },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from("newsletter_subscriptions")
            .update({ is_active: false })
            .eq("email", email)

        if (error) {
            console.error("Newsletter unsubscribe error:", error)
            return NextResponse.json(
                { error: "取消訂閱失敗，請稍後再試" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "已成功取消訂閱"
        })

    } catch (error) {
        console.error("Newsletter unsubscribe API error:", error)
        return NextResponse.json(
            { error: "服務器內部錯誤" },
            { status: 500 }
        )
    }
} 