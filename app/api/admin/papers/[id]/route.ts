import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: paperIdToDelete } = await params

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
        const result = await db.deletePaper(paperIdToDelete)
        return NextResponse.json(result)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ error: "Failed to delete paper.", message: errorMessage }, { status: 500 })
    }
} 