import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const paperId = params.id
  let response = NextResponse.next()

  try {
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

    const isLiked = await db.togglePaperLike(paperId, user.id)

    return NextResponse.json({ isLiked })
  } catch (error) {
    console.error(`Error in POST /api/papers/${paperId}/like:`, error)
    
    // Check if the error is due to the function not existing
    if (error instanceof Error && error.message.includes('function "toggle_paper_like" does not exist')) {
        return NextResponse.json(
            {
              error: "Database function not found.",
              message: "The 'toggle_paper_like' function needs to be created in the database.",
              remediation: "Run the following SQL in your Supabase SQL Editor to create the function.",
              sql: `
CREATE OR REPLACE FUNCTION toggle_paper_like(p_paper_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_liked BOOLEAN;
BEGIN
  -- Check if the user already liked the paper
  SELECT EXISTS (
    SELECT 1 FROM paper_likes WHERE paper_id = p_paper_id AND user_id = p_user_id
  ) INTO is_liked;

  IF is_liked THEN
    -- Unlike the paper
    DELETE FROM paper_likes WHERE paper_id = p_paper_id AND user_id = p_user_id;
    UPDATE papers SET likes = likes - 1 WHERE id = p_paper_id AND likes > 0;
    RETURN FALSE;
  ELSE
    -- Like the paper
    INSERT INTO paper_likes (paper_id, user_id) VALUES (p_paper_id, p_user_id);
    UPDATE papers SET likes = likes + 1 WHERE id = p_paper_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;
              `
            },
            { status: 501 } // Not Implemented
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