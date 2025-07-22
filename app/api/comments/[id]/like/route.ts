import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: commentId } = await params
    let response = NextResponse.next()

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name: string) => request.cookies.get(name)?.value,
                    set: (name: string, value: string, options: CookieOptions) => {
                        request.cookies.set({ name, value, ...options })
                        response = NextResponse.next({ request: { headers: request.headers } })
                        response.cookies.set({ name, value, ...options })
                    },
                    remove: (name: string, options: CookieOptions) => {
                        request.cookies.set({ name, value: "", ...options })
                        response = NextResponse.next({ request: { headers: request.headers } })
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

        const isLiked = await db.toggleCommentLike(commentId, user.id)

        // Create a notification if the comment was liked
        if (isLiked) {
            const likedComment = await db.getCommentById(commentId);
            if (likedComment && likedComment.user_id !== user.id) {
                await db.createNotification({
                    user_id: likedComment.user_id,
                    type: 'comment_like',
                    triggering_user_id: user.id,
                    related_comment_id: commentId,
                    related_paper_id: likedComment.paper_id,
                })
            }
        }

        return NextResponse.json({ isLiked })
    } catch (error) {
        console.error(`Error in POST /api/comments/${commentId}/like:`, error)

        if (error instanceof Error && error.message.includes('function "toggle_comment_like" does not exist')) {
            return NextResponse.json(
                {
                    error: "Database function not found.",
                    message: "The 'toggle_comment_like' function needs to be created in the database.",
                    remediation: "Run the following SQL in your Supabase SQL Editor to create the function.",
                    sql: `
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_liked BOOLEAN;
BEGIN
  -- Check if the user already liked the comment
  SELECT EXISTS (
    SELECT 1 FROM comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id
  ) INTO is_liked;

  IF is_liked THEN
    -- Unlike the comment
    DELETE FROM comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
    UPDATE comments SET likes = likes - 1 WHERE id = p_comment_id AND likes > 0;
    RETURN FALSE;
  ELSE
    -- Like the comment
    INSERT INTO comment_likes (comment_id, user_id) VALUES (p_comment_id, p_user_id);
    UPDATE comments SET likes = likes + 1 WHERE id = p_comment_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;
          `,
                },
                { status: 501 }, // Not Implemented
            )
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
} 