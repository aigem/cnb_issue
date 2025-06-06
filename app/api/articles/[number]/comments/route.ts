import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET(request: NextRequest, { params }: { params: { number: string } }) {
  console.log(`[Article Comments] Route called for article ${params.number}`)

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "30"

    const apiUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues/${params.number}/comments?page=${page}&page_size=${pageSize}`
    console.log(`[Article Comments] Fetching from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    })

    console.log(`[Article Comments] API responded with status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Article Comments] API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        { error: `Failed to fetch comments: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[Article Comments] Comments loaded: ${Array.isArray(data) ? data.length : "non-array"} items`)

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn("[Article Comments] API did not return an array:", data)
      return NextResponse.json([])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[Article Comments] Error fetching comments for article ${params.number}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
