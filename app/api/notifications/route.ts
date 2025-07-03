import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest) {
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
        return NextResponse.json([], { status: 401 })
    }

    try {
        const notifications = await db.getNotifications(user.id)
        return NextResponse.json(notifications)
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json([], { status: 500 })
    }
} 