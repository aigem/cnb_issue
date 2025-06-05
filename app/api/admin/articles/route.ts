import { NextResponse } from "next/server"
import { getArticles } from "@/lib/api"

export async function GET() {
  try {
    const articles = await getArticles({ pageSize: 20 })
    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching articles for admin:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
