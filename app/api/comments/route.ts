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

        // Check for user to fetch their like status on the comments
        let response = NextResponse.json(comments)
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => request.cookies.get(name)?.value,
                },
            },
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (user && comments.length > 0) {
            const commentIds = comments.map(c => c.id)
            const likedCommentIds = await db.getCommentLikesForUser(commentIds, user.id)

            const commentsWithLikeStatus = comments.map(comment => ({
                ...comment,
                is_liked_by_user: likedCommentIds.includes(comment.id)
            }))
            return NextResponse.json(commentsWithLikeStatus)
        }

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

        // Create a notification if it's a reply
        if (parent_id && user) {
            const parentComment = await db.getCommentById(parent_id)
            if (parentComment && parentComment.user_id !== user.id) {
                await db.createNotification({
                    user_id: parentComment.user_id,
                    type: 'new_reply',
                    triggering_user_id: user.id,
                    related_comment_id: newComment.id,
                    related_paper_id: paper_id,
                })
            }
        }

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