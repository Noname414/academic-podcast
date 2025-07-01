import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("Fetching paper with ID:", id)

    const paper = await db.getPaperById(id)

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 })
    }

    // 增加觀看次數
    await db.incrementPaperViews(id)

    return NextResponse.json(paper)
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
