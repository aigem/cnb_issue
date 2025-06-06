import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
    }

    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { issueNumber, body } = await request.json()

    if (!issueNumber || !body) {
      return NextResponse.json({ error: "Issue number and body are required" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${issueNumber}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ body }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json({ error: `Failed to post comment: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error posting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
