import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeLikeStatus = searchParams.get("include_like_status") === "true"

    const paper = await db.getPaperById(id)

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    // Increment views, but don't wait for it
    db.incrementPaperViews(id)

    if (!includeLikeStatus) {
    return NextResponse.json(paper)
    }

    let response = NextResponse.json(paper)
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

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const isLiked = await db.isPaperLikedByUser(id, user.id)
      const paperWithLikeStatus = { ...paper, is_liked_by_user: isLiked }
      return NextResponse.json(paperWithLikeStatus)
    }

    return NextResponse.json({ ...paper, is_liked_by_user: false })
  } catch (error) {
    console.error("Error fetching paper:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
