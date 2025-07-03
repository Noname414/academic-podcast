import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: userIdToDelete } = await params

    // First, verify the requesting user is authenticated (and ideally an admin)
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

    if (user.id === userIdToDelete) {
        return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 })
    }

    // Check if the admin client is available
    if (!supabaseAdmin) {
        return NextResponse.json({ error: "Admin client not initialized. Check server environment variables." }, { status: 500 })
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true, message: `User ${userIdToDelete} deleted successfully.` })
    } catch (error) {
        console.error(`Error deleting user ${userIdToDelete}:`, error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ error: "Failed to delete user.", message: errorMessage }, { status: 500 })
    }
} 