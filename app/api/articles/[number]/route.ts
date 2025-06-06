import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET(request: NextRequest, { params }: { params: { number: string } }) {
  const resolvedParams = await params
  console.log(`[Article Detail] Route called for article ${resolvedParams.number}`)

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const apiUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues/${resolvedParams.number}`
    console.log(`[Article Detail] Fetching from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    })

    console.log(`[Article Detail] API responded with status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 })
      }
      const errorText = await response.text()
      console.error(`[Article Detail] API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        { error: `Failed to fetch article: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[Article Detail] Article data loaded successfully`)

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[Article Detail] Error fetching article ${resolvedParams.number}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
