import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET(request: NextRequest) {
  console.log("[Health Check] Route called")

  try {
    // Check environment variables
    if (!API_BASE_URL) {
      console.log("[Health Check] Missing API_BASE_URL")
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_API_BASE_URL environment variable is missing",
          status: "error",
          config: {
            API_BASE_URL: "missing",
            API_TOKEN: API_TOKEN ? "present" : "missing",
            REPO_NAME: REPO_NAME,
          },
        },
        { status: 500 },
      )
    }

    if (!API_TOKEN) {
      console.log("[Health Check] Missing API_TOKEN")
      return NextResponse.json(
        {
          error: "API_TOKEN environment variable is missing",
          status: "error",
          config: {
            API_BASE_URL: API_BASE_URL,
            API_TOKEN: "missing",
            REPO_NAME: REPO_NAME,
          },
        },
        { status: 500 },
      )
    }

    const testUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues?page=1&page_size=1`
    console.log(`[Health Check] Testing API connection to ${testUrl}`)

    // Test API connection
    const response = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log(`[Health Check] API responded with status ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Health Check] API Error: ${response.status} ${response.statusText}`, errorText)

      return NextResponse.json(
        {
          error: `API returned ${response.status}: ${response.statusText}`,
          status: "error",
          details: errorText,
          config: {
            API_BASE_URL: API_BASE_URL,
            API_TOKEN: "present",
            REPO_NAME: REPO_NAME,
            testUrl: testUrl,
          },
        },
        { status: response.status },
      )
    }

    // Try to parse response
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("[Health Check] Failed to parse JSON response", parseError)
      return NextResponse.json(
        {
          error: "API returned invalid JSON",
          status: "error",
          details: parseError.message,
        },
        { status: 500 },
      )
    }

    console.log("[Health Check] API response parsed successfully")

    return NextResponse.json({
      status: "ok",
      message: "API connection successful",
      timestamp: new Date().toISOString(),
      config: {
        API_BASE_URL: API_BASE_URL,
        API_TOKEN: "present",
        REPO_NAME: REPO_NAME,
        testUrl: testUrl,
      },
      apiResponse: {
        server: response.headers.get("server") || "unknown",
        dataType: Array.isArray(data) ? "array" : typeof data,
        itemCount: Array.isArray(data) ? data.length : null,
        sampleData: Array.isArray(data) && data.length > 0 ? data[0] : data,
      },
    })
  } catch (error) {
    console.error("[Health Check] Health check failed:", error)

    return NextResponse.json(
      {
        error: "Health check failed",
        status: "error",
        details: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString(),
        config: {
          API_BASE_URL: API_BASE_URL || "missing",
          API_TOKEN: API_TOKEN ? "present" : "missing",
          REPO_NAME: REPO_NAME,
        },
      },
      { status: 500 },
    )
  }
}

// Explicitly export other HTTP methods to prevent conflicts
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
