import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { title, body, labels } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    const payload: any = { title, body }
    if (labels && labels.length > 0) {
      payload.labels = labels
    }

    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json({ error: `Failed to create article: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { number, title, body, state } = await request.json()

    if (!number) {
      return NextResponse.json({ error: "Article number is required" }, { status: 400 })
    }

    const payload: any = {}
    if (title) payload.title = title
    if (body) payload.body = body
    if (state) payload.state = state

    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json({ error: `Failed to update article: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
