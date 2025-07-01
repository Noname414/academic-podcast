import { NextResponse } from "next/server"
import { db } from "@/lib/database-service"

export async function GET() {
  try {
    console.log("Fetching stats...")
    const stats = await db.getStats()
    console.log("Stats fetched:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
