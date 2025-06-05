import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

// Helper to check API configuration
function checkApiConfig() {
  if (!API_BASE_URL || !API_TOKEN) {
    throw new Error("API configuration missing")
  }
}

// POST handler to add labels to an issue
export async function POST(request: NextRequest, { params }: { params: { number: string } }) {
  try {
    checkApiConfig()
    const { number } = params
    const { labels } = await request.json()

    if (!Array.isArray(labels) || labels.some(label => typeof label !== 'string')) {
      return NextResponse.json({ error: "Invalid labels format. Expects an array of strings." }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}/labels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ labels }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Failed to add labels: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /labels:", error)
    if (error.message === "API configuration missing") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT handler to set/replace all labels for an issue
export async function PUT(request: NextRequest, { params }: { params: { number: string } }) {
  try {
    checkApiConfig()
    const { number } = params
    const { labels } = await request.json()

    if (!Array.isArray(labels) || labels.some(label => typeof label !== 'string')) {
      return NextResponse.json({ error: "Invalid labels format. Expects an array of strings." }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}/labels`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ labels }), // Gitea API for setting labels expects { "labels": ["label1", "label2"] }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Failed to set labels: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /labels:", error)
    if (error.message === "API configuration missing") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
