import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET(request: NextRequest) {
  console.log("[Articles List] Route called")

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      console.log("[Articles List] Missing configuration")
      return NextResponse.json(
        {
          error: "API configuration missing",
          details: {
            API_BASE_URL: API_BASE_URL ? "present" : "missing",
            API_TOKEN: API_TOKEN ? "present" : "missing",
            REPO_NAME: REPO_NAME,
          },
        },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"
    const state = searchParams.get("state") || "open"
    const keyword = searchParams.get("keyword")
    const labels = searchParams.get("labels")
    const authors = searchParams.get("authors")

    const apiParams = new URLSearchParams({
      page,
      page_size: pageSize,
      state,
    })

    if (keyword) apiParams.append("keyword", keyword)
    if (labels) apiParams.append("labels", labels)
    if (authors) apiParams.append("authors", authors)

    const apiUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues?${apiParams.toString()}`
    console.log(`[Articles List] Fetching from: ${apiUrl}`)
    console.log(`[Articles List] Using token: ${API_TOKEN.substring(0, 10)}...`)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    console.log(`[Articles List] API responded with status: ${response.status}`)
    console.log(`[Articles List] Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Articles List] API Error: ${response.status} ${response.statusText}`)
      console.error(`[Articles List] Error body:`, errorText)

      // If no articles found, return empty array instead of error
      if (response.status === 404) {
        console.log(`[Articles List] No articles found, returning empty array`)
        return NextResponse.json([])
      }

      return NextResponse.json(
        {
          error: `Failed to fetch articles: ${response.status} ${response.statusText}`,
          details: errorText,
          apiUrl: apiUrl,
          config: {
            API_BASE_URL,
            REPO_NAME,
            requestParams: Object.fromEntries(apiParams.entries()),
          },
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("[Articles List] Failed to parse JSON response", parseError)
      return NextResponse.json(
        {
          error: "API returned invalid JSON",
          details: parseError.message,
        },
        { status: 500 },
      )
    }

    console.log(`[Articles List] API returned data type: ${Array.isArray(data) ? "array" : typeof data}`)
    console.log(`[Articles List] API returned ${Array.isArray(data) ? data.length : "non-array"} items`)

    // Log first item for debugging
    if (Array.isArray(data) && data.length > 0) {
      console.log(`[Articles List] Sample item:`, JSON.stringify(data[0], null, 2))
    }

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn("[Articles List] API did not return an array:", data)
      return NextResponse.json([])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Articles List] Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 },
    )
  }
}
