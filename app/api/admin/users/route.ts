import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-service"
import { withAdminAuth } from "@/lib/admin-auth"

async function getHandler(request: NextRequest) {
    try {
        const users = await db.getUsers()
        return NextResponse.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export const GET = withAdminAuth(getHandler) 