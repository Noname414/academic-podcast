import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined
    const sortBy = (searchParams.get("sortBy") as "created_at" | "views" | "likes") || "created_at"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("API Request params:", { category, search, sortBy, limit, offset })

    const papers = await db.getPapers({
      category: category === "all" ? undefined : category,
      search,
      sortBy,
      limit,
      offset,
    })

    console.log("Papers fetched:", papers.length)

    return NextResponse.json(papers)
  } catch (error) {
    console.error("Error in papers API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paper = await db.createPaper(body)

    if (!paper) {
      return NextResponse.json({ error: "Failed to create paper" }, { status: 400 })
    }

    return NextResponse.json(paper, { status: 201 })
  } catch (error) {
    console.error("Error creating paper:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
