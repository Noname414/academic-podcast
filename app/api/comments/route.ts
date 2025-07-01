import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const paperId = searchParams.get("paper_id")

        if (!paperId) {
            return NextResponse.json({ error: "paper_id is required" }, { status: 400 })
        }

        const comments = await db.getComments(paperId)

        return NextResponse.json(comments)
    } catch (error) {
        console.error("Error in GET /api/comments:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        let response = NextResponse.next()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({ name, value: "", ...options })
                    },
                },
            },
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { paper_id, content, parent_id } = body

        if (!paper_id || !content) {
            return NextResponse.json({ error: "paper_id and content are required" }, { status: 400 })
        }

        const newComment = await db.createComment({
            user_id: user.id,
            paper_id,
            content,
            parent_id,
        })

        return NextResponse.json(newComment, { status: 201 })
    } catch (error) {
        console.error("Error in POST /api/comments:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
} 