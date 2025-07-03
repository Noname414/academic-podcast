import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function POST(request: NextRequest) {
    let response = NextResponse.next()
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

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { notificationIds } = await request.json()
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: "notificationIds must be an array" }, { status: 400 })
        }

        const result = await db.markNotificationsAsRead(notificationIds, user.id)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 